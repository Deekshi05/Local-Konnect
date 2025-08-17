from django.db import models
from accounts.models import User
from needs.models import Services

class Appointment(models.Model):
    APPOINTMENT_TYPES = (
        ('virtual', 'Virtual Consultation'),
        ('physical', 'Physical Visit'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_appointments')
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='supervisor_appointments')
    service = models.ForeignKey(Services, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=APPOINTMENT_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    scheduled_time = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_time']

    def __str__(self):
        return f"{self.customer.username} - {self.service.name} ({self.get_type_display()})"
