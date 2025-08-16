# Render Deployment Environment Variables

## Build Environment Variables (add these in Render dashboard):
```
PIP_NO_BINARY=bcrypt,cryptography
SETUPTOOLS_USE_DISTUTILS=stdlib
```

## Runtime Environment Variables:
```
SECRET_KEY=<your-secure-secret-key>
DATABASE_URL=<your-postgresql-url>
CORS_ORIGINS=["https://your-frontend.vercel.app","http://localhost:5173"]
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
MINIMUM_SUPPORT_AMOUNT=150
CREATE_DB_TABLES=true
```

## Alternative Build Commands if still failing:

### Option 1: Force pure Python packages
```
pip install --upgrade pip && pip install --prefer-binary -r requirements.txt
```

### Option 2: Skip problematic packages
```
pip install --upgrade pip && cat requirements.txt | grep -v bcrypt | xargs pip install && pip install passlib
```
