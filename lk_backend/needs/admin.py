from django.contrib import admin
from .models import Services, Requirements, RequirementCategory, ContractorServices

# Register your models here.
admin.site.register(Requirements)
admin.site.register(Services)
admin.site.register(RequirementCategory)
admin.site.register(ContractorServices)