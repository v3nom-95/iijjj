# VITS Logo Deployment Troubleshooting Guide

## Issue: VITS logo not visible after pushing changes

## Step-by-Step Solution:

### 1. Force New Build Deployment
```bash
# Option A: Force redeploy from Vercel CLI
vercel --prod --force

# Option B: Redeploy from Vercel dashboard
# - Go to Vercel dashboard
# - Find your project
# - Click "Deployments" tab
# - Click "..." on latest deployment
# - Select "Redeploy"
```

### 2. Clear Vercel Build Cache
```bash
# Clear Vercel build cache
vercel rm
# Then redeploy
vercel --prod
```

### 3. Verify Static Assets in Build
Check if vits.png is included in the build:
```bash
# Build locally first
npm run build

# Check if vits.png is in dist folder
ls -la dist/

# If missing, ensure it's in public/ folder
ls -la public/
```

### 4. Test Image Accessibility
Directly test if the image loads:
```bash
# Test locally
curl -I http://localhost:4173/vits.png

# Test on production (replace with your domain)
curl -I https://your-domain.vercel.app/vits.png
```

### 5. Browser DevTools Check
1. Open your deployed site
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Look for vits.png in the network requests
6. Check if it returns 404 or 200

### 6. Alternative: Temporarily Use Different Image
If issue persists, temporarily rename the image:
```bash
# In public/ folder
mv vits.png vite-logo.png

# Update Logo.tsx to use the new filename
# src="/vite-logo.png"
```

### 7. Check File Permissions
Ensure the image file has correct permissions:
```bash
# Set correct permissions
chmod 644 public/vits.png
```

### 8. Verify Build Logs
Check Vercel build logs for any warnings about missing assets or build failures.

## Emergency Quick Fix:
If you need immediate deployment, try this temporary solution:

1. Copy vait-logo.png as vits.png:
```bash
cp public/vait-logo.png public/vits.png
```

2. Deploy immediately

## Diagnostic Commands:
```bash
# Check file sizes and permissions
ls -la public/*.png

# Verify file is not corrupted
file public/vits.png

# Check build output
npm run build && ls -la dist/
```

## If Still Not Working:
The issue might be with:
1. File naming case sensitivity (vits.png vs VITS.png)
2. File corruption during upload
3. Vercel CDN cache issues
4. Build process not including new static files

Try using a different filename temporarily to rule out these issues.
