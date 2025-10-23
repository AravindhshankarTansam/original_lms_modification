from django.db import models
from accounts.models import User
import os
from django.utils.text import slugify

QUESTION_TYPE_CHOICES = [
    ('mcq', 'Multiple Choice'),
    ('truefalse', 'True / False'),
    ('short', 'Short Answer'),
]

MATERIAL_TYPE_CHOICES = [
    ('video', 'Video'),
    ('pdf', 'PDF'),
    ('ppt', 'PPT'),
]

def course_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/courses/<course_title>/<filename>
    course_slug = slugify(instance.module.course.title)  # go through module
    return f'courses/{course_slug}/{filename}'

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    overview = models.TextField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=[('Active','Active'),('Inactive','Inactive')], default='Active')
    image = models.ImageField(upload_to='course_images/', blank=True, null=True)
    category_names = models.TextField(blank=True, null=True) 
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role':'admin'})
    students = models.ManyToManyField(User, related_name='enrolled_courses', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title

class Chapter(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    description = models.TextField()
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES, blank=True, null=True)
    material_file = models.FileField(upload_to=course_directory_path, blank=True, null=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    question_text = models.TextField()
    option1 = models.CharField(max_length=255, blank=True, null=True)
    option2 = models.CharField(max_length=255, blank=True, null=True)
    option3 = models.CharField(max_length=255, blank=True, null=True)
    option4 = models.CharField(max_length=255, blank=True, null=True)
    correct_answer = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.question_text



class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)  # Category name
    icon = models.CharField(max_length=100, blank=True, null=True)  # Optional icon class for frontend

    def __str__(self):
        return self.name


class SubCategory(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='subcategories'
    )
    name = models.CharField(max_length=255)  # SubCategory name

    class Meta:
        unique_together = ('category', 'name')  # Ensure no duplicates in a category

    def __str__(self):
        return f"{self.category.name} -> {self.name}"