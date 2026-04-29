# Vercel Deployment Guide

## What Was Fixed

Your project has been restructured to work with Vercel's serverless architecture:

1. **Created `/api` directory** with serverless functions for all backend routes
2. **Converted Express routes** to Vercel serverless functions (functions in `/api/*.ts`)
3. **Updated `vercel.json`** with proper build and rewrite configuration
4. **Fixed build scripts** in `package.json` for Vercel environment
5. **Added `@vercel/node`** dependency for TypeScript support

## Project Structure

```
project-root/
├── api/                    # Vercel serverless functions
│   ├── auth/
│   │   ├── challenge.ts
│   │   └── verify.ts
│   ├── stellar/
│   │   ├── health.ts
│   │   ├── build.ts
│   │   ├── submit.ts
│   │   └── build-simulation.ts
│   ├── invoice/
│   │   ├── index.ts
│   │   ├── all.ts
│   │   ├── upload.ts
│   │   └── list.ts
│   ├── _lib/
│   │   ├── handlers.ts
│   │   └── auth-middleware.ts
│   ├── health.ts
│   ├── transactions.ts
│   ├── visitors.ts
│   ├── ai-parse.ts
│   ├── chat.ts
│   ├── track-visitor.ts
│   └── invoice-action.ts
├── frontend/               # React app
│   └── dist/              # Built frontend (deployed as static)
├── backend/               # Shared backend logic (imported by API functions)
├── vercel.json            # Vercel deployment configuration
└── package.json           # Root package.json
```

## Deployment Steps

### 1. Install Dependencies

```bash
npm install
npm --prefix frontend install
```

### 2. Build Locally (Test)

```bash
npm run build
```

### 3. Set Up Environment Variables on Vercel

Go to your Vercel project settings → Environment Variables and add:

**Required for all deployments:**
- `CLERK_SECRET_KEY` - Your Clerk authentication secret
- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk public key

**For Stellar blockchain features:**
- `ESCROW_DESTINATION` - Your Stellar testnet escrow account public key
- `SOROBAN_CONTRACT_ADDRESS` - Your deployed contract address (if applicable)

**For AI parsing:**
- `GOOGLE_GENAI_API_KEY` - Google GenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key (optional)

**For data persistence (if applicable):**
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**For rate limiting:**
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

**For monitoring:**
- `SENTRY_DSN` - Sentry error tracking DSN (optional)

### 4. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel --prod
```

#### Option B: Connect GitHub Repository

1. Push your changes to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Vercel will auto-detect the configuration
6. Add environment variables in project settings
7. Click "Deploy"

### 5. Verify Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Stellar health (no auth required)
curl https://your-domain.vercel.app/api/stellar/health

# Auth challenge (test wallet auth)
curl -X POST https://your-domain.vercel.app/api/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"address":"G..."}'
```

## Common Issues & Fixes

### Issue: "Cannot find module" errors

**Solution:** Ensure all backend modules are properly imported:
```bash
npm install
npm --prefix frontend install
```

### Issue: Environment variables not loading

**Solution:** 
1. Check Vercel project settings → Environment Variables
2. Make sure variables match the names in your code
3. Redeploy after adding new variables: `vercel --prod`

### Issue: API routes returning 404

**Solution:**
1. Check that `/api` functions are properly named
2. Verify routes match the file structure
3. Check `vercel.json` rewrite rules

### Issue: Build fails on Vercel

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure `NODE_ENV` is set to `production`
3. Run `npm run build` locally to test
4. Check TypeScript errors: `npm run lint`

## Environment Variables Reference

See `.env.example` for all available configuration options.

## Troubleshooting

### Enable Debug Logging

Set `LOG_LEVEL=debug` in environment variables to get more detailed logs in Vercel dashboard.

### Check Vercel Logs

```bash
vercel logs https://your-domain.vercel.app
```

### Test Build Locally

```bash
# Install Vercel CLI
npm install -g vercel

# Run local build
vercel build

# Run local function
vercel dev
```

## Next Steps

1. ✅ Commit and push changes to GitHub
2. ✅ Add environment variables to Vercel project
3. ✅ Deploy: `vercel --prod`
4. ✅ Test API endpoints
5. ✅ Monitor via Vercel dashboard

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- Check your Vercel project logs for errors
