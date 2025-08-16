# render.com deployment configuration

## Environment Variables to set in Render Dashboard:

### Build Environment Variables (optional but recommended):
```
CRYPTOGRAPHY_DONT_BUILD_RUST=1
```

### Runtime Environment Variables (required):
```
SECRET_KEY=<your-secret-key>
DATABASE_URL=<your-postgresql-url>
CORS_ORIGINS=["https://your-frontend.vercel.app","http://localhost:5173"]
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MINIMUM_SUPPORT_AMOUNT=150
CREATE_DB_TABLES=true  # Only for first deployment
```

## Alternative solutions if build continues to fail:

### Option 1: Use precompiled wheels
Add to build command:
```
pip install --only-binary :all: cryptography
```

### Option 2: Use different Python version
Change PYTHON_VERSION to:
```
3.10.13
```

### Option 3: Use Docker deployment instead
Create a Dockerfile for more control over the build environment.
