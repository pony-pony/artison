# Artison Backend

## Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
python run.py
```

## Deployment on Render

This backend is configured for deployment on Render with PostgreSQL.

### Environment Variables Required:

- `SECRET_KEY`: Secret key for JWT tokens
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGINS`: Frontend URL(s) as JSON array
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `CREATE_DB_TABLES`: Set to "true" on first deployment

### Deploy Steps:

1. Push to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy

## API Documentation

Once running, visit:
- API docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
