from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_course, name='create_course'),
    path('list/', views.list_courses, name='list_courses'),
    path('enroll/<int:course_id>/', views.enroll_course, name='enroll_course'),
    path('create/', views.create_course, name='create_course'),
    
]
