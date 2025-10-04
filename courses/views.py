from django.shortcuts import render, redirect, get_object_or_404
from .models import Course
from accounts.views import role_required
from django.contrib.auth.decorators import login_required
from django.shortcuts import render


# Only admins can create courses
@role_required('admin')
def create_course(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        Course.objects.create(title=title, description=description, created_by=request.user)
        return redirect('list_courses')
    return render(request, 'courses/create_course.html')

# Anyone can see the course list
def list_courses(request):
    courses = Course.objects.all()
    return render(request, 'courses/list_courses.html', {'courses': courses})

# Enroll the logged-in user in a course
def enroll_course(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    course.students.add(request.user)
    return redirect('dashboard')


# updated Code


@role_required('admin')
def create_course(request):
    if request.method == 'POST':
        # Optional: Handle basic course title and description creation
        title = request.POST.get('title')
        description = request.POST.get('description')
        Course.objects.create(title=title, description=description, created_by=request.user)
        return redirect('list_courses')

    return render(request, 'courses/create_course.html')