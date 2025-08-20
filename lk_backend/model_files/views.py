from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import ModelFile, UserPreferences
from .serializers import (
    ModelFileSerializer, 
    ModelFileCreateSerializer,
    UserPreferencesSerializer
)


class ModelFileViewSet(viewsets.ModelViewSet):
    """ViewSet for managing 3D model files"""
    
    queryset = ModelFile.objects.all()
    parser_classes = (MultiPartParser, FormParser)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ModelFileCreateSerializer
        return ModelFileSerializer
    
    def create(self, request, *args, **kwargs):
        """Upload a new 3D model file"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            model_file = serializer.save()
            response_serializer = ModelFileSerializer(model_file)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        """List all model files"""
        queryset = self.get_queryset()
        serializer = ModelFileSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None, *args, **kwargs):
        """Get a specific model file"""
        model_file = get_object_or_404(ModelFile, pk=pk)
        serializer = ModelFileSerializer(model_file)
        return Response(serializer.data)
    
    def destroy(self, request, pk=None, *args, **kwargs):
        """Delete a model file"""
        model_file = get_object_or_404(ModelFile, pk=pk)
        
        # Delete the actual file
        if model_file.file:
            model_file.file.delete()
        
        model_file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a model file"""
        model_file = get_object_or_404(ModelFile, pk=pk)
        
        if not model_file.file:
            return Response(
                {'error': 'File not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # In production, you might want to use X-Sendfile or similar
        response = Response()
        response['Content-Disposition'] = f'attachment; filename="{model_file.name}.glb"'
        response['X-Accel-Redirect'] = model_file.file.url
        return response


class UserPreferencesViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user preferences"""
    
    queryset = UserPreferences.objects.all()
    serializer_class = UserPreferencesSerializer
    
    def list(self, request, *args, **kwargs):
        """Get user preferences (create default if none exist)"""
        preferences, created = UserPreferences.objects.get_or_create(
            id=1,  # For now, we'll use a single set of preferences
            defaults={
                'auto_rotate': False,
                'background_color': '#1a1a1a',
                'wireframe_mode': False,
                'camera_position_x': 0,
                'camera_position_y': 0,
                'camera_position_z': 5,
                'ambient_light_intensity': 0.6,
                'directional_light_intensity': 1.0,
            }
        )
        
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update user preferences"""
        preferences, created = UserPreferences.objects.get_or_create(id=1)
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
