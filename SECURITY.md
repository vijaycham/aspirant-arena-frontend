# Security Policy & Implementation 🛡️

Aspirant Arena Frontend implements specialized layers to ensure user data remains private and sessions remain secure.

## 🗝 Client-Side Authentication

### 1. Persistence & Session Security
We use **Redux Persist** to maintain user sessions. However, the sensitive session token (JWT) is **not** stored in LocalStorage. It is managed via `HttpOnly` cookies set by the backend, protecting users from XSS (Cross-Site Scripting) attacks.

### 2. Protected Routing
The app uses a `PrivateRoute` wrapper that:
- Inspects the Redux `currentUser` state.
- Redirects unauthenticated users to `/signin`.
- Prevents authorized content from being indexed or viewed without a valid session.

## 🛡️ Surface Protections

### 1. Trust-Based Verification (Locked Content)
For users in their 24-hour grace period, features are accessible but clearly marked with headers. Once the period expires:
- **LockedOverlay**: A glassmorphic blur is applied to key dashboard features.
- **Guard Hooks**: Custom hooks like `useTasks` and `useTestTracker` stop API execution for expired users.

### 2. Firebase Restrictions
Google OAuth is used via Firebase. We have implemented:
- **Domain Whitelisting**: Google Auth only works for `aspirantarena.in` and `localhost`.
- **API Key Restrictions**: Keys are restricted to specifically allow only Auth and Storage services.
- **Server-Side Verification**: We send the ID Token to the backend, where it is rigorously verified against Google's public keys via `firebase-admin` before any session is created.

### 3. Browser Hardening
- **COOP Headers**: `Cross-Origin-Opener-Policy: same-origin-allow-popups` enforced to secure OAuth popups.
- **DOM Security**: Inputs enforce `autocomplete` attributes to prevent browser heuristics from filling sensitive fields incorrectly.

### 4. Firebase Storage Rules
Bucket rules ensure that only authenticated users can upload and read their own profile photos:
```firebase
match /users/{userId}/{allPaths=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## 📦 Secrets Handling
All API keys and URLs are managed via `.env` files and are **git-ignored**. Production keys are injected during the Vercel build process.
