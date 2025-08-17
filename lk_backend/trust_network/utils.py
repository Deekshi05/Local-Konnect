"""
Trust network utility functions for calculating trust scores and recommendations.
"""
from django.db.models import Q, Count, Avg
from .models import TrustConnection, TrustScoreLog
from accounts.models import Contractor


def calculate_network_trust_score(contractor, requesting_user):
    """
    Calculate trust score for a contractor based on the requesting user's network.
    
    Algorithm:
    - 1st degree connections (direct recommendations): weight 10
    - 2nd degree connections (recommendations from trusted people): weight 3
    - Base trust score: contractor's overall trust_score
    
    Returns: Calculated network trust score
    """
    base_score = contractor.trust_score or 0.0
    
    # Get 1st degree recommendations (direct from requesting user)
    first_degree_recs = TrustConnection.objects.filter(
        recommender=requesting_user,
        contractor=contractor
    )
    
    if first_degree_recs.exists():
        # User has directly recommended this contractor
        direct_trust = first_degree_recs.first().trust_level
        return direct_trust * 10 + base_score
    
    # Get 2nd degree recommendations
    # First, find people the requesting user has recommended
    user_trusted_people = TrustConnection.objects.filter(
        recommender=requesting_user
    ).values_list('contractor__user_id', flat=True)
    
    # Then find recommendations from those people for this contractor
    second_degree_recs = TrustConnection.objects.filter(
        recommender__id__in=user_trusted_people,
        contractor=contractor
    )
    
    if second_degree_recs.exists():
        # Calculate weighted average of 2nd degree recommendations
        avg_trust = second_degree_recs.aggregate(Avg('trust_level'))['trust_level__avg']
        return (avg_trust * 3) + base_score
    
    # No network connection found, return base score
    return base_score


def find_trusted_contractors_for_service(requesting_user, service=None, max_results=10):
    """
    Find contractors trusted within the user's network for a specific service.
    
    Returns list of contractors with their network trust scores.
    """
    # Get all contractors in the network (1st and 2nd degree)
    first_degree_contractors = TrustConnection.objects.filter(
        recommender=requesting_user
    ).values_list('contractor_id', flat=True)
    
    user_trusted_people = TrustConnection.objects.filter(
        recommender=requesting_user
    ).values_list('contractor__user_id', flat=True)
    
    second_degree_contractors = TrustConnection.objects.filter(
        recommender__id__in=user_trusted_people
    ).exclude(
        contractor_id__in=first_degree_contractors
    ).values_list('contractor_id', flat=True)
    
    # Combine all network contractors
    network_contractor_ids = list(first_degree_contractors) + list(second_degree_contractors)
    
    if not network_contractor_ids:
        return []
    
    # Get contractor objects
    contractors = Contractor.objects.filter(
        id__in=network_contractor_ids
    ).select_related('user')
    
    # Calculate network trust scores
    trusted_contractors = []
    for contractor in contractors:
        network_score = calculate_network_trust_score(contractor, requesting_user)
        trusted_contractors.append({
            'contractor': contractor,
            'network_trust_score': network_score,
            'is_first_degree': contractor.id in first_degree_contractors
        })
    
    # Sort by network trust score
    trusted_contractors.sort(key=lambda x: x['network_trust_score'], reverse=True)
    
    return trusted_contractors[:max_results]


def update_contractor_trust_score(contractor):
    """
    Recalculate and update contractor's overall trust score based on all recommendations.
    """
    recommendations = TrustConnection.objects.filter(contractor=contractor)
    
    if not recommendations.exists():
        new_score = 0.0
    else:
        # Weighted average calculation
        total_weighted_score = 0
        total_weight = 0
        
        for rec in recommendations:
            # Weight recommendations based on recommender's own trust network
            recommender_network_size = TrustConnection.objects.filter(
                recommender=rec.recommender
            ).count()
            
            # Recommenders with larger networks get slightly higher weight
            weight = 1.0 + (recommender_network_size * 0.1)
            
            total_weighted_score += rec.trust_level * weight
            total_weight += weight
        
        new_score = total_weighted_score / total_weight if total_weight > 0 else 0.0
    
    old_score = contractor.trust_score or 0.0
    contractor.trust_score = new_score
    contractor.save()
    
    # Log the change
    TrustScoreLog.objects.create(
        contractor=contractor,
        old_score=old_score,
        new_score=new_score,
        reason="Trust score recalculation",
        calculation_details={
            'total_recommendations': recommendations.count(),
            'calculation_method': 'weighted_average_with_network_bonus'
        }
    )
    
    return new_score


def get_recommendation_path(recommender, contractor):
    """
    Find the path of recommendations between a user and contractor.
    """
    # Check direct connection
    direct = TrustConnection.objects.filter(
        recommender=recommender,
        contractor=contractor
    ).first()
    
    if direct:
        return [recommender.first_name, contractor.user.first_name]
    
    # Check 2nd degree connection
    user_trusted_people = TrustConnection.objects.filter(
        recommender=recommender
    ).values_list('contractor__user_id', flat=True)
    
    indirect = TrustConnection.objects.filter(
        recommender__id__in=user_trusted_people,
        contractor=contractor
    ).first()
    
    if indirect:
        return [
            recommender.first_name,
            indirect.recommender.first_name,
            contractor.user.first_name
        ]
    
    return []
