# Urban Company Clone — Deployment Guide

## Architecture Overview

```
Browser → Vercel (React/Vite frontend)
              ↓ API calls
        Render.com (Node.js/Express backend)
              ↓
        MongoDB Atlas (database)
              ↓
        Firebase Auth (authentication)
```

---

## Phase 1 — MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com → Create free M0 cluster
2. Database Access → Add DB user (username + strong password)
3. Network Access → Add IP `0.0.0.0/0` (allow from anywhere for Render)
4. Clusters → Connect → "Connect your application" → copy connection string
5. Replace `<password>` in the URI, add your DB name:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/urbanclone?retryWrites=true&w=majority
   ```

---

## Phase 2 — Firebase Auth

1. Go to https://console.firebase.google.com → Create project
2. Authentication → Get started → Enable Email/Password + Google
3. Project Settings → Service accounts → Generate new private key (JSON)
4. Extract from the JSON:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY (include `\n` as-is)
5. Project Settings → General → Your apps → Add Web app
   - Copy the firebaseConfig object values into frontend `.env`

---

## Phase 3 — Cloudinary (File Uploads)

1. Sign up at https://cloudinary.com (free tier: 25 GB storage)
2. Dashboard → copy Cloud name, API Key, API Secret
3. Add to backend `.env`

---

## Phase 4 — Razorpay (Payments — Test Mode)

1. Sign up at https://dashboard.razorpay.com
2. Settings → API Keys → Generate Test Keys
3. Copy Key ID and Key Secret → add to backend `.env`
4. No real money in test mode — use test card: `4111 1111 1111 1111`

---

## Phase 5 — Resend.com (Emails)

1. Sign up at https://resend.com (free: 3000 emails/month)
2. API Keys → Create API key
3. Domains → Add your domain (or use `onboarding@resend.dev` for testing)
4. Add to backend `.env`

---

## Deploy Backend to Render.com

```bash
# 1. Push backend to GitHub
cd urban-company-clone/backend
git init && git add . && git commit -m "Initial backend"
gh repo create urbanclone-backend --public --push

# 2. On Render dashboard:
#    New → Web Service → Connect GitHub repo
#    Build command:  npm install
#    Start command:  node server.js
#    Environment:    Node 18+

# 3. Add all environment variables from .env.example in Render dashboard
```

After deploy, Render gives you a URL like:
`https://urbanclone-api.onrender.com`

---

## Deploy Frontend to Vercel

```bash
# 1. Push frontend to GitHub
cd urban-company-clone
git init && git add . && git commit -m "Initial frontend"
gh repo create urbanclone-frontend --public --push

# 2. On vercel.com:
#    New Project → Import GitHub repo
#    Framework preset: Vite
#    Root directory: . (the urban-company-clone folder)

# 3. Add Environment Variables in Vercel dashboard:
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=https://urbanclone-api.onrender.com/api

# 4. Deploy → Vercel gives you:
#    https://urbanclone.vercel.app
```

---

## Environment Files Reference

### `src/.env` (frontend — never commit!)
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_URL=http://localhost:5000/api
```

### `backend/.env` (backend — never commit!)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/urbanclone
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123secret
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXX
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXX
RESEND_FROM=noreply@yourdomain.com
FRONTEND_URL=https://urbanclone.vercel.app
JWT_SECRET=super_secret_jwt_key_change_in_production
```

---

## Local Development Setup

```bash
# Clone / navigate to project
cd "urban-company-clone"

# Install frontend dependencies
npm install

# Start frontend
npm run dev   # → http://localhost:5173

# In a second terminal, start backend
cd backend
npm install
npm run dev   # → http://localhost:5000
```

---

## Post-Deploy Checklist

- [ ] MongoDB Atlas cluster is live, connection string working
- [ ] Firebase Auth enabled (Email + Google)
- [ ] Render backend health check: GET /api/health returns 200
- [ ] Vercel frontend loads, can navigate all pages
- [ ] Test user registration + login flow
- [ ] Test booking creation end-to-end
- [ ] Razorpay test payment (card: 4111 1111 1111 1111)
- [ ] Email confirmation arrives after booking
- [ ] Admin account: set `role: 'admin'` directly in MongoDB Atlas for your test user
- [ ] Pro account: register via /pro/register, approve in Admin panel

---

## Making a User an Admin (one-time)

In MongoDB Atlas → Browse Collections → `users` collection:
```js
// Find your user and update role
db.users.updateOne(
  { email: "youremail@gmail.com" },
  { $set: { role: "admin" } }
)
```

---

*Built with React 18 + Vite · Tailwind CSS v3 · Node.js/Express · MongoDB · Firebase Auth · Socket.io · Leaflet · Razorpay · Resend*
