# How to Get Your Railway URL

## Step 1: Create a Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **Sign Up**
3. Choose **GitHub** to sign up with your GitHub account
4. Authorize Railway to access your GitHub repositories

## Step 2: Create a New Project

1. After signing in, click **New Project**
2. Select **Deploy from GitHub repo**
3. Search for your repository: `Simulation-demo`
4. Click to select it
5. Railway will auto-detect the `backend/Procfile`

## Step 3: Configure the Deployment

1. Railway will show you the deployment configuration
2. It should detect:
   - **Root Directory**: (leave empty or `/`)
   - **Start Command**: `npx tsx service.ts` (from Procfile)
3. Click **Deploy**

## Step 4: Wait for Deployment

1. Railway will start building your backend
2. You'll see logs showing the build progress
3. Wait for it to say **"Deployment successful"**
4. This takes 2-5 minutes

## Step 5: Get Your Railway URL

Once deployed, your URL will be visible in one of these places:

### **Option A: From the Railway Dashboard**
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click on your project
3. Click on the **Backend** service
4. Look for **Domains** section
5. You'll see a URL like: `https://fintrix-backend-production-xxxx.railway.app`
6. Copy this URL

### **Option B: From the Deployment Page**
1. In your project, click **Deployments**
2. Click the latest (green checkmark) deployment
3. Look for **Domains** or **URL** section
4. Copy the URL

### **Option C: From Environment**
1. Click on your service
2. Click **Settings**
3. Look for **Domain** or **Public URL**
4. Copy it

## Step 6: Test Your Railway Backend

Once you have the URL, test it:

```
https://your-railway-url/api/main?action=health
```

You should see:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "fintrix-api"
  }
}
```

If you see this, your backend is working! ✅

## Step 7: Update Frontend Configuration

Once you have your Railway URL:

1. **Update `frontend/.env.production`:**
   ```
   VITE_API_URL=https://your-railway-url
   ```

2. **Commit and push:**
   ```bash
   git add frontend/.env.production
   git commit -m "chore: add Railway URL to production env"
   git push origin main
   ```

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add: `VITE_API_URL=https://your-railway-url`
   - Redeploy

## Example Railway URL

Your URL will look like one of these:
- `https://fintrix-backend-production-xxxx.railway.app`
- `https://simulation-demo-backend-xxxx.railway.app`
- `https://your-project-name-xxxx.railway.app`

## Troubleshooting

### Can't find the URL?
1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click your project name
3. Click the service (should say "Backend" or your service name)
4. Scroll down to **Domains** section
5. The URL is there

### Deployment failed?
1. Check the logs (click **Logs** tab)
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Node.js version mismatch
   - Missing dependencies in `backend/package.json`

### URL not working?
1. Test the health endpoint: `https://your-url/api/main?action=health`
2. If it returns JSON, it's working
3. If it returns HTML error, check Railway logs

## Next Steps

Once you have your Railway URL:

1. ✅ Update `frontend/.env.production`
2. ✅ Commit and push to GitHub
3. ✅ Deploy frontend to Vercel
4. ✅ Set `VITE_API_URL` in Vercel environment variables
5. ✅ Test the full flow

---

**Need help?** Reply with your Railway URL once you have it, and I'll update the configuration for you!
