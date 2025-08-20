"""
Gemini AI integration for parsing natural language queries into structured job data.
Supports multiple languages including Hindi, English, and Hinglish.
"""
import google.generativeai as genai
import json
import re
from typing import Dict, Optional, List
from django.conf import settings
from needs.models import Services


class GeminiNLPService:
    def __init__(self):
        # Configure Gemini API
        # In production, add GEMINI_API_KEY to Django settings
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if api_key:
            genai.configure(api_key=api_key)
            # Use the correct model name for current Gemini API
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None
            print("Warning: GEMINI_API_KEY not configured. Using fallback parsing.")
    
    def parse_voice_query(self, query: str) -> Dict:
        """
        Parse natural language query into structured job data.
        
        Args:
            query: Raw voice/text query in Hindi, English, or Hinglish
            
        Returns:
            Dict with parsed intent, service category, urgency, etc.
        """
        if self.model:
            return self._parse_with_gemini(query)
        else:
            return self._fallback_parse(query)
    
    def _parse_with_gemini(self, query: str) -> Dict:
        """Parse using Gemini AI with structured prompt"""
        
        # Get available services for context
        services = Services.objects.all()
        service_list = [{"id": s.id, "name": s.name, "description": s.description} for s in services]
        
        prompt = f"""
        You are an AI assistant for a local services platform in India. Parse the following user query into structured job data.

        Available Services:
        {json.dumps(service_list, indent=2)}

        User Query: "{query}"

        Please analyze this query and return a JSON response with the following structure:
        {{
            "service_category": "electrical|plumbing|cleaning|painting|repairs|other",
            "service_id": <matching service ID from the list above, or null>,
            "urgency": "LOW|MEDIUM|HIGH|URGENT",
            "suggested_title": "Brief job title in English",
            "suggested_description": "Detailed description in English",
            "keywords": ["list", "of", "relevant", "keywords"],
            "location_mentioned": "any location mentioned in query or null",
            "budget_mentioned": "any budget amount mentioned or null",
            "time_preference": "any time mentioned (today, tomorrow, ASAP, etc.) or null",
            "confidence": 0.85,
            "language_detected": "hindi|english|hinglish|other",
            "original_query": "{query}"
        }}

        Language Context:
        - "theek karna/karvana" = repair/fix
        - "urgent/turant" = urgent
        - "wala/wali" = person who does (electrician, plumber, etc.)
        - "chahiye" = need/want
        - "AC" = Air Conditioner
        - "paani" = water
        - "bijli" = electricity
        - "safai" = cleaning

        Common Patterns:
        - "AC theek karne wala chahiye" = Need AC repair person
        - "Plumber urgent chahiye" = Need plumber urgently
        - "Ghar ki safai karvani hai" = Need house cleaning
        - "Painting work urgent" = Urgent painting work needed

        Return only valid JSON without any markdown formatting or additional text.
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Clean response text (remove markdown if present)
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Parse JSON response
            parsed_data = json.loads(response_text)
            
            # Validate and enhance the response
            return self._validate_and_enhance_response(parsed_data, query)
            
        except Exception as e:
            print(f"Gemini parsing error: {str(e)}")
            # Fallback to rule-based parsing
            return self._fallback_parse(query)
    
    def _fallback_parse(self, query: str) -> Dict:
        """Fallback rule-based parsing when Gemini is not available"""
        
        query_lower = query.lower()
        
        # Enhanced service category detection with multilingual support
        service_patterns = {
            'electrical': [
                'electric', 'bijli', 'ac', 'fan', 'light', 'wiring', 'switch', 'electrician',
                'इलेक्ट्रिशियन', 'बिजली', 'वीज', 'વીજળી', 'ലൈറ്റ്', 'విద్యుత్'
            ],
            'plumbing': [
                'plumber', 'paani', 'water', 'pipe', 'tap', 'bathroom', 'leak', 'नल',
                'प्लंबर', 'पानी', 'પાણી', 'नळ', 'पाइप', 'টোকা', 'నీరు', 'குழாய்'
            ],
            'cleaning': [
                'clean', 'safai', 'saaf', 'wash', 'jhadu', 'सफाई', 'साफ',
                'સફાઈ', 'ಶುಚಿ', 'വൃത്തി', 'శుభ్రత', 'சுத்தம்'
            ],
            'painting': [
                'paint', 'rang', 'wall', 'deewar', 'पेंट', 'रंग', 'दीवार',
                'રંગ', 'ಬಣ್ಣ', 'നിറം', 'రంగు', 'வண்ணம்'
            ],
            'carpentry': [
                'carpenter', 'wood', 'door', 'window', 'furniture', 'बढ़ई', 'दरवाजा',
                'કારપેન્ટર', 'ದಾರು', 'മരം', 'చెక్క', 'மரம்', 'दरवाज़ा'
            ],
            'repairs': [
                'repair', 'theek', 'fix', 'toot', 'kharab', 'टूट', 'खराब', 'ठीक',
                'તૂટી', 'ಹಾನಿ', 'കേടായ', 'విరిగిన', 'உடைந்த'
            ]
        }
        
        detected_service = 'other'
        for category, keywords in service_patterns.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_service = category
                break
        
        # Enhanced urgency detection with multilingual support
        urgency_keywords = {
            'URGENT': [
                'urgent', 'turant', 'abhi', 'immediately', 'asap', 'emergency',
                'तुरंत', 'अभी', 'તુરંત', 'ತುರಂತ', 'ഉടനെ', 'వెంటనే', 'உடனே'
            ],
            'HIGH': [
                'fast', 'jaldi', 'quick', 'soon', 'today', 'जल्दी', 'आज',
                'જલ્દી', 'ಬೇಗ', 'വേഗം', 'త్వరగా', 'விரைவாக'
            ],
            'MEDIUM': [
                'tomorrow', 'kal', 'this week', 'कल', 'इस सप्ताह',
                'કાલે', 'ನಾಳೆ', 'നാളെ', 'రేపు', 'நாளை'
            ],
            'LOW': [
                'sometime', 'next week', 'when possible', 'कभी भी', 'अगले सप्ताह',
                'ક્યારેક', 'ಯಾವಾಗ', 'എപ്പോൾ', 'ఎప్పుడైనా', 'எப்போதாவது'
            ]
        }
        
        detected_urgency = 'MEDIUM'  # default
        for urgency, keywords in urgency_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_urgency = urgency
                break
        
        # Extract keywords from query
        keywords = []
        all_keywords = [word for word_list in service_patterns.values() for word in word_list]
        all_keywords.extend(['urgent', 'fast', 'quick', 'repair', 'fix', 'need', 'chahiye'])
        
        for word in all_keywords:
            if word in query_lower:
                keywords.append(word)
        
        # Generate contextual title and description based on detected service
        service_context = {
            'electrical': {
                'titles': ['Electrical Work Needed', 'Electrician Required', 'Power Issue Fix'],
                'descriptions': [
                    'Need electrical repair or installation work',
                    'Electrical system needs professional attention', 
                    'Power or wiring issue requires fixing'
                ]
            },
            'plumbing': {
                'titles': ['Plumbing Service Required', 'Plumber Needed', 'Water System Repair'],
                'descriptions': [
                    'Plumbing repair or installation needed',
                    'Water system requires professional service',
                    'Pipe, tap or drainage issue needs fixing'
                ]
            },
            'cleaning': {
                'titles': ['Cleaning Service Needed', 'House Cleaning Required', 'Deep Cleaning'],
                'descriptions': [
                    'Professional cleaning service required',
                    'Home or office cleaning needed',
                    'Thorough cleaning and maintenance'
                ]
            },
            'painting': {
                'titles': ['Painting Work Required', 'Wall Painting Service', 'House Painting'],
                'descriptions': [
                    'Interior or exterior painting needed',
                    'Wall painting and decoration work',
                    'Professional painting service required'
                ]
            },
            'carpentry': {
                'titles': ['Carpentry Work Needed', 'Furniture Repair', 'Wood Work Service'],
                'descriptions': [
                    'Carpenter needed for wood work',
                    'Furniture repair or installation',
                    'Door, window or cabinet work'
                ]
            },
            'repairs': {
                'titles': ['General Repair Service', 'Fix and Repair Work', 'Maintenance Required'],
                'descriptions': [
                    'General repair and maintenance work',
                    'Multiple items need fixing',
                    'Home repair service required'
                ]
            }
        }
        
        # Select appropriate title and description
        context = service_context.get(detected_service, {
            'titles': ['Service Required', 'Professional Help Needed'],
            'descriptions': ['General service or repair work needed', 'Professional assistance required']
        })
        
        import random
        suggested_title = random.choice(context['titles'])
        suggested_description = random.choice(context['descriptions'])
        
        # Add specific keywords to title if found
        if 'ac' in query_lower:
            suggested_title = 'AC Repair/Service Needed'
        elif 'tap' in query_lower or 'नल' in query_lower:
            suggested_title = 'Tap Repair Required'
        elif 'door' in query_lower or 'दरवाजा' in query_lower:
            suggested_title = 'Door Repair/Installation'
        
        # Try to find matching service ID with improved matching
        service_id = None
        service_name = None
        try:
            # Enhanced service matching with multiple approaches
            
            # 1. Direct category matching (capitalize first letter)
            matching_service = Services.objects.filter(
                name__icontains=detected_service.capitalize()
            ).first()
            
            # 2. If no direct match, try keyword-based mapping
            if not matching_service:
                category_to_service = {
                    'electrical': ['Electrical', 'AC Repair', 'Appliance Repair'],
                    'plumbing': ['Plumbing'],
                    'cleaning': ['Cleaning', 'House Cleaning'],
                    'painting': ['Painting'],
                    'carpentry': ['Carpentry'],
                    'repairs': ['AC Repair', 'Appliance Repair'],
                    'hvac': ['HVAC', 'AC Repair']
                }
                
                potential_services = category_to_service.get(detected_service, [detected_service])
                for service_name_candidate in potential_services:
                    matching_service = Services.objects.filter(
                        name__iexact=service_name_candidate
                    ).first()
                    if matching_service:
                        break
            
            # 3. If still no match, try partial matching
            if not matching_service:
                matching_service = Services.objects.filter(
                    name__icontains=detected_service[:4]  # First 4 characters
                ).first()
            
            if matching_service:
                service_id = matching_service.id
                service_name = matching_service.name
                
        except Exception as e:
            print(f"Error finding service: {e}")
            pass
        
        return {
            'service_category': detected_service,
            'service_id': service_id,
            'service_name': service_name,
            'urgency': detected_urgency,
            'suggested_title': suggested_title,
            'suggested_description': suggested_description,
            'keywords': keywords,
            'location_mentioned': None,
            'budget_mentioned': None,
            'time_preference': None,
            'confidence': 0.65,  # Lower confidence for rule-based
            'language_detected': self._detect_language(query),
            'original_query': query
        }
    
    def _detect_language(self, query: str) -> str:
        """Enhanced language detection for Indian languages"""
        
        # Language patterns
        language_patterns = {
            'hi': [  # Hindi
                'chahiye', 'karna', 'theek', 'wala', 'paani', 'bijli', 'safai', 'hai', 'karvana',
                'मुझे', 'चाहिए', 'करना', 'ठीक', 'वाला', 'पानी', 'बिजली', 'सफाई', 'है', 'नल'
            ],
            'mr': [  # Marathi
                'मला', 'हवा', 'करणे', 'पाणी', 'वीज', 'साफसफाई', 'आहे', 'नळ'
            ],
            'gu': [  # Gujarati
                'મને', 'જોઈએ', 'કરવું', 'પાણી', 'વીજળી', 'સફાઈ', 'છે', 'નળ'
            ],
            'ta': [  # Tamil
                'எனக்கு', 'வேண்டும்', 'செய்ய', 'நீர்', 'மின்சாரம்', 'சுத்தம்', 'உள்ளது'
            ],
            'te': [  # Telugu
                'నాకు', 'కావాలి', 'చేయాలి', 'నీరు', 'విద్యుత్', 'శుభ్రత', 'ఉంది'
            ],
            'kn': [  # Kannada
                'ನನಗೆ', 'ಬೇಕು', 'ಮಾಡಲು', 'ನೀರು', 'ವಿದ್ಯುತ್', 'ಶುಚಿ', 'ಇದೆ'
            ],
            'bn': [  # Bengali
                'আমার', 'লাগবে', 'করতে', 'পানি', 'বিদ্যুৎ', 'পরিষ্কার', 'আছে'
            ],
            'en': [  # English
                'repair', 'fix', 'clean', 'paint', 'urgent', 'need', 'work', 'plumber', 'electrician'
            ]
        }
        
        query_lower = query.lower()
        language_scores = {}
        
        for lang, words in language_patterns.items():
            score = sum(1 for word in words if word in query_lower)
            if score > 0:
                language_scores[lang] = score
        
        if language_scores:
            detected_lang = max(language_scores, key=language_scores.get)
            return detected_lang
        
        # Default to English if no pattern matches
        return 'en'
    
    def _validate_and_enhance_response(self, parsed_data: Dict, original_query: str) -> Dict:
        """Validate and enhance Gemini response"""
        
        # Ensure required fields
        required_fields = ['service_category', 'urgency', 'suggested_title', 'confidence']
        for field in required_fields:
            if field not in parsed_data:
                parsed_data[field] = None
        
        # Validate urgency
        valid_urgency = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        if parsed_data.get('urgency') not in valid_urgency:
            parsed_data['urgency'] = 'MEDIUM'
        
        # Ensure confidence is between 0 and 1
        confidence = parsed_data.get('confidence', 0.5)
        if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
            parsed_data['confidence'] = 0.5
        
        # Add original query if not present
        parsed_data['original_query'] = original_query
        
        # Validate service_id exists
        if parsed_data.get('service_id'):
            try:
                Services.objects.get(id=parsed_data['service_id'])
            except Services.DoesNotExist:
                parsed_data['service_id'] = None
        
        return parsed_data
    
    def get_service_suggestions(self, query: str) -> List[Dict]:
        """Get service suggestions based on query"""
        parsed = self.parse_voice_query(query)
        service_category = parsed.get('service_category', '')
        
        # Find matching services
        suggestions = []
        if service_category and service_category != 'other':
            # Enhanced service matching with multiple approaches
            
            # 1. Direct category matching (case insensitive)
            services = Services.objects.filter(
                name__icontains=service_category.capitalize()
            )
            
            # 2. If no direct match, try keyword-based matching
            if not services.exists():
                category_keywords = {
                    'electrical': ['electrical', 'electric', 'electrician', 'ac repair', 'appliance repair'],
                    'plumbing': ['plumbing', 'plumber'],
                    'cleaning': ['cleaning', 'house cleaning'],
                    'painting': ['painting'],
                    'carpentry': ['carpentry', 'carpenter'],
                    'repairs': ['ac repair', 'appliance repair'],
                    'hvac': ['hvac', 'ac repair'],
                    'landscaping': ['landscaping', 'gardening'],
                    'construction': ['construction', 'tiling', 'roofing', 'flooring']
                }
                
                keywords = category_keywords.get(service_category.lower(), [service_category])
                
                for keyword in keywords:
                    matching_services = Services.objects.filter(
                        name__icontains=keyword.capitalize()
                    )
                    services = services.union(matching_services) if services.exists() else matching_services
            
            # 3. If still no match, try broader search
            if not services.exists():
                services = Services.objects.filter(
                    name__icontains=service_category[:3]  # First 3 characters
                )
                
            # Limit to top 5 suggestions
            services = services[:5]
            
            for service in services:
                suggestions.append({
                    'id': service.id,
                    'name': service.name,
                    'description': service.description,
                    'confidence': parsed.get('confidence', 0.5)
                })
        
        return suggestions


# Singleton instance
gemini_service = GeminiNLPService()
