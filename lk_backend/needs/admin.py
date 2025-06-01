from django.contrib import admin
from .models import Services ,Requirments,ContractorServices

# Register your models here.
admin.site.register(Requirments)
admin.site.register(Services)
admin.site.register(ContractorServices)