from django.contrib import admin

from .models import *

admin.site.register(Tenders)
admin.site.register(Tender_requirments)
admin.site.register(Tender_contractors)
admin.site.register(TenderBids)
admin.site.register(TenderAssignment)

