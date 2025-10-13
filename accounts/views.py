# Create your views here.
import os
from django.shortcuts import render, redirect, get_object_or_404
from .forms import RegisterForm, LoginForm, ProfileForm, SetPasswordForm
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from .models import User  
from courses.models import Course  # Import Course model
import re
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.decorators import login_required
import json
from django.core.paginator import Paginator
from django.db.models import Q

def landing_page(request):
    # Paths to JSON files
    slides_path = os.path.join(settings.BASE_DIR, 'static', 'json', 'slides.json')
    services_path = os.path.join(settings.BASE_DIR, 'static', 'json', 'service.json')
    popular_courses_path = os.path.join(settings.BASE_DIR, 'static', 'json', 'popular_courses.json')
    trending_courses_path = os.path.join(settings.BASE_DIR, 'static', 'json', 'trending_courses.json')

    # Load JSON data
    with open(slides_path, 'r', encoding='utf-8') as f:
        slides = json.load(f)
    with open(services_path, 'r', encoding='utf-8') as f:
        services = json.load(f)
    with open(popular_courses_path, 'r', encoding='utf-8') as f:
        popular_courses = json.load(f)
    with open(trending_courses_path, 'r', encoding='utf-8') as f:
        trending_courses = json.load(f)

    # Define categories
    categories = [
        "Innovative Manufacturing",
        "Smart Factory",
        "AR/VR/MR",
        "Product Lifecycle Management",
        "Asset Performance",
        "Product Innovation",
        "Predictive Engineering",
        "Front-end Development",
        "Backend Development",
        "AI/ML",
    ]

    # Pass data to template
    context = {
        'slides': slides,
        'services': services,
        'popular_courses': popular_courses,
        'trending_courses': trending_courses,
        'categories': categories,  # ✅ pass categories list
    }

    return render(request, 'index.html', context)


# helper decorator
def role_required(role):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            if request.user.role != role:
                return redirect('dashboard')
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


# helper function to send verification email
def send_verification_email(user):
    code = random.randint(100000, 999999)
    subject = 'Email Verification Code'
    message = f'Hello {user.username}, your verification code is {code}.'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]

    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    return code


# STEP 1: Registration (no password yet)
def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_unusable_password()   # no password yet
            user.is_active = False
            user.save()

            code = send_verification_email(user)  # use the helper
            request.session['verification_code'] = code
            request.session['user_id'] = user.id
            return redirect('verify')
    else:
        form = RegisterForm()
    return render(request, 'accounts/register.html', {'form': form})


# STEP 2: Verify OTP
def verify_code(request):
    if request.method == 'POST':
        input_code = request.POST.get('code')
        user_id = request.session.get('user_id')

        if str(request.session.get('verification_code')) == str(input_code):
            user = User.objects.get(id=user_id)
            user.is_active = True
            user.save()
            # redirect to password set page
            return redirect('setpassword')
        else:
            messages.error(request, 'Invalid code!')

    return render(request, 'accounts/verify.html')


from .forms import CustomSetPasswordForm  # import your custom form

# STEP 3: Set Password (after OTP success)
# This part remains the same in your views.py
def set_password(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')

    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        password1 = request.POST.get('new_password1')
        password2 = request.POST.get('new_password2')

        # --- Basic Validation ---
        errors = []
        if not password1 or not password2:
            errors.append("Both password fields are required.")
        elif password1 != password2:
            errors.append("Passwords do not match.")
        else:
            # Password complexity check
            if len(password1) < 8:
                errors.append("Password must be at least 8 characters long.")
            if not re.search(r'[A-Z]', password1):
                errors.append("Password must contain an uppercase letter.")
            if not re.search(r'[a-z]', password1):
                errors.append("Password must contain a lowercase letter.")
            if not re.search(r'[0-9]', password1):
                errors.append("Password must contain a number.")
            if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password1):
                errors.append("Password must contain a special character (!@#$%^&*).")

        # --- If errors, show them ---
        if errors:
            for error in errors:
                messages.error(request, error)
            return render(request, 'accounts/setpassword.html')

        # --- Save password safely ---
        user.set_password(password1)
        user.save()

        # Auto-login after setting password
        user = authenticate(username=user.username, password=password1)
        if user:
            login(request, user)
            messages.success(request, "Password set successfully!")
            return redirect('dashboard')
        else:
            messages.warning(request, "Password set but login failed.")
            return redirect('login')

    return render(request, 'accounts/setpassword.html')


# login
def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request=request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            # Redirect based on role
            if user.role in ['admin', 'superuser']:
                return redirect('admin_dashboard')  # admin & superuser go here
            else:
                return redirect('dashboard')        # normal users go here
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form})


# logout
def user_logout(request):
    logout(request)
    return redirect('login')


# dashboard
def dashboard(request):
    return render(request, 'accounts/user/dashboard.html')


@login_required
def admin_dashboard(request):
    if request.user.role not in ['admin', 'superuser']:
        return redirect('dashboard')  # normal users cannot access

    total_users = User.objects.count()
    total_courses = Course.objects.count()

    # Get search query
    query = request.GET.get('q', '')

    # Filter users based on search
    users = User.objects.all()
    if query:
        users = users.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(phone_number__icontains=query)  # replace with your actual phone field name
        )

    # Pagination: 10 users per page
    paginator = Paginator(users, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'total_users': total_users,
        'total_courses': total_courses,
        'page_obj': page_obj,
        'query': query
    }

    return render(request, 'accounts/admin/base.html', context)


# profile
@login_required
def profile(request):
    if request.method == "POST":
        form = ProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect("profile")
    else:
        form = ProfileForm(instance=request.user)

    return render(request, "accounts/admin/profile.html", {"form": form, "user": request.user})

@login_required
def profile(request):
    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect("user_profile")  # redirect to same profile page
    else:
        form = ProfileForm(instance=request.user)

    return render(request, "accounts/user/profile.html", {
        "form": form,
        "user": request.user
    })
