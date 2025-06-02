from django.db import models
from accounts.models import Customer, Supervisor, Contractor
from needs.models import Services, Requirments

# -------------------- MODELS -------------------- #

class Tenders(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='tender_customer')
    supervisor = models.ForeignKey(Supervisor, on_delete=models.CASCADE, related_name='tender_supervisor')
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='tender_service')
    location = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    customer_limit = models.IntegerField()
    selected_contractor = models.ForeignKey(Contractor, on_delete=models.SET_NULL, null=True, blank=True, related_name='selected_tenders')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

class Tender_requirments(models.Model):
    tenders = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='tender_requirements')
    requirments = models.ForeignKey(Requirments, on_delete=models.CASCADE, related_name='requirement_tenders')
    quantity = models.PositiveIntegerField()
    units = models.CharField(max_length=15)

    class Meta:
        unique_together = ('tenders', 'requirments')

class Tender_contractors(models.Model):
    tenders = models.ForeignKey(Tenders, on_delete=models.CASCADE, related_name='tender_contractors')
    tender_contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='contractor_tenders')

    class Meta:
        unique_together = ('tenders', 'tender_contractor')

class TenderBids(models.Model):
    tender_requirement = models.ForeignKey(Tender_requirments, on_delete=models.CASCADE, related_name='bids')
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='bids')
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tender_requirement', 'contractor')

class TenderAssignment(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    tender = models.OneToOneField(Tenders, on_delete=models.CASCADE, related_name='assignment')
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='assignments')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='pending')
    start_date = models.DateField()
    due_date = models.DateField()

    def __str__(self):
        return f"Tender {self.tender.id} assigned to {self.contractor}"
