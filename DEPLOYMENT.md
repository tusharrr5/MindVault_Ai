# MindVault AI - Production Deployment Guide

## 1. Environment Variables

### Frontend (`frontend/.env.production`)
The frontend strictly requires public Firebase identifiers to initialize the SDK. **No administrative secrets or API keys should ever be placed here.**

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_public_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend (`backend/.env`)
The backend securely holds all private credentials. **Ensure this file is heavily restricted and NEVER committed to version control.**

```env
PORT=8080
CORS_ORIGIN=https://app.yourdomain.com
GEMINI_API_KEY=your_secret_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account-key.json
```

---

## 2. Firebase Configuration
- **Authentication**: Ensure that your production domain (e.g., `app.yourdomain.com`) is added to the **Authorized Domains** list in the Firebase Console (Authentication > Settings > Authorized domains).
- **Firestore Security Rules**: The `firestore.rules` file in the root directory must be deployed to your Firebase project. It securely isolates user data (`journals` and `goals`) using `request.auth.uid`.
  - Deployment Command: `firebase deploy --only firestore:rules`
- **Admin SDK**: The backend uses the Firebase Admin SDK via `service-account-key.json`. This JSON file must be securely transferred to the production server.

---

## 3. Gemini AI Configuration
- Obtain your Gemini API Key from Google AI Studio.
- The `GEMINI_API_KEY` must be set in the Node.js production environment variables for the backend.
- **Data Flow Security**: The frontend never communicates directly with Gemini. All analysis requests flow through the backend's authenticated routes.

---

## 4. Frontend Deployment
MindVault AI is built with Next.js. It can be deployed effortlessly to Vercel or hosted on a custom Node.js server.

### Recommended Platform: Vercel
1. Connect your repository to Vercel.
2. Set the `NEXT_PUBLIC_*` environment variables in the Vercel project settings.
3. Build Command: `npm run build`
4. Install Command: `npm install`

### Custom Node.js Server
```bash
cd frontend
npm install
npm run build
npm run start
```

---

## 5. Backend Deployment
The backend is an Express/TypeScript application.

### Recommended Platform: Render, Heroku, or DigitalOcean App Platform

### Build & Start
```bash
cd backend
npm install
npm run build
npm start
```
- The build command utilizes `tsup` to seamlessly bundle the TypeScript application for production.
- Ensure `helmet` and `cors` are correctly utilizing `CORS_ORIGIN` in production to prevent unauthorized domains from hitting your API.
- If not using a managed PaaS, use a process manager like **PM2** to keep the server alive:
  `pm2 start dist/index.js --name "mindvault-backend"`

---

## 6. Post-Deployment Verification Checklist
After deploying both the frontend and backend, run through this final checklist to guarantee functionality and security:

1. [ ] **Verify Authentication**: Log in on the production domain. Verify cookies/tokens are correctly set.
2. [ ] **Verify CORS**: Open browser dev tools and confirm no CORS errors appear when fetching `/journals`.
3. [ ] **Verify Database Restrictions**: Create a journal. Then confirm you can only see it on your account.
4. [ ] **Verify AI Integration**: Generate an AI Insight or analyze an entry. Ensure the backend doesn't crash and returns the JSON payload successfully.
5. [ ] **Verify Exports**: Go to Privacy Center and export JSON/CSV data. Ensure the download prompts successfully.
6. [ ] **Verify Danger Zone**: Type `DELETE` in the Privacy Center and verify the backend properly processes the bulk deletion via batch chunking.
