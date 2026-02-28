# EdgeBet AI v5.1 - OAuth Setup Guide

## 🆕 What's New in v5.1

### Social Login
- **Google OAuth** - One-click sign in with Google
- **Facebook OAuth** - One-click sign in with Facebook
- Seamless account linking (same email = same account)

---

## 🔧 Environment Variables

Add these to your **Render Dashboard**:

```bash
# Existing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_SHARP=price_...

# NEW - OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FRONTEND_URL=https://grandrichlife727-design.github.io/edgebet-ai
```

---

## 📱 Google OAuth Setup

### 1. Google Cloud Console
- Go to https://console.cloud.google.com
- Create new project (or use existing)
- Enable "Google+ API" (or "Google Identity Toolkit")

### 2. Configure OAuth Consent Screen
- APIs & Services → OAuth consent screen
- Choose "External" (for production)
- Fill in:
  - App name: EdgeBet AI
  - User support email: your@email.com
  - Developer contact: your@email.com
- Add scopes: `openid`, `email`, `profile`
- Add test users (your email)

### 3. Create Credentials
- APIs & Services → Credentials
- Create Credentials → OAuth client ID
- Application type: Web application
- Name: EdgeBet Web
- Authorized redirect URIs:
  ```
  https://edgebet-backend-1.onrender.com/auth/google/callback
  ```
- Click Create
- Copy **Client ID** and **Client Secret**

### 4. Add to Render
```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## 📘 Facebook OAuth Setup

### 1. Facebook Developers
- Go to https://developers.facebook.com
- Create new app
- App type: Consumer
- App name: EdgeBet AI

### 2. Add Facebook Login
- Dashboard → Add Product → Facebook Login
- Settings → Valid OAuth Redirect URIs:
  ```
  https://edgebet-backend-1.onrender.com/auth/facebook/callback
  ```

### 3. Get App Credentials
- Settings → Basic
- Copy **App ID** and **App Secret**
- App domains: `edgebet-backend-1.onrender.com`
- Privacy Policy URL: (create one or use placeholder)
- Terms of Service URL: (create one or use placeholder)

### 4. Make App Live
- App Review → Make EdgeBet AI public? → Yes

### 5. Add to Render
```bash
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

---

## 🧪 Testing OAuth

### Google Test
1. Go to your app
2. Click "Continue with Google"
3. Select your Google account
4. Should redirect back to app with onboarding or dashboard

### Facebook Test
1. Go to your app
2. Click "Continue with Facebook"
3. Accept permissions
4. Should redirect back to app

---

## 🔐 Security Notes

### State Parameter
- OAuth uses state parameter to prevent CSRF attacks
- States expire after 10 minutes
- Old states are automatically cleaned up

### Account Linking
- If email exists from another provider, user can link accounts
- Same email = same account across Google/Facebook/Email

### Token Storage
- JWT tokens stored in localStorage
- Tokens persist across sessions
- Clear on logout

---

## 🎨 UI Changes

### Login Screen
```
⚡ EdgeBet AI
Algorithmic sports betting

[Continue with Google]
[Continue with Facebook]

--- or ---

Email: [___________]
Password: [___________]
[Sign In with Email]
[Create Account]
```

### Button Styling
- **Google**: White button with Google "G" logo
- **Facebook**: Blue button with Facebook "f" logo
- Both have hover states and proper spacing

---

## 🚀 Complete Setup Checklist

### Backend (Render)
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] STRIPE_PRICE_PRO
- [ ] STRIPE_PRICE_SHARP
- [ ] GOOGLE_CLIENT_ID ← NEW
- [ ] GOOGLE_CLIENT_SECRET ← NEW
- [ ] FACEBOOK_APP_ID ← NEW
- [ ] FACEBOOK_APP_SECRET ← NEW
- [ ] FRONTEND_URL ← NEW

### Google Cloud
- [ ] Create project
- [ ] Configure OAuth consent screen
- [ ] Add redirect URI
- [ ] Copy credentials to Render

### Facebook
- [ ] Create app
- [ ] Add Facebook Login product
- [ ] Configure redirect URI
- [ ] Make app public
- [ ] Copy credentials to Render

### Testing
- [ ] Test Google login
- [ ] Test Facebook login
- [ ] Test email login still works
- [ ] Verify onboarding flow
- [ ] Check subscription still works

---

## 📊 Benefits of OAuth

### For Users
- **Faster signup** - 1 click vs typing email/password
- **No password to remember** - Use existing Google/Facebook
- **More trust** - Recognized brands

### For You
- **Higher conversion** - 20-40% more signups with social login
- **Verified emails** - Google/Facebook already verified
- **Richer profiles** - Name, profile picture from provider

---

## 🐛 Troubleshooting

### "Google login not available"
- Check GOOGLE_CLIENT_ID is set in Render
- Check backend is deployed successfully

### "Invalid state" error
- State expired (took >10 minutes)
- Try again

### "Login failed" with no details
- Check browser console for errors
- Check backend logs in Render

### Facebook "App not set up"
- Facebook app not live yet
- Add your email as test user
- Or make app public in Facebook dashboard

### Redirect loops
- Check FRONTEND_URL matches actual URL
- Include/exclude www consistently

---

## Commits
- Backend v5.1: `dbeab4a`
- Frontend v5.1: `096b9e4`

## Live URLs
- Frontend: https://grandrichlife727-design.github.io/edgebet-ai/
- Backend: https://edgebet-backend-1.onrender.com

Ready for social logins! 🚀
