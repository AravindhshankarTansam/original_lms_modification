from django.contrib.auth.models import AbstractUser
from django.db import models
import os

def user_profile_image_path(instance, filename):
    """
    Upload profile image to MEDIA_ROOT/profile_images/<username>/<filename>
    e.g., profile_images/admin/john.png
    """
    return os.path.join("profile_images", instance.username, filename)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('superuser', 'Superuser'),
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_image = models.ImageField(
        upload_to=user_profile_image_path,
        default="profile_images/default/no_bg_user.png"
    )
