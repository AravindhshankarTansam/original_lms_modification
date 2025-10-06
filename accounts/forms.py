from django import forms
from django.contrib.auth.forms import AuthenticationForm, SetPasswordForm
from .models import User
import re
class RegisterForm(forms.ModelForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'phone_number')  # password removed

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({
                'class': 'form-control',
                'placeholder': ' '
            })


class CustomSetPasswordForm(SetPasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add uniform styling and floating label placeholders
        for field_name, field in self.fields.items():
            field.widget.attrs.update({
                'class': 'form-control',
                'placeholder': ' '
            })

    def clean_new_password1(self):
        password = self.cleaned_data.get("new_password1")
        errors = []

        # Minimum length
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', password):
            errors.append("Password must include an uppercase letter.")
        if not re.search(r'[a-z]', password):
            errors.append("Password must include a lowercase letter.")
        if not re.search(r'[0-9]', password):
            errors.append("Password must include a number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must include a special character (!@#$%^&*).")

        if errors:
            raise forms.ValidationError(errors)
        return password

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("new_password1")
        password2 = cleaned_data.get("new_password2")

        if password1 and password2 and password1 != password2:
            self.add_error('new_password2', "The two password fields didn't match.")

        return cleaned_data

class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-input'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-input'}))


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["email", "phone_number"]  # Removed profile_image
        widgets = {
            "email": forms.EmailInput(attrs={"class": "form-control rounded-3"}),
            "phone_number": forms.TextInput(attrs={"class": "form-control rounded-3"}),
        }
