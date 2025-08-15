from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User, Contractor
from needs.models import Services


class TrustConnection(models.Model):
    """
    Social graph edge representing trust relationships.
    One user recommending a contractor to the network.
    """
    recommender = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='given_recommendations',
        help_text="User who is giving the recommendation"
    )
    contractor = models.ForeignKey(
        Contractor, 
        on_delete=models.CASCADE, 
        related_name='received_recommendations',
        help_text="Contractor being recommended"
    )
    comment = models.TextField(
        blank=True, 
        help_text="Optional comment about the recommendation"
    )
    trust_level = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Trust level from 1-10, default 5"
    )
    service_context = models.ForeignKey(
        Services,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Service context for this recommendation"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('recommender', 'contractor')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.recommender.first_name} recommends {self.contractor.user.first_name}"


class QuickJob(models.Model):
    """
    Lightweight alternative to Tender for small, urgent tasks.
    Part of the informal trust network economy.
    """
    
    class JobStatus(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        ASSIGNED = 'ASSIGNED', 'Assigned'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    class UrgencyLevel(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'
    
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='quick_jobs',
        help_text="Customer who posted the job"
    )
    service = models.ForeignKey(
        Services, 
        on_delete=models.CASCADE, 
        related_name='quick_jobs'
    )
    title = models.CharField(max_length=200, help_text="Brief job title")
    description = models.TextField(help_text="Detailed job description")
    location = models.CharField(max_length=255)
    
    # Job specifics
    status = models.CharField(
        max_length=20, 
        choices=JobStatus.choices, 
        default=JobStatus.OPEN
    )
    urgency = models.CharField(
        max_length=20,
        choices=UrgencyLevel.choices,
        default=UrgencyLevel.MEDIUM
    )
    budget_suggestion = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Suggested budget range"
    )
    
    # Assignment details
    assigned_contractor = models.ForeignKey(
        Contractor, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_quick_jobs'
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # NLP processing fields
    raw_query = models.TextField(
        blank=True,
        help_text="Original voice/text query from user"
    )
    parsed_intent = models.JSONField(
        default=dict,
        help_text="Parsed intent from NLP processing"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.customer.first_name}"


class QuickJobInterest(models.Model):
    """
    Track contractor interest in quick jobs.
    """
    quick_job = models.ForeignKey(
        QuickJob,
        on_delete=models.CASCADE,
        related_name='interests'
    )
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name='job_interests'
    )
    message = models.TextField(
        blank=True,
        help_text="Optional message from contractor"
    )
    proposed_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('quick_job', 'contractor')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.contractor.user.first_name} interested in {self.quick_job.title}"


class TrustScoreLog(models.Model):
    """
    Log changes in trust scores for audit and debugging.
    """
    contractor = models.ForeignKey(
        Contractor,
        on_delete=models.CASCADE,
        related_name='trust_score_logs'
    )
    old_score = models.FloatField()
    new_score = models.FloatField()
    reason = models.CharField(max_length=255)
    calculation_details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.contractor.user.first_name}: {self.old_score} → {self.new_score}"
