from django import forms
from .models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'phone_number', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        for field_name, field in self.fields.items():
            field.widget.attrs.update({
                'class': 'form-control',
                'placeholder': ' '
            })
class LoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class':'form-input'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class':'form-input'}))


class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["email", "phone_number"]  # Removed profile_image
        widgets = {
            "email": forms.EmailInput(attrs={"class": "form-control rounded-3"}),
            "phone_number": forms.TextInput(attrs={"class": "form-control rounded-3"}),
        }
