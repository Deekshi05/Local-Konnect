from django.db import models
from django.core.validators import MinValueValidator
from accounts.models import Customer, Supervisor, Contractor
from needs.models import Services, Requirements

# -------------------- MODELS -------------------- #

class TenderTemplate(models.Model):  # need to remove this model in future
    """Model for storing reusable tender templates"""
    title = models.CharField(max_length=255)
    description = models.TextField()
    service = models.ForeignKey('needs.Services', on_delete=models.CASCADE, related_name='tender_templates')
    created_by = models.ForeignKey(Supervisor, on_delete=models.CASCADE, related_name='created_templates')
    is_public = models.BooleanField(default=False)  # Whether template is available to all supervisors
    requirements = models.JSONField(default=dict)  # Stored template of requirements
    estimated_duration = models.IntegerField(default=30, help_text="Estimated duration in days")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.service.name}"

class Tenders(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('review', 'Under Review'), #shoud add this field in future
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='tender_customer')
    supervisor = models.ForeignKey(Supervisor, on_delete=models.CASCADE, related_name='tender_supervisor')
    based_on_template = models.ForeignKey(TenderTemplate, null=True, blank=True, on_delete=models.SET_NULL, related_name='derived_tenders') # need to remove this field in future
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='tender_service')
    location = models.CharField(max_length=255)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    selected_contractor = models.ForeignKey(Contractor, on_delete=models.SET_NULL, null=True, blank=True, related_name='selected_tenders')
    consultation = models.ForeignKey('works.TenderCreationAssistance', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tender')
    start_time = models.DateTimeField(null=True, blank=True)  # Time tender becomes visible/active
    end_time = models.DateTimeField(null=True, blank=True)    # Time tender closes
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_template = models.BooleanField(default=False)
    template_name = models.CharField(max_length=100, blank=True)
    version = models.PositiveIntegerField(default=1)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"

class TenderRequirement(models.Model):
    tender = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='tender_requirements')
    requirement = models.ForeignKey(Requirements, on_delete=models.CASCADE, related_name='requirement_tenders')
    category = models.ForeignKey('needs.RequirementCategory', on_delete=models.CASCADE, related_name='tender_requirements')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    units = models.CharField(max_length=50, default='-')
    description = models.TextField(blank=True)
    version = models.PositiveIntegerField(default=1)
    is_critical = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('tender', 'requirement', 'version')

class TenderContractor(models.Model):
    tender = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='tender_contractors')
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='contractor_tenders')
    status = models.CharField(max_length=20, choices=[
        ('invited', 'Invited'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('removed', 'Removed')
    ], default='invited')
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('tender', 'contractor')
        ordering = ['added_at']

    def __str__(self):
        return f"{self.contractor.user.get_full_name()} - {self.tender.title}"

class TenderAttachment(models.Model):
    ATTACHMENT_TYPES = [
        ('document', 'Document'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('drawing', 'Drawing'),
        ('specification', 'Specification'),
        ('contract', 'Contract'),
        ('invoice', 'Invoice'),
        ('other', 'Other'),
    ]
    
    ACCESS_LEVELS = [
        ('public', 'Public'),
        ('private', 'Private'),
        ('contractor_only', 'Contractor Only'),
        ('supervisor_only', 'Supervisor Only'),
    ]
    
    tender = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='attachments')
    requirement = models.ForeignKey(TenderRequirement, null=True, blank=True, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='tender_attachments/%Y/%m/')
    file_type = models.CharField(max_length=20, choices=ATTACHMENT_TYPES)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    uploaded_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    version = models.PositiveIntegerField(default=1)
    access_level = models.CharField(max_length=20, choices=ACCESS_LEVELS, default='private')
    is_required = models.BooleanField(default=False)  # Whether this attachment is mandatory
    file_size = models.BigIntegerField(help_text="File size in bytes", default=0)
    mime_type = models.CharField(max_length=100, default='application/octet-stream')
    checksum = models.CharField(max_length=64, help_text="SHA-256 hash of file", default='')
    download_count = models.PositiveIntegerField(default=0)
    last_downloaded = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)  # For temporary access files
    tags = models.JSONField(default=list)  # For categorizing and searching
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['file_type', 'access_level']),
            models.Index(fields=['created_at']),
        ]

    class Meta:
        ordering = ['-created_at']

class TenderBids(models.Model):
    tender_requirement = models.ForeignKey(TenderRequirement, on_delete=models.CASCADE, related_name='bids')
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='bids')
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    proposal_description = models.TextField(blank=True) # need to remove this field in future
    attachments = models.ManyToManyField(TenderAttachment, blank=True, related_name='bids')
    is_final = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('tender_requirement', 'contractor')

class TenderMilestone(models.Model):
    """Model for tracking tender progress through milestones"""
    tender = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    completion_notes = models.TextField(blank=True)
    attachments = models.ManyToManyField(TenderAttachment, blank=True, related_name='milestone_attachments')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('delayed', 'Delayed')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['due_date']

class TenderProgress(models.Model):
    """Model for tracking overall tender progress"""
    tender = models.OneToOneField(Tenders, on_delete=models.CASCADE, related_name='progress')
    percent_complete = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_activity = models.DateTimeField(auto_now=True)
    current_phase = models.CharField(max_length=100, default='planning')
    next_milestone = models.ForeignKey(TenderMilestone, null=True, blank=True, on_delete=models.SET_NULL)
    notes = models.TextField(blank=True)



class ProgressNote(models.Model): # need to remove this model in future
    """Model for tracking tender progress notes and updates"""
    tender = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='progress_notes')
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=255)
    note = models.TextField()
    tags = models.JSONField(default=list)  # For categorizing notes
    visibility = models.CharField(max_length=20, choices=[
        ('all', 'All'),
        ('customer', 'Customer Only'),
        ('contractor', 'Contractor Only'),
        ('supervisor', 'Supervisor Only'),
        ('internal', 'Internal Only')
    ], default='all')
    attachments = models.ManyToManyField(TenderAttachment, blank=True, related_name='progress_notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

class TenderAssignment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('partially_paid', 'Partially Paid'),
        ('refunded', 'Refunded'),
    ]

    tender = models.OneToOneField(Tenders, on_delete=models.CASCADE, related_name='assignment')
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='assignments')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    start_date = models.DateField()
    due_date = models.DateField()
    actual_completion_date = models.DateField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_schedule = models.JSONField(default=dict)  # Milestone-based payment schedule
    contract_file = models.FileField(upload_to='contracts/', null=True, blank=True)

    def __str__(self):
        return f"Tender {self.tender.id} assigned to {self.contractor}"


# -------------------- SUPERVISOR APPOINTMENT MODELS -------------------- #

class VirtualAppointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    COMPLEXITY_CHOICES = [
        ('simple', 'Simple - No Physical Visit Required'),
        ('medium', 'Medium - Physical Visit Optional'),
        ('complex', 'Complex - Physical Visit Required')
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='virtual_appointments')
    supervisor = models.ForeignKey(Supervisor, on_delete=models.CASCADE, related_name='virtual_appointments')
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='virtual_appointments')
    scheduled_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    meeting_link = models.URLField(blank=True, null=True)  # For video call links
    notes = models.TextField(blank=True)  # Supervisor notes during consultation
    project_complexity = models.CharField(max_length=20, choices=COMPLEXITY_CHOICES, null=True, blank=True)
    physical_visit_required = models.BooleanField(null=True, blank=True)
    skip_physical_visit_reason = models.TextField(blank=True)
    estimated_budget_range = models.CharField(max_length=50, blank=True)  # Initial budget estimation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Virtual appointment: {self.customer.user.first_name} with {self.supervisor.user.first_name} on {self.scheduled_time}"


class PhysicalVisit(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('payment_pending', 'Payment Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    virtual_appointment = models.OneToOneField(VirtualAppointment, on_delete=models.CASCADE, related_name='physical_visit')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='physical_visits')
    supervisor = models.ForeignKey(Supervisor, on_delete=models.CASCADE, related_name='physical_visits')
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='physical_visits')
    visit_address = models.TextField()  # Customer's location for physical visit
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    estimated_duration_hours = models.PositiveIntegerField(default=2)
    visit_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Fee for physical visit
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    supervisor_notes = models.TextField(blank=True)  # Notes from physical visit
    customer_willing_for_tender = models.BooleanField(null=True, blank=True)  # Customer willingness after visit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Physical visit: {self.customer.user.first_name} with {self.supervisor.user.first_name} on {self.scheduled_date}"


class TenderCreationAssistance(models.Model):
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    SOURCE_CHOICES = [
        ('virtual_only', 'Virtual Consultation Only'),
        ('physical_visit', 'Physical Visit'),
    ]
    
    virtual_appointment = models.OneToOneField(
        VirtualAppointment, 
        on_delete=models.CASCADE, 
        related_name='tender_assistance',
        null=True,
        blank=True
    )
    physical_visit = models.OneToOneField(
        PhysicalVisit, 
        on_delete=models.CASCADE, 
        related_name='tender_assistance',
        null=True,
        blank=True
    )
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='tender_assistances')
    supervisor = models.ForeignKey(Supervisor, on_delete=models.CASCADE, related_name='tender_assistances')
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='tender_assistances')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='in_progress')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='virtual_only')
    requirements_discussed = models.JSONField(default=list)  # List of requirements discussed
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    project_timeline_days = models.PositiveIntegerField(null=True, blank=True)
    special_instructions = models.TextField(blank=True)
    tender_posted = models.BooleanField(default=False)  # Whether tender was actually posted
    tender = models.ForeignKey(Tenders, on_delete=models.SET_NULL, null=True, blank=True, related_name='creation_assistance')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Tender assistance for {self.customer.user.first_name} by {self.supervisor.user.first_name}"


class TenderAuditLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('status_change', 'Status Changed'),
        ('requirement_add', 'Requirement Added'),
        ('requirement_update', 'Requirement Updated'),
        ('requirement_delete', 'Requirement Deleted'),
        ('attachment_add', 'Attachment Added'),
        ('attachment_delete', 'Attachment Deleted'),
        ('bid_add', 'Bid Added'),
        ('bid_update', 'Bid Updated'),
        ('contractor_select', 'Contractor Selected'),
    ]
    
    tender = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.TextField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class TenderVersion(models.Model):
    tender = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    data = models.JSONField()  # Stores the complete tender state at this version
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True)

    class Meta:
        unique_together = ('tender', 'version_number')
        ordering = ['-version_number']


class SupervisorServices(models.Model):
    """Many-to-many relationship between supervisors and services they can provide consultation for"""
    supervisor = models.ForeignKey(Supervisor, on_delete=models.CASCADE, related_name='supervisor_services')
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='service_supervisors')
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)  # Consultation rate
    physical_visit_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)  # Physical visit fee
    available_from = models.TimeField(default='09:00:00')
    available_to = models.TimeField(default='18:00:00')
    is_active = models.BooleanField(default=True)  # Whether supervisor is currently accepting appointments
    years_experience = models.PositiveIntegerField(default=0)  # Years of experience in this service
    expertise_level = models.CharField(max_length=20, choices=[
        ('junior', 'Junior'),
        ('intermediate', 'Intermediate'),
        ('senior', 'Senior'),
        ('expert', 'Expert')
    ], default='junior')
    specializations = models.JSONField(default=list)  # Specific areas within the service
    languages = models.JSONField(default=list)  # Languages spoken
    available_days = models.JSONField(default=list)  # Available days of week
    added_on = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('supervisor', 'service')
        ordering = ['-expertise_level', '-years_experience']
    
    def __str__(self):
        return f"{self.supervisor.user.first_name} - {self.service.name} ({self.expertise_level})"


class ContractorRating(models.Model):
    """Model to store individual ratings given by customers to contractors"""
    
    RATING_CHOICES = [
        (1, '1 - Very Poor'),
        (2, '2 - Poor'), 
        (3, '3 - Average'),
        (4, '4 - Good'),
        (5, '5 - Excellent'),
    ]
    
    tender = models.OneToOneField(Tenders, on_delete=models.CASCADE, related_name='contractor_rating')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='given_ratings')
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='received_ratings')
    
    # Rating fields
    rating = models.PositiveIntegerField(choices=RATING_CHOICES)
    review = models.TextField(blank=True, help_text="Optional written review")
    
    # Quality aspects (optional detailed feedback)
    work_quality = models.PositiveIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    timeliness = models.PositiveIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    communication = models.PositiveIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    professionalism = models.PositiveIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    
    # Recommendation
    would_recommend = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('tender', 'customer', 'contractor')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer.user.first_name} rated {self.contractor.user.first_name} - {self.rating}/5"

    def save(self, *args, **kwargs):
        """Override save to update contractor's overall rating when a new rating is added"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update contractor's overall rating
            self.contractor.update_rating()

# Add method to Contractor model to update rating
def update_contractor_rating(self):
    """Calculate and update the contractor's overall rating based on all received ratings"""
    from django.db.models import Avg
    
    ratings = self.received_ratings.all()
    if ratings.exists():
        avg_rating = ratings.aggregate(avg=Avg('rating'))['avg']
        self.rating = round(avg_rating, 1)
        self.save(update_fields=['rating'])
    
# Monkey patch the method to the Contractor model
Contractor.update_rating = update_contractor_rating
