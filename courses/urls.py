from django.urls import path
from . import views

urlpatterns = [
    path('course/', views.course_table, name='course_table'),            # Table page
    path('create/', views.create_or_update_course, name='create_course'),  # Add course form
    path('update/<int:course_id>/', views.create_or_update_course, name='update_course'),  # Edit course form
    path('list/', views.course_table, name='list_courses'),  

]
