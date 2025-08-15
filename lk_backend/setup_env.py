#!/usr/bin/env python3
"""
Environment Setup Script for Local Konnect Backend
This script helps configure the environment variables for the project.
"""

import os
import shutil
from pathlib import Path

def setup_environment():
    """Setup environment configuration for Local Konnect backend"""
    
    print("🚀 Local Konnect Backend Environment Setup")
    print("=" * 50)
    
    backend_dir = Path(__file__).parent
    env_file = backend_dir / '.env'
    env_example_file = backend_dir / '.env.example'
    
    # Check if .env already exists
    if env_file.exists():
        print(f"⚠️  .env file already exists at {env_file}")
        overwrite = input("Do you want to overwrite it? (y/N): ").lower().strip()
        if overwrite != 'y':
            print("Environment setup cancelled.")
            return
    
    # Copy .env.example to .env if it doesn't exist
    if not env_file.exists() and env_example_file.exists():
        shutil.copy2(env_example_file, env_file)
        print(f"✅ Created .env file from template")
    
    # Interactive configuration
    print("\n📝 Let's configure your environment variables:")
    print("(Press Enter to keep default values)\n")
    
    # Read current .env content
    env_content = {}
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_content[key] = value
    
    # Configure each setting
    settings = [
        {
            'key': 'DEBUG',
            'description': 'Debug mode (True/False)',
            'default': 'True'
        },
        {
            'key': 'SECRET_KEY',
            'description': 'Django secret key (generate a new one for production)',
            'default': 'django-insecure-2b-e1+7(q@9ts0c6bnr@mn^o%9#6d$1h@tvc5dg$3=rg8hr#^h%m'
        },
        {
            'key': 'DB_NAME',
            'description': 'Database name',
            'default': 'lk_db'
        },
        {
            'key': 'DB_USER',
            'description': 'Database username',
            'default': 'postgres'
        },
        {
            'key': 'DB_PASSWORD',
            'description': 'Database password',
            'default': 'bunny',
            'sensitive': True
        },
        {
            'key': 'DB_HOST',
            'description': 'Database host',
            'default': 'localhost'
        },
        {
            'key': 'DB_PORT',
            'description': 'Database port',
            'default': '5432'
        },
        {
            'key': 'GEMINI_API_KEY',
            'description': 'Gemini AI API key (get from https://makersuite.google.com/app/apikey)',
            'default': 'your-actual-gemini-api-key-here',
            'sensitive': True,
            'required': True
        }
    ]
    
    for setting in settings:
        key = setting['key']
        current_value = env_content.get(key, setting['default'])
        
        if setting.get('sensitive'):
            display_value = '***hidden***' if current_value != setting['default'] else current_value
        else:
            display_value = current_value
            
        prompt = f"{setting['description']} [{display_value}]: "
        
        if setting.get('required') and current_value == setting['default']:
            prompt = f"🔑 {setting['description']} (REQUIRED): "
        
        new_value = input(prompt).strip()
        
        if new_value:
            env_content[key] = new_value
        elif key not in env_content:
            env_content[key] = setting['default']
    
    # Write updated .env file
    env_lines = []
    env_lines.append("# Django Environment Configuration")
    env_lines.append("# IMPORTANT: This file contains sensitive information. Do not commit to version control!")
    env_lines.append("")
    
    # Group settings
    groups = [
        ("# Django Settings", ['DEBUG', 'SECRET_KEY']),
        ("# Database Configuration", ['DB_ENGINE', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT']),
        ("# Gemini AI Configuration", ['GEMINI_API_KEY']),
        ("# Other Settings", ['CORS_ORIGIN_ALLOW_ALL', 'JWT_ACCESS_TOKEN_LIFETIME_MINUTES', 'JWT_REFRESH_TOKEN_LIFETIME_DAYS', 'MEDIA_URL', 'STATIC_URL', 'ALLOWED_HOSTS', 'TRUST_NETWORK_RATE_LIMIT_PER_HOUR', 'VOICE_QUERY_RATE_LIMIT_PER_HOUR'])
    ]
    
    # Add default values for missing keys
    defaults = {
        'DB_ENGINE': 'django.db.backends.postgresql',
        'CORS_ORIGIN_ALLOW_ALL': 'True',
        'JWT_ACCESS_TOKEN_LIFETIME_MINUTES': '60',
        'JWT_REFRESH_TOKEN_LIFETIME_DAYS': '1',
        'MEDIA_URL': '/media/',
        'STATIC_URL': '/static/',
        'ALLOWED_HOSTS': 'localhost,127.0.0.1',
        'TRUST_NETWORK_RATE_LIMIT_PER_HOUR': '100',
        'VOICE_QUERY_RATE_LIMIT_PER_HOUR': '50'
    }
    
    for key, value in defaults.items():
        if key not in env_content:
            env_content[key] = value
    
    for group_name, keys in groups:
        env_lines.append(group_name)
        for key in keys:
            if key in env_content:
                value = env_content[key]
                if key == 'GEMINI_API_KEY' and value == 'your-actual-gemini-api-key-here':
                    env_lines.append(f"# Get your API key from: https://makersuite.google.com/app/apikey")
                env_lines.append(f"{key}={value}")
        env_lines.append("")
    
    # Write the file
    with open(env_file, 'w') as f:
        f.write('\n'.join(env_lines))
    
    print(f"\n✅ Environment configuration saved to {env_file}")
    
    # Validation and next steps
    print("\n📋 Configuration Summary:")
    print("-" * 30)
    
    gemini_key = env_content.get('GEMINI_API_KEY', '')
    if gemini_key == 'your-actual-gemini-api-key-here':
        print("⚠️  Gemini API Key: NOT CONFIGURED")
        print("   🔗 Get your key from: https://makersuite.google.com/app/apikey")
        print("   📝 Then update the GEMINI_API_KEY in .env file")
    else:
        print("✅ Gemini API Key: Configured")
    
    print(f"✅ Database: {env_content.get('DB_NAME', 'lk_db')} @ {env_content.get('DB_HOST', 'localhost')}")
    print(f"✅ Debug Mode: {env_content.get('DEBUG', 'True')}")
    
    print("\n🚀 Next Steps:")
    print("1. If you haven't set up Gemini API key, get one from Google AI Studio")
    print("2. Make sure PostgreSQL is running and database exists")
    print("3. Run: python manage.py migrate")
    print("4. Run: python manage.py runserver")
    print("5. Test the voice query feature!")
    
    print("\n🔒 Security Note:")
    print("The .env file contains sensitive information and is excluded from git.")
    print("Never commit API keys or passwords to version control!")

if __name__ == "__main__":
    setup_environment()
