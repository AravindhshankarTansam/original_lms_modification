from django.db import models
from accounts.models import User
import os
from django.utils.text import slugify
import subprocess
import json


def get_video_duration(file_path):
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "json",
                file_path,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        info = json.loads(result.stdout)
        duration = float(info["format"]["duration"])
        return round(duration / 60, 2)  # convert seconds → minutes
    except Exception as e:
        print("Error getting video duration:", e)
        return 0.0


QUESTION_TYPE_CHOICES = [
    ("mcq", "Multiple Choice"),
    ("truefalse", "True / False"),
    ("short", "Short Answer"),
    ("pdf", "PDF Document"),
]

MATERIAL_TYPE_CHOICES = [
    ("video", "Video"),
    ("pdf", "PDF"),
    ("ppt", "PPT"),
]


def course_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/courses/<course_title>/<filename>
    course_slug = slugify(instance.module.course.title)  # go through module
    return f"courses/{course_slug}/{filename}"


class Course(models.Model):
    LEVEL_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    overview = models.TextField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=10,
        choices=[("Active", "Active"), ("Inactive", "Inactive")],
        default="Active",
    )
    image = models.ImageField(upload_to="course_images/", blank=True, null=True)
    tags = models.TextField(blank=True, null=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="Beginner")
    rating = models.FloatField(default=0.0)
    review_count = models.PositiveIntegerField(default=0)
    badge = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, limit_choices_to={"role": "admin"}
    )
    students = models.ManyToManyField(User, related_name="enrolled_courses", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_hours(self):
        return sum(ch.duration for m in self.modules.all() for ch in m.chapters.all())

    def lectures_count(self):
        return sum(m.chapters.count() for m in self.modules.all())

    def __str__(self):
        return self.title


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=255)

    def __str__(self):
        return self.title


class Chapter(models.Model):
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="chapters"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    material_file = models.FileField(
        upload_to=course_directory_path, blank=True, null=True
    )
    material_type = models.CharField(max_length=50, blank=True, null=True)
    duration = models.FloatField(default=0.0)

    def save(self, *args, **kwargs):
        # ✅ If updating: check if an old file exists
        try:
            old_instance = Chapter.objects.get(pk=self.pk)
        except Chapter.DoesNotExist:
            old_instance = None

        # ✅ Handle material update (delete old file)
        if (
            old_instance
            and old_instance.material_file
            and old_instance.material_file != self.material_file
        ):
            old_path = old_instance.material_file.path
            if os.path.exists(old_path):
                os.remove(old_path)

        # ✅ Handle video duration update
        if self.material_file and self.material_file.name.lower().endswith(
            (".mp4", ".mov", ".mkv", ".avi")
        ):
            try:
                duration = get_video_duration(self.material_file.path)
                self.duration = duration
            except Exception as e:
                print(f"Error extracting duration for {self.material_file.name}: {e}")

        super().save(*args, **kwargs)


class Question(models.Model):
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="questions"
    )
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
    icon = models.CharField(
        max_length=100, blank=True, null=True
    )  # Optional icon class for frontend

    def __str__(self):
        return self.name


class SubCategory(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="subcategories"
    )
    name = models.CharField(max_length=255)  # SubCategory name

    class Meta:
        unique_together = ("category", "name")  # Ensure no duplicates in a category

    def __str__(self):
        return f"{self.category.name} -> {self.name}"
