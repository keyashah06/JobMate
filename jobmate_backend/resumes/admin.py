from django.contrib import admin

# Register your models here.


from .models import Resume

class ResumeAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'name', 'email', 'phone', 'education', 'experience', 'skills', 
        'projects', 'resume_file', 'uploaded_at'
    )  # Displaying all fields

admin.site.register(Resume, ResumeAdmin)
