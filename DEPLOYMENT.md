# Deployment Guide

This guide provides step-by-step instructions to deploy CampusResolve to production using **Render/Railway** (Backend), **Vercel** (Frontend), and **Neon** (PostgreSQL).

---

## 1. Database Deployment (Neon PostgreSQL)
1. Go to [Neon.tech](https://neon.tech/) and create a new project.
2. Under your project dashboard, grab the **PostgreSQL Connection String**.
3. It will look something like this:
   `postgresql://username:password@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. Keep this string safe; you will need it for the Backend deployment.

---

## 2. Backend Deployment (Render / Railway)

We recommend [Render](https://render.com/) for deploying the Node.js backend.

1. Push your `CampusResolve` codebase to GitHub.
2. Create a new **Web Service** on Render.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start` (Ensure your package.json has `"start": "node server.js"`)
5. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your Neon Connection String)*
   - `PORT`: `5000`
   - `CLIENT_URL`: *(We will update this after frontend deployment, e.g., `https://campusresolve.vercel.app`)*
   - `JWT_SECRET`: *(A random 64-char secure string)*
   - `JWT_REFRESH_SECRET`: *(A different random secure string)*
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `EMAIL_USER`, `EMAIL_PASS`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL`: `https://your-backend.onrender.com/api/auth/google/callback`

6. Click **Deploy**. Render will install dependencies, run Prisma migrations, and start the API.

---

## 3. Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Import your `CampusResolve` GitHub repository.
3. Vercel will automatically detect **Vite**.
4. Set the **Root Directory** to `frontend`.
5. Under Environment Variables, add:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
6. Click **Deploy**.

---

## 4. Final Steps
1. Once Vercel provides your frontend URL (e.g., `https://campusresolve.vercel.app`), go back to your Backend on Render.
2. Update the `CLIENT_URL` environment variable to match your exact Vercel URL.
3. Update your Google Cloud Console OAuth Settings:
   - Add your Vercel URL to **Authorized JavaScript Origins**.
   - Add your Render callback URL to **Authorized Redirect URIs**.
4. Restart your Backend web service.

✅ **CampusResolve is now live and fully operational in production!**
