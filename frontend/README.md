# Artison Frontend

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your local API URL

# Run development server
npm run dev
```

## Deployment on Vercel

This frontend is configured for deployment on Vercel.

### Environment Variables:

- `VITE_API_URL`: Backend API URL (e.g., https://artison-api.onrender.com)

### Deploy Steps:

1. Push to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

## Build

```bash
npm run build
```

## Features

- User authentication
- Creator profiles
- Platform links management
- Payment support via Stripe
- Responsive design
