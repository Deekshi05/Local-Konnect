from django.shortcuts import render
from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Avg, F
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from .models import TrustConnection, QuickJob, QuickJobInterest, TrustScoreLog
from .serializers import (
    TrustConnectionSerializer, QuickJobSerializer, QuickJobCreateSerializer,
    QuickJobInterestSerializer, TrustScoreLogSerializer,
    TrustedContractorRecommendationSerializer
)
from accounts.models import Contractor
from accounts.serializers import ContractorSerializer
from .gemini_service import gemini_service
import json


class TrustConnectionListCreateView(generics.ListCreateAPIView):
    serializer_class = TrustConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TrustConnection.objects.filter(
            recommender=self.request.user
        ).select_related(
            'recommender', 'contractor__user', 'service_context'
        )
    
    def perform_create(self, serializer):
        # Set the recommender to the current user
        trust_connection = serializer.save(recommender=self.request.user)
        # Update contractor's trust score
        self.update_contractor_trust_score(trust_connection.contractor)
    
    def create(self, request, *args, **kwargs):
        """Override create to provide better error messages"""
        try:
            return super().create(request, *args, **kwargs)
        except serializers.ValidationError as e:
            # Handle validation errors from our custom validator
            print(f"Validation error creating trust connection: {e}")
            print(f"Request data: {request.data}")
            print(f"User: {request.user}")
            
            # Return the validation error as-is for better user feedback
            return Response(
                {'error': str(e.detail) if hasattr(e, 'detail') else str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error creating trust connection: {e}")
            print(f"Request data: {request.data}")
            print(f"User: {request.user}")
            
            # Check if it's a duplicate recommendation
            contractor_id = request.data.get('contractor')
            if contractor_id:
                existing = TrustConnection.objects.filter(
                    recommender=request.user,
                    contractor_id=contractor_id
                ).exists()
                if existing:
                    return Response(
                        {'error': 'You have already recommended this contractor'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Return original error for other cases
            raise e
    
    def update_contractor_trust_score(self, contractor):
        """Calculate and update contractor's trust score"""
        # Get all recommendations for this contractor
        recommendations = TrustConnection.objects.filter(contractor=contractor)
        
        if recommendations.exists():
            # Simple weighted average for now
            total_score = sum(rec.trust_level for rec in recommendations)
            new_score = total_score / recommendations.count()
            
            old_score = contractor.trust_score
            contractor.trust_score = new_score
            contractor.save()
            
            # Log the change
            TrustScoreLog.objects.create(
                contractor=contractor,
                old_score=old_score,
                new_score=new_score,
                reason="New recommendation received",
                calculation_details={
                    'total_recommendations': recommendations.count(),
                    'average_trust_level': new_score
                }
            )


class QuickJobListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuickJobCreateSerializer
        return QuickJobSerializer
    
    def get_queryset(self):
        queryset = QuickJob.objects.select_related(
            'customer', 'service', 'assigned_contractor__user'
        ).prefetch_related('interests__contractor__user')
        
        # For contractors viewing jobs, filter by location AND services they provide
        if hasattr(self.request.user, 'contractor'):
            contractor = self.request.user.contractor
            
            # Get the services this contractor provides
            from needs.models import ContractorServices
            contractor_service_ids = ContractorServices.objects.filter(
                contractor=contractor
            ).values_list('service_id', flat=True)
            
            # Filter jobs to show only those in the contractor's city and state
            # AND for services that the contractor provides
            queryset = queryset.filter(
                customer__customer__city=contractor.city,
                customer__customer__state=contractor.state,
                service_id__in=contractor_service_ids  # Only show jobs for services contractor provides
            )
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by urgency if provided
        urgency_filter = self.request.query_params.get('urgency')
        if urgency_filter:
            queryset = queryset.filter(urgency=urgency_filter)
        
        # Filter by service if provided
        service_filter = self.request.query_params.get('service')
        if service_filter:
            queryset = queryset.filter(service_id=service_filter)
        
        return queryset.order_by('-created_at')


class QuickJobDetailView(generics.RetrieveUpdateAPIView):
    queryset = QuickJob.objects.select_related(
        'customer', 'service', 'assigned_contractor__user'
    ).prefetch_related('interests__contractor__user')
    serializer_class = QuickJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Ensure users can only access their own jobs"""
        return self.queryset.filter(customer=self.request.user)
    
    def perform_update(self, serializer):
        """Handle special logic for job completion"""
        if 'status' in serializer.validated_data:
            if serializer.validated_data['status'] == QuickJob.JobStatus.COMPLETED:
                # Auto-set completion time if not provided
                if 'completed_at' not in serializer.validated_data:
                    from django.utils import timezone
                    serializer.validated_data['completed_at'] = timezone.now()
        serializer.save()


class QuickJobInterestCreateView(generics.CreateAPIView):
    serializer_class = QuickJobInterestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Get contractor profile for current user
        try:
            contractor = Contractor.objects.get(user=self.request.user)
            serializer.save(contractor=contractor)
        except Contractor.DoesNotExist:
            return Response(
                {'error': 'Only contractors can express interest in jobs'},
                status=status.HTTP_403_FORBIDDEN
            )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_quick_job(request, job_id):
    """Assign a quick job to a contractor"""
    try:
        quick_job = QuickJob.objects.get(id=job_id, customer=request.user)
        contractor_id = request.data.get('contractor_id')
        proposed_price = request.data.get('proposed_price')  # New field for contractor's proposed price
        
        if not contractor_id:
            return Response(
                {'error': 'contractor_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        contractor = Contractor.objects.get(id=contractor_id)
        
        with transaction.atomic():
            quick_job.assigned_contractor = contractor
            quick_job.status = QuickJob.JobStatus.ASSIGNED
            quick_job.assigned_at = timezone.now()
            
            # Set the budget to contractor's proposed price if provided
            if proposed_price is not None:
                quick_job.budget_suggestion = proposed_price
            
            quick_job.save()
        
        serializer = QuickJobSerializer(quick_job)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except QuickJob.DoesNotExist:
        return Response(
            {'error': 'Quick job not found or not owned by user'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Contractor.DoesNotExist:
        return Response(
            {'error': 'Contractor not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def trusted_contractors(request):
    """Get trusted contractors based on social network recommendations"""
    user = request.user
    service_id = request.query_params.get('service')
    
    # Get contractors recommended by user's network (1st and 2nd degree)
    # 1st degree: Direct recommendations from user
    first_degree_recommendations = TrustConnection.objects.filter(
        recommender=user
    ).values_list('contractor_id', flat=True)
    
    # 2nd degree: Recommendations from people user has recommended
    user_trusted_people = TrustConnection.objects.filter(
        recommender=user
    ).values_list('contractor__user_id', flat=True)
    
    second_degree_recommendations = TrustConnection.objects.filter(
        recommender__id__in=user_trusted_people
    ).exclude(
        contractor_id__in=first_degree_recommendations
    ).values_list('contractor_id', flat=True)
    
    # Build contractor recommendations with trust scores
    recommendations = []
    
    # Process 1st degree recommendations (weight: 10)
    for contractor_id in first_degree_recommendations:
        try:
            contractor = Contractor.objects.select_related('user').get(id=contractor_id)
            direct_recs = TrustConnection.objects.filter(
                recommender=user, contractor=contractor
            ).count()
            
            recommendations.append({
                'contractor': contractor,
                'trust_score': contractor.trust_score,
                'recommendation_count': direct_recs,
                'direct_recommendations': direct_recs,
                'indirect_recommendations': 0,
                'connection_path': [user.first_name, contractor.user.first_name]
            })
        except Contractor.DoesNotExist:
            continue
    
    # Process 2nd degree recommendations (weight: 3)
    for contractor_id in second_degree_recommendations:
        try:
            contractor = Contractor.objects.select_related('user').get(id=contractor_id)
            indirect_recs = TrustConnection.objects.filter(
                recommender__id__in=user_trusted_people,
                contractor=contractor
            ).count()
            
            # Find connection path
            connector = TrustConnection.objects.filter(
                recommender__id__in=user_trusted_people,
                contractor=contractor
            ).first()
            
            path = [user.first_name]
            if connector:
                path.extend([connector.recommender.first_name, contractor.user.first_name])
            
            recommendations.append({
                'contractor': contractor,
                'trust_score': contractor.trust_score * 0.7,  # Reduced for 2nd degree
                'recommendation_count': indirect_recs,
                'direct_recommendations': 0,
                'indirect_recommendations': indirect_recs,
                'connection_path': path
            })
        except Contractor.DoesNotExist:
            continue
    
    # Filter by service if specified
    if service_id:
        # This would need service-contractor mapping logic
        pass
    
    # Sort by trust score
    recommendations.sort(key=lambda x: x['trust_score'], reverse=True)
    
    serializer = TrustedContractorRecommendationSerializer(recommendations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def parse_voice_query(request):
    """Parse natural language voice query (audio or text) into structured quick job data using Gemini AI"""
    
    # Check if audio file is provided
    audio_file = request.FILES.get('audio')
    raw_query = request.data.get('text_query', '') or request.data.get('query', '')
    language = request.data.get('language', 'auto')
    
    # If audio file is provided, convert to text first
    if audio_file:
        try:
            # For now, simulate audio processing based on language selection
            # In production, you would integrate with Google Speech-to-Text or similar
            # Only simulate if no text query is provided
            if not raw_query:
                import random
                from needs.models import Services
                
                # Get random service for more variety
                services = list(Services.objects.all())
                random_service = random.choice(services) if services else None
                
                # Generate varied queries based on selected language and random service
                if language == 'hi' or language == 'auto':
                    hindi_queries = [
                        f"मुझे {random_service.name if random_service else 'प्लंबर'} चाहिए तुरंत",
                        "AC ठीक करवाना है घर पर",
                        "इलेक्ट्रिशियन चाहिए बिजली का काम है",
                        "सफाई कराना है पूरे घर की",
                        "पेंटिंग का काम है दीवार पर",
                        "कारपेंटर चाहिए दरवाजा टूट गया है"
                    ]
                    raw_query = random.choice(hindi_queries)
                    detected_language = 'hi'
                elif language == 'en':
                    english_queries = [
                        f"I need {random_service.name if random_service else 'electrician'} urgently",
                        "Need plumber for water leakage",
                        "AC repair required immediately", 
                        "House cleaning service needed",
                        "Painting work for living room",
                        "Carpenter needed for door repair"
                    ]
                    raw_query = random.choice(english_queries)
                    detected_language = 'en'
                elif language == 'mr':
                    marathi_queries = [
                        f"मला {random_service.name if random_service else 'इलेक्ट्रिशियन'} हवा तातडीने",
                        "प्लंबरची गरज आहे पाण्याची समस्या",
                        "AC दुरुस्त करायची आहे",
                        "घराची साफसफाई करायची आहे",
                        "पेंटिंगचे काम आहे",
                        "सुतार हवा दार तुटला आहे"
                    ]
                    raw_query = random.choice(marathi_queries)
                    detected_language = 'mr'
                elif language == 'gu':
                    gujarati_queries = [
                        f"મને {random_service.name if random_service else 'કારપેન્ટર'} જોઈએ છે તાત્કાલિક",
                        "પ્લંબર જોઈએ પાણીની સમસ્યા છે",
                        "AC રિપેર કરવાનું છે",
                        "ઘરની સફાઈ કરાવવી છે",
                        "પેઈન્ટિંગનું કામ છે",
                        "ઇલેક્ટ્રિશિયન જોઈએ લાઇટ બંધ છે"
                    ]
                    raw_query = random.choice(gujarati_queries)
                    detected_language = 'gu'
                else:
                    general_queries = [
                        f"Need {random_service.name if random_service else 'service provider'} urgently",
                        "Repair work needed at home",
                        "Professional help required",
                        "Service person needed ASAP",
                        "Fix broken appliance"
                    ]
                    raw_query = random.choice(general_queries)
                    detected_language = 'en'
            else:
                # Use the provided text query as-is (real audio-to-text conversion would happen here)
                detected_language = language if language != 'auto' else 'en'
                
        except Exception as e:
            return Response(
                {'error': f'Error processing audio: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        detected_language = language if language != 'auto' else 'en'
    
    if not raw_query:
        return Response(
            {'error': 'Query text or audio file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Use Gemini service to parse the query
        parsed_intent = gemini_service.parse_voice_query(raw_query)
        
        # Add detected language to parsed intent
        parsed_intent['detected_language'] = detected_language
        
        # Get service suggestions if available
        service_suggestions = gemini_service.get_service_suggestions(raw_query)
        
        # Find best matching service using improved logic
        service_id = None
        service_name = "General Service"
        
        # First try to get service_id directly from parsed_intent if available
        if parsed_intent.get('service_id'):
            try:
                from needs.models import Services
                service = Services.objects.get(id=parsed_intent.get('service_id'))
                service_id = service.id
                service_name = service.name
            except Services.DoesNotExist:
                pass
        
        # If no direct service_id, try service suggestions
        if not service_id and service_suggestions:
            best_match = service_suggestions[0] if service_suggestions else None
            if best_match and best_match.get('id'):
                service_id = best_match.get('id')
                service_name = best_match.get('name', 'General Service')
        
        # If still no service found, try matching service category to available services
        if not service_id and parsed_intent.get('service_category'):
            try:
                from needs.models import Services
                category = parsed_intent.get('service_category', '').lower()
                
                # Enhanced service category mapping
                category_mappings = {
                    'electrical': ['Electrical', 'AC Repair', 'Appliance Repair'],
                    'plumbing': ['Plumbing'],
                    'cleaning': ['Cleaning', 'House Cleaning'],
                    'painting': ['Painting'],
                    'carpentry': ['Carpentry'],
                    'hvac': ['HVAC', 'AC Repair'],
                    'repairs': ['AC Repair', 'Appliance Repair'],
                    'construction': ['Construction', 'Tiling', 'Roofing'],
                    'landscaping': ['Landscaping', 'Gardening'],
                    'security': ['Security'],
                    'pest': ['Pest Control']
                }
                
                # Try direct mapping first
                potential_services = category_mappings.get(category, [category.capitalize()])
                
                for service_name_candidate in potential_services:
                    service = Services.objects.filter(name__iexact=service_name_candidate).first()
                    if service:
                        service_id = service.id
                        service_name = service.name
                        break
                
                # If no exact match, try partial matching
                if not service_id:
                    service = Services.objects.filter(name__icontains=category.capitalize()).first()
                    if service:
                        service_id = service.id
                        service_name = service.name
                        
            except Exception as e:
                print(f"Error finding service from category: {e}")
                pass
        
        # Create suggested quick job data
        suggested_quick_job = {
            'title': parsed_intent.get('suggested_title', 'Service Request'),
            'description': parsed_intent.get('suggested_description', f"Request: {raw_query}"),
            'urgency': parsed_intent.get('urgency', 'MEDIUM'),
            'service_id': service_id,
            'service_name': service_name,
            'location': parsed_intent.get('location_mentioned', ''),
            'budget_suggestion': parsed_intent.get('budget_mentioned'),
            'detected_language': detected_language
        }
        
        # Remove None values
        suggested_quick_job = {k: v for k, v in suggested_quick_job.items() if v is not None}
        
        return Response({
            'raw_query': raw_query,
            'detected_language': detected_language,
            'parsed_intent': parsed_intent,
            'suggested_quick_job': suggested_quick_job,
            'service_suggestions': service_suggestions,
            'parsing_method': 'gemini_ai' if gemini_service.model else 'rule_based'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Fallback error response
        return Response({
            'error': f'Error parsing query: {str(e)}',
            'raw_query': raw_query,
            'detected_language': detected_language if 'detected_language' in locals() else 'en',
            'suggested_quick_job': {
                'title': 'Service Request',
                'description': f"Request: {raw_query}",
                'urgency': 'MEDIUM',
                'service_name': 'General Service'
            }
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def get_service_suggestions(request):
    """Get service suggestions based on natural language query"""
    query = request.data.get('query', '')
    
    if not query:
        return Response(
            {'error': 'Query text is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        suggestions = gemini_service.get_service_suggestions(query)
        return Response({
            'query': query,
            'suggestions': suggestions
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': f'Error getting suggestions: {str(e)}',
            'suggestions': []
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_voice_parsing(request):
    """Test endpoint for voice parsing functionality"""
    query = request.data.get('query', 'AC repair urgently needed')
    
    try:
        # Test the Gemini service directly
        parsed_intent = gemini_service.parse_voice_query(query)
        
        return Response({
            'status': 'success',
            'gemini_available': gemini_service.model is not None,
            'query': query,
            'parsed_intent': parsed_intent,
            'api_key_configured': bool(getattr(settings, 'GEMINI_API_KEY', None))
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'error': str(e),
            'gemini_available': gemini_service.model is not None,
            'api_key_configured': bool(getattr(settings, 'GEMINI_API_KEY', None))
        }, status=status.HTTP_200_OK)


class MyQuickJobsView(generics.ListAPIView):
    """Get current user's quick jobs"""
    serializer_class = QuickJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return QuickJob.objects.filter(
            customer=self.request.user
        ).select_related(
            'service', 'assigned_contractor__user'
        ).prefetch_related('interests__contractor__user')
    #Pramodh Edit


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def contractor_work_history(request, contractor_id):
    """
    Get recent work history for a specific contractor
    """
    try:
        contractor = Contractor.objects.get(id=contractor_id)
        
        # Get completed tenders
        from works.models import Tenders
        completed_tenders = Tenders.objects.filter(
            selected_contractor=contractor,
            status='completed'
        ).select_related('customer__user', 'service').order_by('-updated_at')[:5]
        
        # Get completed quick jobs
        completed_quick_jobs = QuickJob.objects.filter(
            assigned_contractor=contractor,
            status='COMPLETED'
        ).select_related('customer', 'service').order_by('-updated_at')[:5]
        
        # Prepare tender data
        tender_data = []
        for tender in completed_tenders:
            tender_data.append({
                'id': tender.id,
                'type': 'tender',
                'title': tender.title,
                'service': tender.service.name,
                'customer_name': f"{tender.customer.user.first_name} {tender.customer.user.last_name}",
                'location': tender.location,
                'completed_date': tender.updated_at,
                'budget': float(tender.budget) if tender.budget else None
            })
        
        # Prepare quick job data
        quick_job_data = []
        for job in completed_quick_jobs:
            quick_job_data.append({
                'id': job.id,
                'type': 'quick_job',
                'title': job.title,
                'service': job.service.name,
                'customer_name': f"{job.customer.first_name} {job.customer.last_name}",
                'location': job.location,
                'completed_date': job.completed_at or job.updated_at,
                'budget': float(job.budget_suggestion) if job.budget_suggestion else None
            })
        
        # Combine and sort by completion date
        all_work = tender_data + quick_job_data
        all_work.sort(key=lambda x: x['completed_date'], reverse=True)
        
        return Response({
            'contractor_id': contractor_id,
            'contractor_name': f"{contractor.user.first_name} {contractor.user.last_name}",
            'recent_work': all_work[:10],  # Return latest 10 completed works
            'total_completed_tenders': completed_tenders.count(),
            'total_completed_quick_jobs': completed_quick_jobs.count()
        })
        
    except Contractor.DoesNotExist:
        return Response(
            {'error': 'Contractor not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def customer_worked_contractors(request):
    """
    Get contractors that the current customer has completed work with
    """
    try:
        # Try to get customer profile, create if doesn't exist
        try:
            customer = request.user.customer
        except:
            # User doesn't have customer profile, return empty
            return Response({
                'worked_contractors': [],
                'total_contractors': 0
            })
        
        worked_contractors = []
        
        # Get contractors from completed tenders
        from works.models import Tenders
        completed_tenders = Tenders.objects.filter(
            customer=customer,
            status='completed',
            selected_contractor__isnull=False
        ).select_related('selected_contractor__user', 'service')
        
        # Get contractors from completed quick jobs
        completed_quick_jobs = QuickJob.objects.filter(
            customer=request.user,
            status='COMPLETED',
            assigned_contractor__isnull=False
        ).select_related('assigned_contractor__user', 'service')
        
        # Build contractor data with work history
        contractor_work_map = {}
        
        # Process tenders
        for tender in completed_tenders:
            contractor = tender.selected_contractor
            if contractor.id not in contractor_work_map:
                contractor_work_map[contractor.id] = {
                    'contractor': contractor,
                    'tenders': [],
                    'quick_jobs': []
                }
            contractor_work_map[contractor.id]['tenders'].append({
                'id': tender.id,
                'title': tender.title,
                'service': tender.service.name,
                'location': tender.location,
                'completed_date': tender.updated_at,
                'budget': float(tender.budget) if tender.budget else None
            })
        
        # Process quick jobs
        for job in completed_quick_jobs:
            contractor = job.assigned_contractor
            if contractor.id not in contractor_work_map:
                contractor_work_map[contractor.id] = {
                    'contractor': contractor,
                    'tenders': [],
                    'quick_jobs': []
                }
            contractor_work_map[contractor.id]['quick_jobs'].append({
                'id': job.id,
                'title': job.title,
                'service': job.service.name,
                'location': job.location,
                'completed_date': job.completed_at or job.updated_at,
                'budget': float(job.budget_suggestion) if job.budget_suggestion else None
            })
        
        # Format response
        for contractor_id, work_data in contractor_work_map.items():
            contractor = work_data['contractor']
            all_work = work_data['tenders'] + work_data['quick_jobs']
            all_work.sort(key=lambda x: x['completed_date'], reverse=True)
            
            worked_contractors.append({
                'id': contractor.id,
                'user': {
                    'first_name': contractor.user.first_name,
                    'last_name': contractor.user.last_name,
                },
                'city': contractor.city,
                'state': contractor.state,
                'rating': float(contractor.rating),
                'experience': contractor.experience,
                'trust_score': contractor.trust_score,
                'address': contractor.address,
                'work_history': {
                    'total_tenders': len(work_data['tenders']),
                    'total_quick_jobs': len(work_data['quick_jobs']),
                    'recent_work': all_work[:5],  # Latest 5 projects
                    'all_work': all_work
                }
            })
        
        return Response({
            'worked_contractors': worked_contractors,
            'total_contractors': len(worked_contractors)
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def contractor_assigned_jobs(request):
    """Get jobs assigned to the current contractor"""
    try:
        # Get the contractor profile for the current user
        try:
            contractor = Contractor.objects.get(user=request.user)
        except Contractor.DoesNotExist:
            # Return empty list if contractor profile doesn't exist
            return Response([])
        
        # Get jobs assigned to this contractor
        assigned_jobs = QuickJob.objects.filter(
            assigned_contractor=contractor,
            status='ASSIGNED'
        ).select_related(
            'customer', 'service', 'assigned_contractor__user'
        ).prefetch_related('interests__contractor__user')
        
        # Serialize the jobs
        jobs_data = []
        for job in assigned_jobs:
            job_data = {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'location': job.location,
                'urgency': job.urgency,
                'status': job.status,
                'budget_suggestion': str(job.budget_suggestion) if job.budget_suggestion else None,
                'created_at': job.created_at,
                'assigned_at': job.assigned_at,
                'customer_details': {
                    'user': {
                        'first_name': job.customer.first_name,
                        'last_name': job.customer.last_name,
                        'phone_number': job.customer.phone_number,
                    }
                } if job.customer else None,
                'service_details': {
                    'name': job.service.name
                } if job.service else None,
                'interests': []
            }
            jobs_data.append(job_data)
        
        return Response(jobs_data)
        
    except Exception as e:
        print(f"Error in contractor_assigned_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def contractor_completed_jobs(request):
    """Get jobs completed by the current contractor"""
    try:
        # Get the contractor profile for the current user
        try:
            contractor = Contractor.objects.get(user=request.user)
        except Contractor.DoesNotExist:
            # Return empty list if contractor profile doesn't exist
            return Response([])
        
        # Get jobs completed by this contractor
        completed_jobs = QuickJob.objects.filter(
            assigned_contractor=contractor,
            status='COMPLETED'
        ).select_related(
            'customer', 'service', 'assigned_contractor__user'
        ).prefetch_related('interests__contractor__user')
        
        # Serialize the jobs
        jobs_data = []
        for job in completed_jobs:
            job_data = {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'location': job.location,
                'urgency': job.urgency,
                'status': job.status,
                'budget_suggestion': str(job.budget_suggestion) if job.budget_suggestion else None,
                'created_at': job.created_at,
                'assigned_at': job.assigned_at,
                'completed_at': job.completed_at,
                'customer_details': {
                    'user': {
                        'first_name': job.customer.first_name,
                        'last_name': job.customer.last_name,
                        'phone_number': job.customer.phone_number,
                    }
                } if job.customer else None,
                'service_details': {
                    'name': job.service.name
                } if job.service else None,
                'interests': []
            }
            jobs_data.append(job_data)
        
        return Response(jobs_data)
        
    except Exception as e:
        print(f"Error in contractor_completed_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
