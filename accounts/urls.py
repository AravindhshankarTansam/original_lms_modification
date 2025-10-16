from django.urls import path
from . import views

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
    # path('courses/play/', views.course_play, name='course_play'), 
    path('courses/play/<int:course_id>/', views.course_play, name='course_play')


    



]
