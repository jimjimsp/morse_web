# morse_web/settings.py

from pathlib import Path

import os
import dj_database_url

# --------------------------
# Basic paths
# --------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --------------------------
# Security
# --------------------------
DEBUG = os.getenv("DEBUG", "False") == "True"
SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALLOWED_HOSTS = ["*"]  # Render will handle domain

# --------------------------
# Installed apps
# --------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'blinker',  # your Morse Blinker app
]

# --------------------------
# Middleware
# --------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',          # required
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',       # required
    'django.contrib.messages.middleware.MessageMiddleware',          # required
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
        "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware"
]

# --------------------------
# Root URL configuration
# --------------------------
ROOT_URLCONF = 'morse_web.urls'

# --------------------------
# Templates
# --------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # optional if you have global templates
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --------------------------
# WSGI
# --------------------------
WSGI_APPLICATION = 'morse_web.wsgi.application'

# --------------------------
# Database (default SQLite)
# --------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# --------------------------
# Password validation
# --------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# --------------------------
# Internationalization
# --------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --------------------------
# Static files
# --------------------------
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATICFILES_DIRS = [
    BASE_DIR / "blinker" / "static",
]  # global static folder, optional

# --------------------------
# Default primary key field type
# --------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# For production (collectstatic)
