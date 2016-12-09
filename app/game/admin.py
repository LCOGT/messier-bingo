from django.contrib import admin
from .models import *

class MessierObjectAdmin(admin.ModelAdmin):
    list_display = ['name','avm_code','enabled']
    list_filter = ['avm_code',]
    list_editable = ('enabled',)
    ordering = ['name',]
    list_per_page = 30

admin.site.register(MessierObject, MessierObjectAdmin)
admin.site.register(Telescope)
admin.site.register(Proposal)
