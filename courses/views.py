import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.conf import settings
from .models import Course, Module, Chapter, Question
from accounts.views import role_required

@role_required('admin')
@login_required
def list_courses(request):
    """List all courses and send JSON data to template"""
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
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        overview = request.POST.get('overview')
        requirements = request.POST.get('requirements')
        status = 'Active' if request.POST.get('status') == 'true' else 'Inactive'
        modules_json = request.POST.get('modules_json')
        image = request.FILES.get('image')

        # If course_id exists, edit; else create new
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

        # Clear existing modules if editing
        if course_id:
            course.modules.all().delete()
        try:
            modules_data = json.loads(modules_json or '[]')
            for m in modules_data:
                module = Module.objects.create(course=course, title=m.get('title', ''))
                for ch in m.get('chapters', []):
                    Chapter.objects.create(
                        module=module,
                        title=ch.get('title', ''),
                        description=ch.get('desc', ''),
                        material_type=ch.get('type', None)
                    )
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
        except Exception as e:
            print("Error parsing modules JSON:", e)

        return redirect('list_courses')

    # GET request: fetch courses to populate template
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
