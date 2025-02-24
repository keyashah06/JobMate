from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank = True, null = True)
    email = models.EmailField(max_length=100, blank = True, null = True)
    phone = models.CharField(max_length=20, blank = True, null = True)
    education = models.TextField(blank = True, null = True)
    experience = models.TextField(blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    projects = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Resume"