from django.urls import path
from . import views
from .views import mark_chapter_complete

urlpatterns = [
    path('register/', views.register, name='register'),
    path('verify/', views.verify_code, name='verify'),
    path('set-password/', views.set_password, name='setpassword'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path("profile/", views.profile, name="profile"),
    path('user-profile/', views.profile, name='user_profile'),
    path('courses/', views.courses_catalog, name='courses_catalog'),
    path('my-courses/', views.my_courses, name='my_courses'),
    path('courses/play/', views.course_play, name='course_play'), 
    path('accounts/courses/enroll/', views.enroll_course, name='enroll_course'),
    path('courses/play/<int:course_id>/', views.course_play, name='course_play'),
    path('courses/mark-complete/<int:chapter_id>/', mark_chapter_complete, name='mark_chapter_complete'),



]
