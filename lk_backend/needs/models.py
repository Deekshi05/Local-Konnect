from django.db import models
from accounts.models import Contractor

class Services(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='services/', null=True, blank=True)

    def __str__(self):
        return self.name

class RequirementCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='requirement_categories')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subcategories') # should remove this line if not needed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Requirement Categories'
        ordering = ['name']

    def __str__(self):
        return self.name

class Requirements(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    category = models.ForeignKey(RequirementCategory, on_delete=models.CASCADE, related_name='requirements')
    image = models.ImageField(upload_to='requirements/', null=True, blank=True)
    is_template = models.BooleanField(default=False)
    default_unit = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ContractorServices(models.Model):
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='contractor_services')
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='service_contractors')
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('contractor', 'service')
        