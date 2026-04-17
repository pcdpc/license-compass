# Firebase Setup and Deployment Guide

This guide provides step-by-step instructions to set up the **License Compass** project in Firebase and deploy it using **Firebase App Hosting**.

---

## Phase 1: Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `license-compass`.
3. Follow the prompts (Google Analytics is optional).
4. Once created, click the **Web icon (</>)** on the Project Overview page to register a new web app.
   - Name it `License Compass Web`.
   - Copy the `firebaseConfig` object; you will need this for your `.env.local`.

---

## Phase 2: Enable Firebase Services

### 1. Authentication
1. In the Firebase Sidebar, go to **Build > Authentication**.
2. Click **Get Started**.
3. Enable **Email/Password** provider.

### 2. Cloud Firestore
1. Go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location and start in **Production Mode**.
4. **Security Rules**: Deploy the following rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         match /licenses/{licenseId} { allow read, write: if request.auth != null && request.auth.uid == userId; }
         match /ceus/{ceuId} { allow read, write: if request.auth != null && request.auth.uid == userId; }
         match /documents/{docId} { allow read, write: if request.auth != null && request.auth.uid == userId; }
         match /notifications/{notifId} { allow read, write: if request.auth != null && request.auth.uid == userId; }
       }
     }
   }
   ```

### 3. Cloud Storage
1. Go to **Build > Storage**.
2. Click **Get Started** and choose **Production Mode**.
3. **Security Rules**:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /users/{userId}/{allPaths=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

---

## Phase 3: Local Environment Setup
1. Create a `.env.local` file in your project root.
2. Fill in the values from your `firebaseConfig`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="..."
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
   NEXT_PUBLIC_FIREBASE_APP_ID="..."
   ```

---

## Phase 4: Deploy to Firebase App Hosting (Recommended)

1. **Push code to GitHub**.
2. **Setup App Hosting**:
   - In Firebase Console, go to **Build > App Hosting**.
   - Connect your GitHub repo and branch.
3. **Configuration**:
   - Firebase will detect Next.js.
   - It will use `apphosting.yaml` for build settings.
4. **Environment Variables**:
   - Add the variables from `.env.local` to the App Hosting dashboard settings.
5. **Deploy**: Click **Finish and Deploy**.

---

## Phase 5: Alternative Manual Deployment

If using standard Hosting:
1. `npm install -g firebase-tools`
2. `firebase login`
3. `firebase deploy --only hosting`

> [!TIP]
> **Firebase App Hosting** is preferred for Next.js as it handles SSR automatically.

## Verification Checklist
- [x] Create Setup and Deployment Guide
- [x] Verify Local Environment Configuration (`.env.local`)
- [x] Verify `.firebaserc` project ID
- [ ] Run Production Build (`npm run build`)
- [ ] Push to GitHub
- [ ] Connect Firebase App Hosting
