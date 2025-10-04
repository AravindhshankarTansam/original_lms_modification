# Create your views here.
from django.shortcuts import render, redirect, get_object_or_404
from .forms import RegisterForm, LoginForm, ProfileForm, SetPasswordForm
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from .models import User
import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.decorators import login_required


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
def set_password(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login')  # Redirect if no user_id in session
    user = get_object_or_404(User, id=user_id)
    
    if request.method == "POST":
        form = CustomSetPasswordForm(user, request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Password updated successfully!")
            user = authenticate(username=user.username, password=request.POST['password1'])
            if user:
                login(request, user)
            return redirect("login")
        else:
            # Debug: Print errors to console
            print(form.errors)  # Add this to check errors in the server console
    else:
        form = CustomSetPasswordForm(user)
    
    return render(request, "accounts/setpassword.html", {"form": form})
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
    return render(request, 'accounts/dashboard.html')


@login_required
def admin_dashboard(request):
    if request.user.role not in ['admin', 'superuser']:
        return redirect('dashboard')  # normal users cannot access
    return render(request, 'accounts/admin/base.html')


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
