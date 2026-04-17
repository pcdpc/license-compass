# License Compass

License Compass is a specialized multi-state license and readiness tracking platform for Nurse Practitioners. It helps manage state-specific licenses, CEUs, DEA status, and document compliance with a focus on ease of use and automated readiness tracking.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **Auth**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Environment Setup

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in your Firebase configuration values in `.env.local`.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application is configured for **Firebase App Hosting**. 

Deployment is handled automatically via GitHub integration based on the configuration in `apphosting.yaml`.

For manual firebase operations, ensure you have the [Firebase CLI](https://firebase.google.com/docs/cli) installed and are logged in:

```bash
firebase login
firebase use license-compass
```
