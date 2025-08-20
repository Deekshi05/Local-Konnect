from django.contrib import admin
from .models import ModelFile, UserPreferences


@admin.register(ModelFile)
class ModelFileAdmin(admin.ModelAdmin):
    list_display = ['name', 'formatted_file_size', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['file_size', 'created_at', 'updated_at']


@admin.register(UserPreferences)
class UserPreferencesAdmin(admin.ModelAdmin):
    list_display = ['id', 'auto_rotate', 'background_color', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
