# eLearning LMS

A Django-based eLearning platform with role-based access (Superuser, Admin, User), course management, assessments, and a modern Bootstrap UI.

## Features

- Role-based authentication:
  - Superuser: Full access
  - Admin: Manage courses & dashboard
  - User: Dashboard & enroll courses
- Course creation and enrollment
- User registration with email verification
- Modern responsive UI using **Bootstrap**
- SQLite database for development

## Tech Stack

- Backend: Django 5.2
- Frontend: Bootstrap 5
- Database: SQLite (default)
- Email: Configurable via `.env` file

## Project Structure
elearning/
├── elearning/ # Project folder
│ ├── templates/
│ │ └── base.html
│ ├── settings.py
│ ├── urls.py
│ └── wsgi.py
├── accounts/ # Users app
│ ├── models.py
│ ├── views.py
│ ├── forms.py
│ └── templates/accounts/
├── courses/ # Courses app
│ ├── models.py
│ ├── views.py
│ └── templates/courses/
├── static/ # Static files (CSS, JS, images)
├── manage.py
├── db.sqlite3
└── .env # Environment variables


## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/elearning.git
cd elearning
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt

.env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=yourpassword


python manage.py makemigrations
python manage.py migrate


python manage.py createsuperuser


python manage.py runserver
