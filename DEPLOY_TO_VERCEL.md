# Deploying NFC BizSuite Dubai to Vercel

This application is fully configured for **1-click zero-config deployment on Vercel**.

## Architecture on Vercel
- **Frontend**: Vite + React 19 SPA served via Vercel's global Edge CDN (`dist/`).
- **Backend**: Express API running serverless via `/api/index.ts` with automatic rewrites configured in `vercel.json`.
- **Zero Port Collisions**: Dedicated serverless execution avoids port binding issues.

---

## Method 1: Deploy via GitHub (Recommended)

1. In **Google AI Studio**, open the top-right menu and click **Export to GitHub** (or **Download ZIP** and push to your GitHub repo).
2. Go to **[vercel.com/new](https://vercel.com/new)**.
3. Select your imported repository and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist`
5. *(Optional)* Add Environment Variables in Vercel settings:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API key for live AI discovery)*.
   *Note: Even without an API key, the app includes the full verified Dubai business directory.*
6. Click **Deploy**. Your site will be live on `https://your-project.vercel.app`!

---

## Method 2: Deploy via Vercel CLI

If you have downloaded or cloned the project to your local machine:

1. Open your terminal in the project root folder.
2. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```
3. Login and deploy:
   ```bash
   vercel
   ```
4. For production deployment:
   ```bash
   vercel --prod
   ```
