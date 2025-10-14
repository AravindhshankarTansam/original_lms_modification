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



class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')  # prevent duplicate enrollments

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"