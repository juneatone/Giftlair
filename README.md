# 🎁 Giftlair — AI Gift Finder for India

> Stop Guessing. Start Gifting.

Giftlair is a free AI-powered gift recommendation engine that suggests personalised gifts for every occasion, with prices in ₹ and direct links to Amazon India, Flipkart, Myntra, Coursera, Udemy, and Google Shopping.

---

## ✨ Features

- 🧠 AI-powered gift recommendations (rule-based engine, swappable with GPT-4o)
- 🛒 Shop on Amazon, Flipkart, Myntra, Coursera, Udemy & Google Shopping
- ₹ Prices in Indian Rupees with budget slider & presets
- 🔐 Google OAuth + Email/Password authentication (Firebase)
- ❤️ Save favourite gifts per user account
- 🎲 Surprise Me — random occasion + budget generator
- 📱 Fully responsive, mobile-friendly
- 🌟 Beautiful landing page + dark-themed gift engine

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase (optional — app works in demo mode without it)

Open `src/App.jsx` and scroll to **§2 FIREBASE AUTH LAYER**.  
Replace the placeholder `FIREBASE_CONFIG` with your real config:

```js
const FIREBASE_CONFIG = {
  apiKey:            "your-real-api-key",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId:             "your-app-id",
};
```

**Firebase setup (5 min):**
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → Add a Web App → copy the config
3. Enable **Authentication** → Sign-in method → turn on **Email/Password** + **Google**
4. Add your domain to **Authentication → Settings → Authorized Domains**

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
```

---

## 📦 Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Vercel auto-detects Vite → click **Deploy**
4. Your app is live at `https://your-project.vercel.app` 🎉

---

## 🗂 Project Structure

```
giftlair/
├── public/
│   └── favicon.svg          # Gift box favicon
├── src/
│   ├── App.jsx              # Entire app (landing + gift engine + auth)
│   ├── main.jsx             # React entry point
│   └── index.css            # Minimal reset
├── index.html               # HTML shell
├── package.json
├── vite.config.js
├── vercel.json              # Vercel SPA routing config
└── .gitignore
```

---

## 🔮 Upgrade Paths

| Feature | Current | Upgrade to |
|---|---|---|
| Gift recommendations | Rule-based scoring | OpenAI GPT-4o API |
| Product images | Unsplash free tier | Amazon PA API v5 |
| Product ratings | Curated data | Amazon PA API v5 |
| Authentication | Firebase (Google + Email) | Already production-ready |
| Shopping links | Deep search links | Amazon/Flipkart Affiliate APIs |

---

## 📄 License

MIT — free to use, modify, and deploy.
