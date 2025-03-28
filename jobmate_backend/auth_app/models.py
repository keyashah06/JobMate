from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class MFACode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(editable=False)  # Prevent manual edits

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"MFA code for {self.user.username}"

    class Meta:
        ordering = ['-created_at']  # Ensures latest codes are fetched first
