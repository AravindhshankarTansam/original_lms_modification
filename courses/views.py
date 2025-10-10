import json
from django.shortcuts import render, redirect, get_object_or_404
from .models import Course, Module, Chapter, Question
from accounts.views import role_required
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.conf import settings

# Only admins can create courses
# @role_required('admin')
# def create_course(request):
#     if request.method == 'POST':
#         title = request.POST.get('title')
#         description = request.POST.get('description')
#         Course.objects.create(title=title, description=description, created_by=request.user)
#         return redirect('list_courses')
#     return render(request, 'courses/create_course.html')

# Anyone can see the course list
@role_required('admin')
@login_required
def list_courses(request):
    courses_qs = Course.objects.all()
    data = []

    for c in courses_qs:
        # Convert each course to a dict for JS
        data.append({
            "id": c.id,
            "title": c.title,
            "status": c.status or "Inactive",
            "description": c.description or "",
            "overview": c.overview or "",
            "requirements": c.requirements or "",
            # Optionally, you can send modules too if you want to prefill the edit modal
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

    return render(request, 'courses/create_course.html', {'courses': json.dumps(data)})



# Enroll the logged-in user in a course
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    course.students.add(request.user)
    return redirect('dashboard')

@role_required('admin')
@login_required
def create_course(request):
    if request.method == 'POST':
        # Course basic info
        title = request.POST.get('title')
        description = request.POST.get('description')
        overview = request.POST.get('overview')
        requirements = request.POST.get('requirements')
        status = 'Active' if request.POST.get('status') == 'true' else 'Inactive'
        image = request.FILES.get('image')

        course = Course.objects.create(
            title=title,
            description=description,
            overview=overview,
            requirements=requirements,
            status=status,
            image=image,
            created_by=request.user
        )

        # Handle modules
        modules = request.POST.getlist('modules')  # JSON or stringified structure
        import json
        modules_data = json.loads(request.POST.get('modules_json', '[]'))

        for m in modules_data:
            module = Module.objects.create(course=course, title=m['title'])

            for ch in m.get('chapters', []):
                # Save chapter file
                material_file = request.FILES.get(ch.get('material_name')) if ch.get('material_name') else None
                Chapter.objects.create(
                    module=module,
                    title=ch['title'],
                    description=ch['desc'],
                    material_type=ch.get('type'),
                    material_file=material_file
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