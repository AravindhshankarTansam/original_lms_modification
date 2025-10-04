from django.db import models
from accounts.models import User


DIFFICULTY_CHOICES = [
    ('easy', 'Beginner'),
    ('medium', 'Intermediate'),
    ('hard', 'Expert'),
    ('all_levels', 'All Levels'),
]

QUESTION_TYPE_CHOICES = [
    ('multiple_choice', 'Multiple Choice'),
    ('true_false', 'True / False'),
]

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role':'admin'})
    students = models.ManyToManyField(User, related_name='enrolled_courses', blank=True)

    def __str__(self):
        return self.title

class Assessment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()




