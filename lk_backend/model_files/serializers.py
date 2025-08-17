from rest_framework import serializers
from .models import ModelFile, UserPreferences


class ModelFileSerializer(serializers.ModelSerializer):
    """Serializer for ModelFile"""
    
    file_url = serializers.ReadOnlyField()
    formatted_file_size = serializers.ReadOnlyField()
    
    class Meta:
        model = ModelFile
        fields = [
            'id', 'name', 'description', 'file', 'file_url', 
            'file_size', 'formatted_file_size', 'created_at', 'updated_at'
        ]
        read_only_fields = ['file_size', 'created_at', 'updated_at']
    
    def validate_file(self, value):
        """Validate uploaded file"""
        if value.size > 50 * 1024 * 1024:  # 50MB limit
            raise serializers.ValidationError("File size cannot exceed 50MB")
        return value


class ModelFileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ModelFile"""
    
    class Meta:
        model = ModelFile
        fields = ['name', 'description', 'file']
        
    def validate_file(self, value):
        """Validate uploaded file"""
        if value.size > 50 * 1024 * 1024:  # 50MB limit
            raise serializers.ValidationError("File size cannot exceed 50MB")
        return value


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserPreferences"""
    
    class Meta:
        model = UserPreferences
        fields = [
            'id', 'auto_rotate', 'background_color', 'wireframe_mode',
            'camera_position_x', 'camera_position_y', 'camera_position_z',
            'ambient_light_intensity', 'directional_light_intensity',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_background_color(self, value):
        """Validate hex color format"""
        if not value.startswith('#') or len(value) != 7:
            raise serializers.ValidationError("Background color must be a valid hex color (e.g., #1a1a1a)")
        return value
