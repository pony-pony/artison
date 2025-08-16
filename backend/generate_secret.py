import secrets

# Generate a secure secret key
secret_key = secrets.token_urlsafe(32)
print(f"Generated SECRET_KEY: {secret_key}")
print("\nAdd this to your .env file:")
print(f"SECRET_KEY={secret_key}")
