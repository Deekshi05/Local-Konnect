# services/models.py
from django.db import models
from accounts.models import Contractor 

class Services(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='services/', null=True, blank=True)

    def __str__(self):
        return self.name
    

class Requirments(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='requirments/', null=True, blank=True)


class ContractorServices(models.Model):
    contractor = models.ForeignKey(Contractor, on_delete=models.CASCADE, related_name='contractor_services')
    service = models.ForeignKey(Services, on_delete=models.CASCADE, related_name='service_contractors')
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('contractor', 'service')