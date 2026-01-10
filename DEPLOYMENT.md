# Deployment Guide 🚀

This document explains the production hosting and deployment workflow for the **Aspirant Arena Frontend**.

## 🏗 Infrastructure Overview

- **Hosting Platform**: [Vercel](https://vercel.com/)
- **Domain**: [aspirantarena.in](https://aspirantarena.in)
- **Primary Branch**: `main`
- **Analytics**: Vercel Speed Insights & Web Vitals

## 🛠 Manual Deployment

### 1. Development
```bash
npm run dev
```

### 2. Local Build Verification
```bash
npm run build
npm run preview
```

### 3. Vercel Deployment
Pushing to the `main` branch automatically triggers a production build on Vercel.

## 🌐 Domain Configuration
The domain **aspirantarena.in** is purchased from GoDaddy and its DNS is managed by Vercel for optimized edge delivery and automatic SSL (HTTPS).

## 🗝 Environment Variables
Managed via Vercel Dashboard for Production:
- `VITE_BACKEND_URL`: URL of the AWS EC2 Backend.
- `VITE_FIREBASE_API_KEY`: API key for Google OAuth.
- `VITE_FIREBASE_AUTH_DOMAIN`: Auth domain.
- `VITE_STRIPE_KEY`: (Future use).

## 📊 Performance Monitoring
We use built-in Vercel Analytics to monitor:
- **LCP** (Largest Contentful Paint)
- **CLS** (Cumulative Layout Shift)
- **FID** (First Input Delay)
