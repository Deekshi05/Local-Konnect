from django.contrib import admin
from .models import TrustConnection, QuickJob, QuickJobInterest, TrustScoreLog


@admin.register(TrustConnection)
class TrustConnectionAdmin(admin.ModelAdmin):
    list_display = ('recommender', 'contractor', 'trust_level', 'service_context', 'created_at')
    list_filter = ('trust_level', 'service_context', 'created_at')
    search_fields = ('recommender__first_name', 'contractor__user__first_name', 'comment')
    raw_id_fields = ('recommender', 'contractor')


@admin.register(QuickJob)
class QuickJobAdmin(admin.ModelAdmin):
    list_display = ('title', 'customer', 'service', 'status', 'urgency', 'assigned_contractor', 'created_at')
    list_filter = ('status', 'urgency', 'service', 'created_at')
    search_fields = ('title', 'description', 'customer__first_name', 'location')
    raw_id_fields = ('customer', 'assigned_contractor')
    readonly_fields = ('created_at', 'updated_at', 'assigned_at', 'completed_at')


@admin.register(QuickJobInterest)
class QuickJobInterestAdmin(admin.ModelAdmin):
    list_display = ('contractor', 'quick_job', 'proposed_price', 'created_at')
    list_filter = ('created_at', 'quick_job__status')
    search_fields = ('contractor__user__first_name', 'quick_job__title', 'message')
    raw_id_fields = ('contractor', 'quick_job')


@admin.register(TrustScoreLog)
class TrustScoreLogAdmin(admin.ModelAdmin):
    list_display = ('contractor', 'old_score', 'new_score', 'reason', 'created_at')
    list_filter = ('created_at', 'reason')
    search_fields = ('contractor__user__first_name', 'reason')
    raw_id_fields = ('contractor',)
    readonly_fields = ('created_at',)
