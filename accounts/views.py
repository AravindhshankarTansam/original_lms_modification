# Create your views here.
from django.shortcuts import render, redirect
from .forms import RegisterForm, LoginForm
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from .models import User
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.decorators import login_required
from .forms import ProfileForm

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

# heler function to send verification email
def send_verification_email(user):
    code = random.randint(100000, 999999)
    subject = 'Email Verification Code'
    message = f'Hello {user.username}, your verification code is {code}.'
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [user.email]

    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
    return code

# registration
def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            code = send_verification_email(user)  # use the helper
            request.session['verification_code'] = code
            request.session['user_id'] = user.id
            return redirect('verify')
    else:
        form = RegisterForm()
    return render(request, 'accounts/register.html', {'form': form})


# verify code
def verify_code(request):
    if request.method == 'POST':
        input_code = request.POST.get('code')
        user_id = request.session.get('user_id')
        if str(request.session.get('verification_code')) == str(input_code):
            user = User.objects.get(id=user_id)
            user.is_active = True
            user.save()
            messages.success(request, 'Email verified! You can login now.')
            return redirect('login')
        else:
            messages.error(request, 'Invalid code!')
    return render(request, 'accounts/verify.html')

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
    return render(request, 'accounts/admin/base.html')

# accounts/views.py
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
