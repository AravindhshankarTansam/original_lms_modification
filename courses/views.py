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
        image = request.FILES.get('image')

        if course_id:
            course = get_object_or_404(Course, id=course_id)
            course.title = title
            course.description = description
            course.overview = overview
            course.requirements = requirements
            course.status = status
            if image:
                course.image = image
            course.save()
            course.modules.all().delete()  # Clear old modules
        else:
            course = Course.objects.create(
                title=title,
                description=description,
                overview=overview,
                requirements=requirements,
                status=status,
                image=image,
                created_by=request.user
            )

        # Save modules, chapters, questions
        modules_data = json.loads(request.POST.get('modules_json', '[]'))
        for m in modules_data:
            module = Module.objects.create(course=course, title=m['title'])
            for ch in m.get('chapters', []):
                Chapter.objects.create(
                    module=module,
                    title=ch['title'],
                    description=ch['desc'],
                    material_type=ch.get('type')
                )
            for q in m.get('questions', []):
                Question.objects.create(
                    module=module,
                    question_type=q['type'],
                    question_text=q['qText'],
                    correct_answer=q['cAns'],
                    option1=q.get('option1'),
                    option2=q.get('option2'),
                    option3=q.get('option3'),
                    option4=q.get('option4')
                )

        return redirect('list_courses')

    return render(request, 'courses/create_course.html')
