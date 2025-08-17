from django.contrib import admin
from .models import (
    Tenders, TenderRequirement, TenderBids, TenderAssignment,
    TenderAttachment, TenderAuditLog, TenderVersion,
    VirtualAppointment, PhysicalVisit, TenderCreationAssistance,
    SupervisorServices
)

admin.site.register(Tenders)
admin.site.register(TenderRequirement)
admin.site.register(TenderBids)
admin.site.register(TenderAssignment)
admin.site.register(TenderAttachment)
admin.site.register(TenderAuditLog)
admin.site.register(TenderVersion)
admin.site.register(VirtualAppointment)
admin.site.register(PhysicalVisit)
admin.site.register(TenderCreationAssistance)
admin.site.register(SupervisorServices)
