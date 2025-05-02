from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank = True, null = True) # done
    email = models.EmailField(max_length=100, blank = True, null = True) # done
    phone = models.CharField(max_length=20, blank = True, null = True) # done
    education = models.TextField(blank = True, null = True) # done
    experience = models.TextField(blank=True, null=True) # done
    skills = models.TextField(blank=True, null=True) # done
    projects = models.TextField(blank=True, null=True) # done
    resume_file = models.FileField(upload_to='resumes/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, null = True, blank= True)

    #employment
    ethnicity = models.CharField(max_length=100, blank=True, null=True)
    workAuthUS = models.BooleanField(default=False)
    workAuthCanada = models.BooleanField(default=False)
    workAuthUK = models.BooleanField(default=False)
    requireSponsorship = models.BooleanField(default=False)
    disability = models.BooleanField(default=False)
    lgbtq = models.BooleanField(default=False)
    gender = models.CharField(max_length=50, blank=True, null=True)
    veteran = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.user.username}'s Resume"