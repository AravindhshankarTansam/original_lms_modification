import json
import os
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.conf import settings
from .models import Course, Module, Chapter, Question
import subprocess
from accounts.views import role_required
from .models import Category, SubCategory


@role_required("admin")
@login_required
def course_table(request):
    """Show table of all courses"""
    courses = Course.objects.all()
    return render(request, "courses/course_table.html", {"courses": courses})


def delete_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    course.delete()
    return redirect("course_table")


@role_required("admin")
@login_required
def list_courses(request):
    """List all courses and send JSON data to template

    NOTE: includes chapter file_url so frontend can show/keep existing files.
    """
    courses_qs = Course.objects.all().prefetch_related(
        "modules__chapters", "modules__questions"
    )
    data = []
    categories = Category.objects.all()

    for c in courses_qs:
        data.append(
            {
                "id": c.id,
                "title": c.title,
                "status": c.status or "Inactive",
                "description": c.description or "",
                "overview": c.overview or "",
                "requirements": c.requirements or "",
                "image_url": c.image.url if c.image else "",
                "modules": [
                    {
                        "title": m.title,
                        "chapters": [
                            {
                                "title": ch.title,
                                "desc": ch.description,
                                "type": ch.material_type,
                                "file_url": (
                                    ch.material_file.url
                                    if getattr(ch, "material_file", None)
                                    and ch.material_file
                                    else ""
                                ),
                            }
                            for ch in m.chapters.all()
                        ],
                        "questions": [
                            {
                                "type": q.question_type,
                                "qText": q.question_text,
                                "cAns": q.correct_answer,
                                "option1": q.option1,
                                "option2": q.option2,
                                "option3": q.option3,
                                "option4": q.option4,
                            }
                            for q in m.questions.all()
                        ],
                    }
                    for m in c.modules.all()
                ],
            }
        )

    return render(
        request,
        "courses/create_course.html",
        {
            "courses_json": json.dumps(data, ensure_ascii=False),
            "categories": categories,
        },
    )


@role_required("admin")
@login_required
def create_or_update_course(request, course_id=None):
    """
    Create a new course or edit an existing course.
    Saves selected categories as JSON in `category_name`.
    Handles modules, chapters, questions, and file uploads.
    """
    # Fetch course if editing
    course = get_object_or_404(Course, id=course_id) if course_id else None
    categories = Category.objects.all()

    if request.method == "POST":
        # ----- BASIC COURSE INFO -----
        title = request.POST.get("title")
        description = request.POST.get("description")
        overview = request.POST.get("overview")
        requirements = request.POST.get("requirements")
        status = "Active" if request.POST.get("status") == "true" else "Inactive"
        level = request.POST.get("level", "Beginner")
        image = request.FILES.get("image")
        
        # ----- CATEGORIES -----
        category_ids = request.POST.getlist("category")  # selected category IDs
        category_json = json.dumps(category_ids)

        # ----- CREATE OR UPDATE COURSE -----
        if course:
            course.title = title
            course.description = description
            course.overview = overview
            course.requirements = requirements
            course.status = status
            course.level = level
            course.tags = category_json
            if image:
                course.image = image
            course.save()
            # Clear old modules
            course.modules.all().delete()
        else:
            course = Course.objects.create(
                title=title,
                description=description,
                overview=overview,
                requirements=requirements,
                status=status,
                level=level,
                tags=category_json,
                image=image,
                created_by=request.user,
            )

        # ----- MODULES, CHAPTERS, QUESTIONS -----
        modules_json = request.POST.get("modules_json")
        try:
            modules_data = json.loads(modules_json or "[]")
        except Exception as e:
            print("Error parsing modules JSON:", e)
            modules_data = []

        for m_idx, m in enumerate(modules_data):
            module = Module.objects.create(course=course, title=m.get("title", ""))

            # Chapters
            for c_idx, ch in enumerate(m.get("chapters", [])):
                file_field_name = f"material_{m_idx}_{c_idx}"
                uploaded_file = request.FILES.get(file_field_name)

                chapter = Chapter.objects.create(
                    module=module,
                    title=ch.get("title", ""),
                    description=ch.get("desc", ""),
                    material_type=ch.get("type", None),
                    duration=ch.get("duration", 0.0),
                )

                if uploaded_file:
                    chapter.material_file = uploaded_file
                    chapter.save()

                    # Auto video duration
                    if ch.get("type") == "video":
                        try:
                            result = subprocess.run(
                                [
                                    "ffprobe",
                                    "-v",
                                    "error",
                                    "-show_entries",
                                    "format=duration",
                                    "-of",
                                    "default=noprint_wrappers=1:nokey=1",
                                    chapter.material_file.path,
                                ],
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                            )
                            duration_seconds = float(result.stdout.strip() or 0)
                            chapter.duration = round(
                                duration_seconds / 60, 2
                            )  # in minutes
                            chapter.save()
                        except Exception as e:
                            print("FFprobe error:", e)
                else:
                    # Existing file from URL
                    file_url = ch.get("file_url") or ""
                    if file_url:
                        media_url = settings.MEDIA_URL
                        if file_url.startswith(media_url):
                            relative_path = file_url[len(media_url) :]
                        else:
                            idx = file_url.find(media_url)
                            relative_path = (
                                file_url[idx + len(media_url) :]
                                if idx != -1
                                else file_url.split("/")[-1]
                            )
                        chapter.material_file.name = relative_path
                        chapter.save()

            # Questions
            for q in m.get("questions", []):
                Question.objects.create(
                    module=module,
                    question_type=q.get("type", "short"),
                    question_text=q.get("qText", ""),
                    correct_answer=q.get("cAns", ""),
                    option1=q.get("option1", ""),
                    option2=q.get("option2", ""),
                    option3=q.get("option3", ""),
                    option4=q.get("option4", ""),
                )

        return redirect("list_courses")

    # ----- GET REQUEST: Populate form -----
    selected_categories = []
    if course and course.tags:
        try:
            selected_categories = [str(cid) for cid in json.loads(course.tags)]
        except Exception:
            selected_categories = []

    # Prepare courses JSON for frontend
    courses_qs = Course.objects.all().prefetch_related(
        "modules__chapters", "modules__questions"
    )
    data = []
    for c in courses_qs:
        data.append(
            {
                "id": c.id,
                "title": c.title,
                "status": c.status or "Inactive",
                "description": c.description or "",
                "overview": c.overview or "",
                "requirements": c.requirements or "",
                "image_url": c.image.url if c.image else "",
                "level": c.level,
                "total_hours": (
                    c.total_hours()
                    if callable(c.total_hours)
                    else getattr(c, "total_hours", 0)
                ),
                "lectures_count": (
                    c.lectures_count()
                    if callable(c.lectures_count)
                    else getattr(c, "lectures_count", 0)
                ),
                "last_updated": (
                    c.updated_at.strftime("%Y-%m-%d") if c.updated_at else ""
                ),
                "rating": c.rating() if callable(c.rating) else getattr(c, "rating", 0),
                "reviews_count": (
                    c.review_count()
                    if callable(c.review_count)
                    else getattr(c, "review_count", 0)
                ),
                "badge": c.badge or "",
                "modules": [
                    {
                        "title": m.title,
                        "chapters": [
                            {
                                "title": ch.title,
                                "desc": ch.description,
                                "type": ch.material_type,
                                "duration": ch.duration,
                                "file_url": (
                                    ch.material_file.url
                                    if getattr(ch, "material_file", None)
                                    and ch.material_file
                                    else ""
                                ),
                            }
                            for ch in m.chapters.all()
                        ],
                        "questions": [
                            {
                                "type": q.question_type,
                                "qText": q.question_text,
                                "cAns": q.correct_answer,
                                "option1": q.option1,
                                "option2": q.option2,
                                "option3": q.option3,
                                "option4": q.option4,
                            }
                            for q in m.questions.all()
                        ],
                    }
                    for m in c.modules.all()
                ],
            }
        )

    return render(
        request,
        "courses/create_course.html",
        {
            "course": course,
            "categories": categories,
            "selected_categories": selected_categories,
            "courses_json": json.dumps(data, ensure_ascii=False),
        },
    )


def course_categories(request):
    categories = Category.objects.prefetch_related("subcategories").all()

    if request.method == "POST":
        name = request.POST.get("name")
        subcategory_name = request.POST.get("subcategory_name")

        if name:
            category, created = Category.objects.get_or_create(name=name)

            if subcategory_name:
                SubCategory.objects.get_or_create(
                    category=category, name=subcategory_name
                )

        return redirect("category")  # redirect to same page name defined in urls

    return render(request, "category.html", {"categories": categories})
