import json
import os
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.conf import settings
from .models import Course, Module, Chapter, Question
from accounts.views import role_required
from .models import Category, SubCategory

@role_required('admin')
@login_required
def course_table(request):
    """Show table of all courses"""
    courses = Course.objects.all()
    return render(request, 'courses/course_table.html', {'courses': courses})


def delete_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    course.delete()
    return redirect('course_table')


@role_required('admin')
@login_required
def list_courses(request):
    """List all courses and send JSON data to template

    NOTE: includes chapter file_url so frontend can show/keep existing files.
    """
    courses_qs = Course.objects.all().prefetch_related('modules__chapters', 'modules__questions')
    data = []

    for c in courses_qs:
        data.append({
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
                            "file_url": ch.material_file.url if getattr(ch, "material_file", None) and ch.material_file else ""
                        } for ch in m.chapters.all()
                    ],
                    "questions": [
                        {
                            "type": q.question_type,
                            "qText": q.question_text,
                            "cAns": q.correct_answer,
                            "option1": q.option1,
                            "option2": q.option2,
                            "option3": q.option3,
                            "option4": q.option4
                        } for q in m.questions.all()
                    ]
                } for m in c.modules.all()
            ]
        })

    return render(request, 'courses/create_course.html', {
        'courses_json': json.dumps(data, ensure_ascii=False)
    })


@role_required('admin')
@login_required
def create_or_update_course(request, course_id=None):
    """Create or update a course. Supports uploading chapter files in request.FILES with keys:
       material_<module_index>_<chapter_index>
    """
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        overview = request.POST.get('overview')
        requirements = request.POST.get('requirements')
        status = 'Active' if request.POST.get('status') == 'true' else 'Inactive'
        modules_json = request.POST.get('modules_json')
        image = request.FILES.get('image')

        # If editing, fetch existing course else create new
        if course_id:
            course = get_object_or_404(Course, id=course_id)
        else:
            course = Course(created_by=request.user)

        course.title = title
        course.description = description
        course.overview = overview
        course.requirements = requirements
        course.status = status
        if image:
            course.image = image
        course.save()

        # We'll remove existing modules and recreate them.
        # To preserve existing chapter files when the frontend didn't upload a new file,
        # frontend should send file_url for existing ones (we included that in list_courses).
        if course_id:
            # delete old module/chapter/question records (files on disk remain)
            course.modules.all().delete()

        try:
            modules_data = json.loads(modules_json or '[]')
        except Exception as e:
            print("Error parsing modules JSON:", e)
            modules_data = []

        # Iterate with indexes so we can match request.FILES keys
        for m_idx, m in enumerate(modules_data):
            module = Module.objects.create(course=course, title=m.get('title', '') or '')
            for c_idx, ch in enumerate(m.get('chapters', [])):
                # file key in request.FILES if user uploaded a new file for this chapter
                file_field_name = f'material_{m_idx}_{c_idx}'
                uploaded_file = request.FILES.get(file_field_name)

                # Create chapter without file first, then attach file or preserve existing URL if necessary
                chapter = Chapter.objects.create(
                    module=module,
                    title=ch.get('title', '') or '',
                    description=ch.get('desc', '') or '',
                    material_type=ch.get('type') or None
                )

                if uploaded_file:
                    # A brand new file uploaded for this chapter
                    chapter.material_file = uploaded_file
                    chapter.save()
                else:
                    # No new file uploaded; backend will preserve existing file if frontend provided file_url
                    file_url = ch.get('file_url') or ""
                    if file_url:
                        # Try to convert absolute URL to relative path inside MEDIA_ROOT
                        media_url = settings.MEDIA_URL
                        # If MEDIA_URL is absolute (with domain) this still works for splitting; try safe methods
                        if file_url.startswith(media_url):
                            relative_path = file_url[len(media_url):]
                        else:
                            # Try to find MEDIA_URL inside the url
                            idx = file_url.find(media_url)
                            if idx != -1:
                                relative_path = file_url[idx + len(media_url):]
                            else:
                                # fallback: if file_url is absolute, try to extract path after last '/'
                                relative_path = file_url.split('/')[-1]
                        # Assign the stored path to the FileField name so Django knows where the file is
                        # Only assign if relative_path looks reasonable
                        chapter.material_file.name = relative_path
                        chapter.save()
                    # else: no file_url and no upload -> leave material_file as null

            for q in m.get('questions', []):
                Question.objects.create(
                    module=module,
                    question_type=q.get('type', 'short'),
                    question_text=q.get('qText', ''),
                    correct_answer=q.get('cAns', ''),
                    option1=q.get('option1', ''),
                    option2=q.get('option2', ''),
                    option3=q.get('option3', ''),
                    option4=q.get('option4', ''),
                )

        return redirect('list_courses')

    # GET request: fetch courses to populate template (same as list_courses)
    courses_qs = Course.objects.all().prefetch_related('modules__chapters', 'modules__questions')
    data = []
    for c in courses_qs:
        data.append({
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
                            "file_url": ch.material_file.url if getattr(ch, "material_file", None) and ch.material_file else ""
                        } for ch in m.chapters.all()
                    ],
                    "questions": [
                        {
                            "type": q.question_type,
                            "qText": q.question_text,
                            "cAns": q.correct_answer,
                            "option1": q.option1,
                            "option2": q.option2,
                            "option3": q.option3,
                            "option4": q.option4
                        } for q in m.questions.all()
                    ]
                } for m in c.modules.all()
            ]
        })

    return render(request, 'courses/create_course.html', {
        'courses_json': json.dumps(data, ensure_ascii=False)
    })

def course_categories(request):
    categories = Category.objects.prefetch_related('subcategories').all()

    if request.method == 'POST':
        category_name = request.POST.get('category_name')
        subcategory_name = request.POST.get('subcategory_name')

        if category_name:
            category, created = Category.objects.get_or_create(name=category_name)

            if subcategory_name:
                SubCategory.objects.get_or_create(category=category, name=subcategory_name)

        return redirect('category')  # redirect to same page name defined in urls

    return render(request, 'category.html', {'categories': categories})