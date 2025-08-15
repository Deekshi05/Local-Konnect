from django.db import models
from django.core.validators import FileExtensionValidator
import os


def model_file_path(instance, filename):
    """Generate file path for model uploads"""
    return f'models/{filename}'


class ModelFile(models.Model):
    """Model representing a 3D model file (GLB/GLTF)"""
    
    name = models.CharField(max_length=255, help_text="Display name for the model")
    description = models.TextField(blank=True, null=True, help_text="Optional description")
    
    file = models.FileField(
        upload_to=model_file_path,
        validators=[FileExtensionValidator(allowed_extensions=['glb', 'gltf'])],
        help_text="GLB or GLTF model file"
    )
    
    # Model metadata
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text="File size in bytes")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # User tracking (optional - for multi-user support)
    # uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "3D Model"
        verbose_name_plural = "3D Models"
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Set file size if not already set
        if self.file and not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)
    
    @property
    def file_url(self):
        """Get the full URL to the model file"""
        if self.file:
            # For development, prepend the Django server URL
            from django.conf import settings
            if hasattr(settings, 'DEVELOPMENT') or settings.DEBUG:
                return f"http://localhost:8000{self.file.url}"
            return self.file.url
        return None
    
    @property
    def formatted_file_size(self):
        """Get human-readable file size"""
        if not self.file_size:
            return "Unknown"
        
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class UserPreferences(models.Model):
    """User preferences for the 3D viewer"""
    
    # Viewer settings
    auto_rotate = models.BooleanField(default=False)
    background_color = models.CharField(max_length=7, default="#1a1a1a")  # Hex color
    wireframe_mode = models.BooleanField(default=False)
    
    # Camera settings
    camera_position_x = models.FloatField(default=0)
    camera_position_y = models.FloatField(default=0)
    camera_position_z = models.FloatField(default=5)
    
    # Lighting settings
    ambient_light_intensity = models.FloatField(default=0.6)
    directional_light_intensity = models.FloatField(default=1.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Preferences"
        verbose_name_plural = "User Preferences"
