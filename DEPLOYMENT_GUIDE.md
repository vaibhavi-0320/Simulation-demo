# Fintrix Production Deployment Guide

## ✅ Deployment Configuration Complete

All production deployment files have been created and pushed to GitHub. Here's what was set up:

---

## 📋 What Was Configured

### 1. **Frontend Environment Variables**
- ✅ `frontend/.env.development` - Uses empty API_URL (proxy works locally)
- ✅ `frontend/.env.production` - Uses Railway backend URL (replace placeholder)

### 2. **Vercel Configuration**
- ✅ `vercel.json` - Frontend build and deployment config
  - Build command: `cd frontend && npm install && npm run build`
  - Output directory: `frontend/dist`
  - SPA rewrites configured
  - COOP/COEP headers set for Freighter compatibility

### 3. **Backend Configuration**
- ✅ `backend/Procfile` - Railway deployment entry point
- ✅ `backend/package.json` - Backend dependencies and scripts
- ✅ `backend/railway.json` - Railway deployment config
- ✅ `backend/security.ts` - Updated CORS for Vercel domains

### 4. **API Integration**
- ✅ `frontend/src/services/stellarService.ts` - Uses VITE_API_URL
- ✅ `frontend/src/services/invoiceApi.ts` - Uses VITE_API_URL
- ✅ `frontend/src/services/mainApi.ts` - Uses VITE_API_URL
- ✅ `frontend/src/components/DealDetailView.tsx` - Uses API_BASE

### 5. **Git & Security**
- ✅ `.gitignore` - Protects all .env files
- ✅ No secrets committed
- ✅ All files pushed to GitHub

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Select the root directory
5. Railway will auto-detect `backend/Procfile`
6. Set environment variables:
   ```
   NODE_ENV=production
   FORCE_HTTPS=true
   ```
7. Deploy
8. Copy the Railway URL (e.g., `https://your-app.railway.app`)

### Step 2: Update Frontend Environment

1. In your repository, update `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
2. Commit and push to GitHub

### Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect `vercel.json`
4. Set environment variables:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
5. Deploy
6. Your frontend will be live at `https://your-project.vercel.app`

### Step 4: Update CORS (if needed)

If you get CORS errors, the backend CORS is already configured to accept:
- `*.vercel.app` (all Vercel subdomains)
- `localhost:3000-3002` (local development)
- `127.0.0.1:3000-3002` (local development)

---

## 🔗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Vercel Frontend (your-project.vercel.app)           │   │
│  │  - React + Vite                                       │   │
│  │  - Freighter wallet integration                       │   │
│  │  - Stellar transaction signing                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          │ HTTPS                              │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Railway Backend (your-app.railway.app)              │   │
│  │  - Express.js API                                    │   │
│  │  - Invoice management                                │   │
│  │  - AI parsing                                        │   │
│  │  - Chat assistant                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                    │
│                          │ HTTPS                              │
│                          ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Stellar Testnet (horizon-testnet.stellar.org)       │   │
│  │  - Transaction building                              │   │
│  │  - Transaction submission                            │   │
│  │  - Account queries                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://your-app.railway.app
```

### Backend (Railway)
```
NODE_ENV=production
FORCE_HTTPS=true
SENTRY_DSN=<optional>
ANTHROPIC_API_KEY=<optional>
GOOGLE_GENAI_API_KEY=<optional>
```

---

## ✅ Health Checks

### Frontend Health
- Visit: `https://your-project.vercel.app`
- Should load the Fintrix landing page

### Backend Health
- Visit: `https://your-app.railway.app/api/main?action=health`
- Should return: `{ "success": true, "data": { "status": "ok", "service": "fintrix-api" } }`

### Stellar Health
- Visit: `https://your-app.railway.app/api/main?action=stellar-health`
- Should return escrow account balance

---

## 🧪 Testing Production

### Test Fund Invoice
1. Go to frontend: `https://your-project.vercel.app`
2. Connect Freighter wallet (testnet)
3. Go to Marketplace
4. Click a deal
5. Enter amount (e.g., 100)
6. Click "FUND THIS INVOICE"
7. Freighter popup should open
8. Approve transaction
9. Transaction hash should appear

### Test Simulation
1. Go to Simulation tab
2. Select a deal
3. Enter amount
4. Click "Simulate on Testnet ▷"
5. Freighter popup should open
6. Approve transaction
7. Simulation result should appear

---

## 🐛 Troubleshooting

### CORS Errors
- Check that `VITE_API_URL` is set correctly in Vercel
- Verify backend CORS allows `*.vercel.app`
- Check browser console for exact error

### Freighter Not Opening
- Make sure Freighter is set to TESTNET
- Make sure wallet has at least 2 XLM
- Check browser console for errors

### API Timeouts
- Check Railway backend is running
- Visit health endpoint to verify
- Check Railway logs for errors

### Build Failures
- Verify `frontend/package.json` has all dependencies
- Check `backend/package.json` has all dependencies
- Verify Node.js version is 20+

---

## 📊 Monitoring

### Vercel Dashboard
- Monitor frontend performance
- View deployment logs
- Check error tracking

### Railway Dashboard
- Monitor backend performance
- View application logs
- Check resource usage

### Sentry (Optional)
- Set `SENTRY_DSN` in Railway environment
- Monitor errors in production
- Get alerts for critical issues

---

## 🔄 Continuous Deployment

Both Vercel and Railway are configured for automatic deployment:

1. Push to `main` branch on GitHub
2. Vercel automatically rebuilds frontend
3. Railway automatically rebuilds backend
4. New version is live within 2-5 minutes

---

## 📝 Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Railway URL copied
- [ ] `frontend/.env.production` updated with Railway URL
- [ ] Frontend deployed to Vercel
- [ ] Frontend loads without errors
- [ ] Backend health check passes
- [ ] Stellar health check passes
- [ ] Fund invoice flow works
- [ ] Simulation flow works
- [ ] Freighter opens within 2-3 seconds
- [ ] Transaction hash appears after approval
- [ ] Explorer links work

---

## 🎯 Next Steps

1. **Deploy Backend First**
   - Go to Railway
   - Connect GitHub repo
   - Deploy
   - Copy URL

2. **Update Frontend Config**
   - Update `frontend/.env.production`
   - Commit and push

3. **Deploy Frontend**
   - Go to Vercel
   - Import GitHub repo
   - Deploy

4. **Test Everything**
   - Visit frontend URL
   - Test fund flow
   - Test simulation flow

5. **Monitor**
   - Check Vercel dashboard
   - Check Railway dashboard
   - Monitor error logs

---

## 📞 Support

If you encounter issues:

1. Check the health endpoints
2. Review deployment logs (Vercel/Railway)
3. Check browser console for errors
4. Verify environment variables are set
5. Ensure Freighter is on TESTNET
6. Verify wallet has sufficient XLM

---

## 🎉 You're Ready!

Your Fintrix application is now configured for production deployment. Follow the steps above to deploy to Vercel and Railway.

Good luck! 🚀
