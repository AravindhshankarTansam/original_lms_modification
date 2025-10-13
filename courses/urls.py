from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_or_update_course, name='create_course'),  # matches JS `{% url 'create_course' %}`
    path('update/<int:course_id>/', views.create_or_update_course, name='update_course'),  # for editing
    path('list/', views.list_courses, name='list_courses'),
]
