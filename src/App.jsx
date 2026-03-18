/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        GIFTLAIR — Complete App  v6  (Firebase Auth)            ║
 * ║  Landing Page  ←→  Gift Recommendation Engine                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  AUTH  (§2)                                                     ║
 * ║  ─ Real Firebase Authentication via CDN (no npm needed)        ║
 * ║  ─ Google OAuth 2.0 popup  (signInWithPopup)                   ║
 * ║  ─ Email / Password register  →  sends verification email      ║
 * ║  ─ Email / Password login  with friendly error messages        ║
 * ║  ─ Forgot password  →  Firebase sendPasswordResetEmail         ║
 * ║  ─ onAuthStateChanged listener  →  session auto-persists       ║
 * ║  ─ Per-user favorites stored in localStorage keyed by uid      ║
 * ║                                                                 ║
 * ║  SETUP (takes ~5 min):                                         ║
 * ║  1. Create a Firebase project at console.firebase.google.com   ║
 * ║  2. Enable Authentication → Email/Password + Google providers  ║
 * ║  3. Add your domain to Authorized Domains                      ║
 * ║  4. Paste your firebaseConfig into §2 below                    ║
 * ║                                                                 ║
 * ║  Until configured, the app runs in DEMO MODE (localStorage)    ║
 * ║  with a clear banner so you always know which mode is active.  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════
// §1  GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:#1a1612; --stone:#3d3832; --mist:#8c867e;
    --cream:#faf8f4; --surface:#ffffff; --border:#e8e3db;
    --accent:#d4603a; --accent2:#f5e6de; --gold:#c9a96e;
    --r-sm:4px; --r-md:14px; --r-lg:22px; --r-xl:32px;
  }

  html { scroll-behavior:smooth; }
  body { font-family:'Plus Jakarta Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; overflow-x:hidden; }

  .display { font-family:'Cormorant Garamond',Georgia,serif; font-weight:300; line-height:1.08; letter-spacing:-0.02em; }
  .display-strong { font-weight:600; }
  .label { font-size:11px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:var(--accent); }

  .btn-primary {
    display:inline-flex; align-items:center; gap:8px;
    background:var(--accent); color:#fff; padding:14px 32px; border-radius:50px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:600;
    border:none; cursor:pointer; transition:background .2s,transform .15s,box-shadow .2s;
    box-shadow:0 4px 24px rgba(212,96,58,.22); text-decoration:none;
  }
  .btn-primary:hover { background:#c05530; transform:translateY(-2px); box-shadow:0 8px 32px rgba(212,96,58,.3); }
  .btn-primary:active { transform:translateY(0); }

  .btn-ghost {
    display:inline-flex; align-items:center; gap:8px;
    background:transparent; color:var(--stone); padding:13px 28px; border-radius:50px;
    font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:500;
    border:1.5px solid var(--border); cursor:pointer;
    transition:border-color .2s,color .2s,background .2s; text-decoration:none;
  }
  .btn-ghost:hover { border-color:var(--stone); background:rgba(26,22,18,.04); }

  .lp-container { max-width:1120px; margin:0 auto; padding:0 24px; }
  .section { padding:96px 0; }
  .section-sm { padding:64px 0; }

  .lp-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--r-lg); padding:32px;
    transition:border-color .2s,transform .22s,box-shadow .22s;
  }
  .lp-card:hover { border-color:#d8d0c6; transform:translateY(-4px); box-shadow:0 12px 40px rgba(26,22,18,.07); }

  .fade-up { opacity:0; transform:translateY(24px); transition:opacity .6s ease,transform .6s ease; }
  .fade-up.visible { opacity:1; transform:translateY(0); }

  .page { min-height:100vh; will-change:transform,opacity; }
  .page-enter-landing { animation:enterFromRight .42s cubic-bezier(.22,1,.36,1) forwards; }
  .page-enter-app     { animation:enterFromLeft  .42s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes enterFromLeft  { from{opacity:0;transform:translateX(48px)} to{opacity:1;transform:translateX(0)} }
  @keyframes enterFromRight { from{opacity:0;transform:translateX(-48px)} to{opacity:1;transform:translateX(0)} }

  .gc-anim { animation:fadeUp .4s ease forwards; opacity:0; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{opacity:.45} 50%{opacity:1} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }

  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
    background:linear-gradient(135deg,#e8a87c,#c084fc); cursor:pointer; border:2px solid #0f0a10;
  }
  input:focus { border-color:rgba(232,168,124,.55) !important; outline:none; }
  select option { background:#1a1014; color:#f0ece4; }
  a { color:inherit; text-decoration:none; }
  img { max-width:100%; display:block; }

  @media(max-width:768px) {
    .section { padding:64px 0; }
    .lp-container { padding:0 20px; }
    .nav-links { display:none !important; }
  }
`;

// ═══════════════════════════════════════════════════════════════════
// §2  FIREBASE AUTH LAYER
// ═══════════════════════════════════════════════════════════════════
/**
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  PASTE YOUR FIREBASE CONFIG HERE                               │
 * │                                                                 │
 * │  Get it from:                                                   │
 * │  Firebase Console → Project Settings → Your apps → Web app     │
 * │                                                                 │
 * │  Required Firebase services to enable:                         │
 * │  Authentication → Sign-in method:                              │
 * │    ✅ Email/Password                                            │
 * │    ✅ Google                                                    │
 * │                                                                 │
 * │  Also add your domain to:                                       │
 * │  Authentication → Settings → Authorized domains                │
 * └─────────────────────────────────────────────────────────────────┘
 */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDEoa5y4zz3EtcqNjjVVdPq2zORKBDCyxg",
  authDomain: "giftlair-4dfcb.firebaseapp.com",
  projectId: "giftlair-4dfcb",
  storageBucket: "giftlair-4dfcb.firebasestorage.app",
  messagingSenderId: "967528798558",
  appId: "1:967528798558:web:baf98ace90556276e597cf",
  measurementId: "G-P5SP0LWPGS"
};

// Detect if config is real or placeholder
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" && FIREBASE_CONFIG.apiKey.length > 10;

// Firebase module refs (populated after SDK loads)
let fbAuth = null, fbGoogle = null, fbGithub = null;
let fbSignInGoogle, fbSignInEmailPassword, fbCreateEmailPassword,
    fbSendVerification, fbSendPasswordReset, fbSignOut, fbOnAuthStateChanged;

// Load Firebase SDK from CDN and initialise
async function loadFirebase() {
  if (!FIREBASE_READY) return false;
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const {
      getAuth, GoogleAuthProvider, GithubAuthProvider,
      signInWithPopup, signInWithEmailAndPassword,
      createUserWithEmailAndPassword, sendEmailVerification,
      sendPasswordResetEmail, signOut, onAuthStateChanged,
    } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");

    const app = initializeApp(FIREBASE_CONFIG);
    fbAuth   = getAuth(app);
    fbGoogle = new GoogleAuthProvider();
    fbGoogle.addScope("profile");
    fbGoogle.addScope("email");
    fbGithub = new GithubAuthProvider();

    fbSignInGoogle           = () => signInWithPopup(fbAuth, fbGoogle);
    fbSignInEmailPassword    = (e, p) => signInWithEmailAndPassword(fbAuth, e, p);
    fbCreateEmailPassword    = (e, p) => createUserWithEmailAndPassword(fbAuth, e, p);
    fbSendVerification       = (u) => sendEmailVerification(u);
    fbSendPasswordReset      = (e) => sendPasswordResetEmail(fbAuth, e);
    fbSignOut                = () => signOut(fbAuth);
    fbOnAuthStateChanged     = (cb) => onAuthStateChanged(fbAuth, cb);
    return true;
  } catch (err) {
    console.error("Firebase load error:", err);
    return false;
  }
}

// ── Demo-mode fallback (localStorage) ────────────────────────────
const DEMO_AUTH_KEY = "gl_demo_users_v6";
const DEMO_SESSION  = "gl_demo_session_v6";
const getDemoUsers  = () => { try{return JSON.parse(localStorage.getItem(DEMO_AUTH_KEY)||"{}")}catch{return{}} };
const saveDemoUsers = u => localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(u));
const getDemoSess   = () => { try{return JSON.parse(localStorage.getItem(DEMO_SESSION)||"null")}catch{return null} };
const saveDemoSess  = u => localStorage.setItem(DEMO_SESSION, JSON.stringify(u));
const clearDemoSess = () => localStorage.removeItem(DEMO_SESSION);

function demoRegister({name, email, password}) {
  const users = getDemoUsers();
  if (users[email]) return { error: "An account with this email already exists." };
  const uid = "demo_" + Date.now();
  users[email] = { uid, name, email, password, avatar: name[0].toUpperCase(), emailVerified: true };
  saveDemoUsers(users);
  return { user: users[email] };
}
function demoLogin({email, password}) {
  const users = getDemoUsers(), u = users[email];
  if (!u)              return { error: "No account found with this email." };
  if (u.password !== password) return { error: "Incorrect password." };
  return { user: u };
}

// ── Human-friendly Firebase error messages ───────────────────────
function firebaseErrMsg(code) {
  const map = {
    "auth/email-already-in-use":      "An account with this email already exists.",
    "auth/invalid-email":             "Please enter a valid email address.",
    "auth/weak-password":             "Password must be at least 6 characters.",
    "auth/user-not-found":            "No account found with this email.",
    "auth/wrong-password":            "Incorrect password. Try again or reset it.",
    "auth/invalid-credential":        "Email or password is incorrect.",
    "auth/too-many-requests":         "Too many attempts. Please try again later.",
    "auth/network-request-failed":    "Network error. Check your connection.",
    "auth/popup-closed-by-user":      "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request":   "Another sign-in is in progress.",
    "auth/popup-blocked":             "Popup was blocked by your browser. Allow popups for this site.",
    "auth/account-exists-with-different-credential": "An account already exists with this email. Try a different sign-in method.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

// Normalize any Firebase or demo user to a common shape
function normalizeUser(u) {
  if (!u) return null;
  return {
    uid:           u.uid,
    name:          u.displayName || u.name || u.email.split("@")[0],
    email:         u.email,
    avatar:        (u.displayName || u.name || u.email)[0].toUpperCase(),
    photoURL:      u.photoURL || null,
    emailVerified: u.emailVerified ?? true,
    provider:      u.providerData?.[0]?.providerId || "email",
  };
}

// ── Favorites persisted per user ──────────────────────────────────
const FAVS_KEY    = uid => `gl_favs_${uid}`;
const getUserFavs = uid => { try{return JSON.parse(localStorage.getItem(FAVS_KEY(uid))||"[]")}catch{return[]} };
const saveUserFavs= (uid, f) => localStorage.setItem(FAVS_KEY(uid), JSON.stringify(f));

// ═══════════════════════════════════════════════════════════════════
// §3  GIFT DATABASE
// ═══════════════════════════════════════════════════════════════════
const vendorFns = {
  amazon:   n=>`https://www.amazon.in/s?k=${encodeURIComponent(n+" india")}`,
  flipkart: n=>`https://www.flipkart.com/search?q=${encodeURIComponent(n)}`,
  myntra:   n=>`https://www.myntra.com/${encodeURIComponent(n.toLowerCase().replace(/\s+/g,"-"))}`,
  coursera: n=>`https://www.coursera.org/search?query=${encodeURIComponent(n)}`,
  udemy:    n=>`https://www.udemy.com/courses/search/?q=${encodeURIComponent(n)}`,
  google:   n=>`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(n+" india buy online")}`,
};
const VENDOR_META={
  amazon:   {label:"Amazon",         color:"#ff9900",bg:"#ff9900",tc:"#111",icon:"a"},
  flipkart: {label:"Flipkart",       color:"#2874f0",bg:"#2874f0",tc:"#fff",icon:"F"},
  myntra:   {label:"Myntra",         color:"#ff3f6c",bg:"#ff3f6c",tc:"#fff",icon:"M"},
  coursera: {label:"Coursera",       color:"#0056d2",bg:"#0056d2",tc:"#fff",icon:"C"},
  udemy:    {label:"Udemy",          color:"#a435f0",bg:"#a435f0",tc:"#fff",icon:"U"},
  google:   {label:"Google Shopping",color:"#34a853",bg:"#34a853",tc:"#fff",icon:"G"},
};
const productImageUrl=(kw,id)=>`https://source.unsplash.com/400x300/?${encodeURIComponent(kw)}&sig=${id}`;

const GIFT_POOL=[
  {id:1, name:"Custom Star Map Print",         imgKw:"night sky stars print",              r:4.5,rv:2841, desc:"A beautifully printed map of the night sky on a meaningful date — first date, birthday, or anniversary.",       price:"₹3,500–₹6,500",  cat:"Personalized",    emoji:"🌌",tags:["romantic","anniversary","birthday","partner","friend"],            minB:3500, v:["amazon","flipkart","google"]},
  {id:2, name:"Monogrammed Leather Wallet",     imgKw:"leather wallet brown monogram",      r:4.3,rv:5612, desc:"Hand-stitched full-grain leather wallet with initials embossed. Classic and enduring.",                        price:"₹1,800–₹4,500",  cat:"Personalized",    emoji:"👛",tags:["birthday","colleague","parent","graduation"],                      minB:1800, v:["amazon","flipkart","myntra","google"]},
  {id:3, name:"Custom Portrait Illustration",   imgKw:"watercolor portrait artwork",        r:4.7,rv:1203, desc:"A digital artist creates a stylized portrait from a photo — watercolor, cartoon, or oil-paint style.",         price:"₹2,500–₹6,000",  cat:"Personalized",    emoji:"🎨",tags:["birthday","anniversary","friend","partner","parent"],              minB:2500, v:["google"]},
  {id:4, name:"Engraved Wooden Jewelry Box",    imgKw:"wooden jewelry box engraved",        r:4.4,rv:3890, desc:"Velvet-lined wooden jewelry box with a personal message laser-engraved on the lid.",                          price:"₹1,500–₹3,500",  cat:"Personalized",    emoji:"💍",tags:["birthday","wedding","anniversary","female","partner"],             minB:1500, v:["amazon","flipkart","myntra","google"]},
  {id:5, name:"Custom Photo Recipe Book",       imgKw:"hardcover recipe book kitchen",      r:4.6,rv:987,  desc:"A hardcover book filled with family recipes, photos, and handwritten notes — printed and bound.",             price:"₹2,200–₹4,000",  cat:"Personalized",    emoji:"📖",tags:["parent","grandparent","anniversary","cooking"],                    minB:2200, v:["amazon","google"]},
  {id:24,name:"Leather-Bound Journal",          imgKw:"leather journal notebook brass",     r:4.4,rv:7241, desc:"A thick, deckle-edge journal with a leather cover and brass clasp for the thoughtful writer.",                price:"₹800–₹2,200",    cat:"Personalized",    emoji:"📔",tags:["birthday","graduation","friend","writing"],                        minB:800,  v:["amazon","flipkart","myntra","google"]},
  {id:6, name:"Sony WH-1000XM5 Headphones",    imgKw:"sony noise cancelling headphones",   r:4.6,rv:28540,desc:"Industry-leading noise cancellation, 30-hour battery, spatial audio and buttery comfort.",                   price:"₹22,000–₹32,000",cat:"Luxury",          emoji:"🎧",tags:["birthday","graduation","music","tech","friend","partner","colleague"],minB:22000,v:["amazon","flipkart","google"]},
  {id:7, name:"Luxury Spa Day Voucher",         imgKw:"luxury spa massage candles",         r:4.5,rv:1542, desc:"Full-day spa experience: deep-tissue massage, facial, hydrotherapy. Pure indulgence.",                       price:"₹4,500–₹12,000", cat:"Luxury",          emoji:"🛁",tags:["birthday","anniversary","female","partner","parent","wedding"],    minB:4500, v:["google"]},
  {id:8, name:"Pure Pashmina Shawl",            imgKw:"pashmina kashmir shawl wrap",        r:4.3,rv:4821, desc:"100% genuine Pashmina from Kashmir, in a classic herringbone weave. Impossibly soft.",                       price:"₹3,500–₹9,000",  cat:"Luxury",          emoji:"🧣",tags:["birthday","parent","anniversary","wedding","colleague"],            minB:3500, v:["amazon","flipkart","myntra","google"]},
  {id:9, name:"Premium Wine & Cheese Hamper",   imgKw:"wine cheese gift hamper basket",     r:4.4,rv:2103, desc:"Three curated imported wines with artisan cheese, crackers, and a crystal decanter.",                        price:"₹4,000–₹9,000",  cat:"Luxury",          emoji:"🍷",tags:["anniversary","wedding","colleague","parent","birthday"],            minB:4000, v:["amazon","google"]},
  {id:10,name:"Apple Watch Series 9",           imgKw:"apple watch smartwatch wrist",       r:4.7,rv:51230,desc:"Tracks heart rate, sleep, GPS, ECG and crash detection. Stunning always-on Retina display.",                 price:"₹35,000–₹55,000",cat:"Luxury",          emoji:"⌚",tags:["birthday","graduation","fitness","tech","partner","friend"],       minB:35000,v:["amazon","flipkart","google"]},
  {id:20,name:"Ergonomic Zero-Gravity Chair",   imgKw:"ergonomic recliner chair modern",    r:4.1,rv:3201, desc:"Premium recliner that distributes body weight perfectly — the gift of total relaxation.",                    price:"₹12,000–₹25,000",cat:"Luxury",          emoji:"🪑",tags:["parent","grandparent","birthday","wellness"],                      minB:12000,v:["amazon","flipkart","google"]},
  {id:11,name:"Scented Soy Candle Gift Set",    imgKw:"soy candle set gift box",            r:4.5,rv:8934, desc:"Hand-poured soy candles in three signature scents: sandalwood, fig & amber, ocean rain.",                   price:"₹600–₹1,500",    cat:"Budget-friendly", emoji:"🕯️",tags:["birthday","colleague","friend","female","housewarming"],           minB:600,  v:["amazon","flipkart","myntra","google"]},
  {id:12,name:"Artisan Chocolate Gift Box",     imgKw:"chocolate gift box assortment",      r:4.6,rv:12450,desc:"An assortment of 24 premium chocolates — dark, milk, white, with exotic Indian & Belgian fillings.",         price:"₹500–₹1,800",    cat:"Budget-friendly", emoji:"🍫",tags:["birthday","colleague","friend","partner","valentine"],             minB:500,  v:["amazon","flipkart","google"]},
  {id:13,name:"Succulent Terrarium Kit",        imgKw:"succulent plant terrarium ceramic",  r:4.3,rv:6712, desc:"A ceramic planter with three mini succulents, volcanic soil, and a tiny bamboo rake.",                       price:"₹600–₹1,500",    cat:"Budget-friendly", emoji:"🌵",tags:["birthday","colleague","housewarming","friend"],                    minB:600,  v:["amazon","flipkart","google"]},
  {id:14,name:"Gourmet Spice Collection",       imgKw:"spice jars collection kitchen",      r:4.4,rv:4301, desc:"12 rare global & Indian spices in reusable glass jars — Kashmiri saffron, smoked paprika, sumac.",           price:"₹900–₹2,200",    cat:"Budget-friendly", emoji:"🌶️",tags:["birthday","parent","friend","cooking","housewarming"],             minB:900,  v:["amazon","flipkart","google"]},
  {id:15,name:"Kindle Paperwhite",              imgKw:"kindle ereader book reading",        r:4.7,rv:89023,desc:"Glare-free display, IPX8 waterproof, weeks of battery and access to millions of books.",                     price:"₹8,999–₹14,999", cat:"Budget-friendly", emoji:"📚",tags:["birthday","friend","parent","graduation","reading"],              minB:8999, v:["amazon","flipkart","google"]},
  {id:23,name:"Smart Home Starter Kit",         imgKw:"smart home lights speaker bulb",     r:4.2,rv:15820,desc:"Voice-controlled smart bulbs, smart plug, and mini speaker — transform any room instantly.",                 price:"₹2,500–₹5,000",  cat:"Budget-friendly", emoji:"💡",tags:["birthday","housewarming","tech","friend","colleague"],             minB:2500, v:["amazon","flipkart","google"]},
  {id:16,name:"MasterClass Annual Membership",  imgKw:"online learning masterclass education",r:4.6,rv:3421,desc:"12-month access to 180+ world-class courses in cooking, writing, film, music and more.",                    price:"₹7,500–₹15,000", cat:"Unique",          emoji:"🎓",tags:["birthday","graduation","friend","partner","colleague","learning"],  minB:7500, v:["coursera","udemy","google"]},
  {id:17,name:"DNA Ancestry & Health Kit",      imgKw:"dna test kit science ancestry",      r:4.3,rv:2087, desc:"Discover heritage, health traits, and unexpected family connections through DNA analysis.",                   price:"₹5,000–₹9,000",  cat:"Unique",          emoji:"🧬",tags:["birthday","parent","grandparent","friend"],                        minB:5000, v:["amazon","google"]},
  {id:18,name:"Hot Air Balloon Flight Jaipur",  imgKw:"hot air balloon jaipur sunrise",     r:4.8,rv:1243, desc:"A sunrise balloon flight over the Pink City for two, with traditional Rajasthani breakfast after.",          price:"₹12,000–₹18,000",cat:"Unique",          emoji:"🎈",tags:["anniversary","birthday","partner","adventure"],                    minB:12000,v:["google"]},
  {id:19,name:"Single Malt Whisky Tasting Set", imgKw:"whisky tasting set bottles gift",    r:4.5,rv:3102, desc:"Six premium single-malt whiskies from Scotland and India's finest distilleries, with a tasting guide.",     price:"₹4,000–₹9,000",  cat:"Unique",          emoji:"🥃",tags:["birthday","male","parent","colleague","friend"],                   minB:4000, v:["amazon","flipkart","google"]},
  {id:21,name:"Fujifilm Instax Mini Camera",    imgKw:"fujifilm instax mini camera polaroid",r:4.5,rv:34120,desc:"Instant film camera with 10 color films included. Real, tangible memories in seconds.",                     price:"₹4,500–₹8,500",  cat:"Unique",          emoji:"📷",tags:["birthday","friend","graduation","photography"],                    minB:4500, v:["amazon","flipkart","google"]},
  {id:22,name:"Cooking Masterclass for Two",    imgKw:"cooking class chef kitchen",         r:4.7,rv:891,  desc:"A 3-hour hands-on class with a professional chef in Mumbai/Delhi — pasta, sushi, or Indian cuisine.",       price:"₹3,500–₹7,000",  cat:"Unique",          emoji:"👨‍🍳",tags:["anniversary","birthday","partner","friend","cooking"],             minB:3500, v:["coursera","google"]},
  {id:25,name:"Online Photography Course",      imgKw:"photography course camera learn",    r:4.5,rv:8320, desc:"Learn professional photography from composition to editing — self-paced, certificate included.",             price:"₹1,200–₹4,500",  cat:"Unique",          emoji:"📸",tags:["birthday","friend","graduation","photography","learning"],         minB:1200, v:["coursera","udemy","google"]},
  {id:26,name:"Creative Writing Workshop",      imgKw:"writing workshop creative desk",     r:4.4,rv:3102, desc:"A structured 8-week writing course with expert feedback, for aspiring novelists and bloggers.",              price:"₹2,000–₹6,000",  cat:"Unique",          emoji:"✍️",tags:["birthday","graduation","friend","writing","learning"],             minB:2000, v:["coursera","udemy","google"]},
];

const CATEGORIES    =["All","Personalized","Luxury","Budget-friendly","Unique"];
const OCCASIONS     =["Birthday","Anniversary","Wedding","Graduation","Valentine's Day","Christmas","Housewarming","Baby Shower","Retirement","Just Because"];
const RELATIONSHIPS =["Partner","Friend","Parent","Sibling","Colleague","Grandparent","Child","Teacher"];
const GENDERS       =["Any","Female","Male","Non-binary"];
const BUDGET_PRESETS=[
  {label:"Under ₹1K",range:[0,1000]},    {label:"₹1K–₹5K",  range:[1000,5000]},
  {label:"₹5K–₹15K", range:[5000,15000]},{label:"₹15K–₹60K",range:[15000,60000]},
];

// ═══════════════════════════════════════════════════════════════════
// §4  GIFT ENGINE
// ═══════════════════════════════════════════════════════════════════
function generateGifts({occasion,relationship,budget,interests,gender}) {
  const [minB,maxB]=budget, low=(interests||"").toLowerCase();
  return GIFT_POOL.filter(g=>g.minB<=maxB).map(g=>{
    let s=0; const tags=g.tags.map(t=>t.toLowerCase());
    if(tags.includes(occasion.toLowerCase()))     s+=3;
    if(tags.includes(relationship.toLowerCase())) s+=3;
    if(gender!=="Any"){
      if(tags.includes(gender.toLowerCase()))     s+=2;
      else if(tags.includes("female")||tags.includes("male")) s-=1;
    }
    if(g.minB>=minB*0.8&&g.minB<=maxB) s+=2;
    if(low) low.split(/[\s,]+/).filter(Boolean).forEach(w=>{
      if(tags.some(t=>t.includes(w))||g.name.toLowerCase().includes(w)||g.desc.toLowerCase().includes(w)) s+=4;
    });
    s+=Math.random()*0.5;
    return {...g,score:s};
  }).sort((a,b)=>b.score-a.score).slice(0,9);
}

// ═══════════════════════════════════════════════════════════════════
// §5  ANIMATION HOOK
// ═══════════════════════════════════════════════════════════════════
function useFadeUp(ref) {
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.classList.add("visible");obs.disconnect();}},{threshold:.12});
    obs.observe(el); return()=>obs.disconnect();
  },[]);
}
function FadeUp({children,delay=0,style={}}) {
  const ref=useRef(null); useFadeUp(ref);
  return <div ref={ref} className="fade-up" style={{transitionDelay:`${delay}ms`,...style}}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════
// §6  AUTH MODAL  (Google OAuth + Email/Password + Forgot Password)
// ═══════════════════════════════════════════════════════════════════
function AuthModal({onClose, onAuth, demoMode}) {
  // view: "main" | "register" | "forgot" | "verify-sent" | "reset-sent"
  const [view,   setView]    = useState("main");
  const [name,   setName]    = useState("");
  const [email,  setEmail]   = useState("");
  const [pw,     setPw]      = useState("");
  const [pw2,    setPw2]     = useState("");
  const [showPw, setShowPw]  = useState(false);
  const [error,  setError]   = useState("");
  const [info,   setInfo]    = useState("");
  const [busy,   setBusy]    = useState(false);

  const reset = ()=>{ setError(""); setInfo(""); };

  // ── Google Sign-In ──────────────────────────────────────────────
  const handleGoogle = async () => {
    reset(); setBusy(true);
    try {
      if (demoMode) {
        // Demo: create a plausible Google user
        const u = { uid:"google_demo_"+Date.now(), name:"Google Demo User", email:"google-demo@giftlair.app", avatar:"G", emailVerified:true, provider:"google.com" };
        onAuth(u);
      } else {
        const result = await fbSignInGoogle();
        onAuth(normalizeUser(result.user));
      }
    } catch(e) { setError(firebaseErrMsg(e.code)); }
    finally { setBusy(false); }
  };

  // ── Email Login ─────────────────────────────────────────────────
  const handleEmailLogin = async () => {
    reset();
    if (!email || !pw) { setError("Please fill in your email and password."); return; }
    setBusy(true);
    try {
      if (demoMode) {
        const res = demoLogin({email, password:pw});
        if (res.error) { setError(res.error); setBusy(false); return; }
        onAuth(res.user);
      } else {
        const result = await fbSignInEmailPassword(email, pw);
        onAuth(normalizeUser(result.user));
      }
    } catch(e) { setError(firebaseErrMsg(e.code)); }
    finally { setBusy(false); }
  };

  // ── Register ────────────────────────────────────────────────────
  const handleRegister = async () => {
    reset();
    if (!name.trim())          { setError("Please enter your full name."); return; }
    if (!email)                { setError("Please enter your email address."); return; }
    if (pw.length < 6)         { setError("Password must be at least 6 characters."); return; }
    if (pw !== pw2)            { setError("Passwords don't match."); return; }
    setBusy(true);
    try {
      if (demoMode) {
        const res = demoRegister({name, email, password:pw});
        if (res.error) { setError(res.error); setBusy(false); return; }
        onAuth(res.user);
      } else {
        const result = await fbCreateEmailPassword(email, pw);
        await fbSendVerification(result.user);
        setView("verify-sent");
      }
    } catch(e) { setError(firebaseErrMsg(e.code)); }
    finally { setBusy(false); }
  };

  // ── Forgot Password ─────────────────────────────────────────────
  const handleForgot = async () => {
    reset();
    if (!email) { setError("Please enter your email address first."); return; }
    setBusy(true);
    try {
      if (demoMode) { setInfo("Demo mode: no real email sent, but the flow works! ✓"); setView("reset-sent"); }
      else { await fbSendPasswordReset(email); setView("reset-sent"); }
    } catch(e) { setError(firebaseErrMsg(e.code)); }
    finally { setBusy(false); }
  };

  // ── Shared input style ──────────────────────────────────────────
  const iSt = {
    width:"100%", padding:"12px 16px",
    background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)",
    borderRadius:12, color:"#f0ece4", fontSize:14, fontFamily:"'DM Sans',sans-serif",
    marginBottom:10, transition:"border-color .2s",
  };
  const lSt = { display:"block", fontSize:11.5, fontWeight:600, color:"rgba(240,236,228,0.5)", marginBottom:5, letterSpacing:"0.05em" };

  // ── Render helpers ──────────────────────────────────────────────
  const Spinner = () => (
    <div style={{width:18,height:18,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>
  );

  const renderContent = () => {
    // ── Verify email sent ──
    if (view==="verify-sent") return (
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:16}}>📧</div>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#f0ece4",marginBottom:10}}>Check your inbox</h3>
        <p style={{fontSize:14,color:"rgba(240,236,228,0.55)",lineHeight:1.7,marginBottom:24}}>
          We've sent a verification link to <strong style={{color:"#e8a87c"}}>{email}</strong>.<br/>
          Click the link to activate your account, then sign in below.
        </p>
        <button onClick={()=>{setView("main");setEmail("");setPw("");setPw2("");}} style={{width:"100%",padding:12,borderRadius:12,background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          Back to Sign In
        </button>
      </div>
    );

    // ── Password reset sent ──
    if (view==="reset-sent") return (
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:16}}>✅</div>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#f0ece4",marginBottom:10}}>Reset email sent</h3>
        <p style={{fontSize:14,color:"rgba(240,236,228,0.55)",lineHeight:1.7,marginBottom:24}}>
          We've sent a password reset link to <strong style={{color:"#e8a87c"}}>{email}</strong>.<br/>
          Check your inbox (and spam folder).
        </p>
        <button onClick={()=>setView("main")} style={{width:"100%",padding:12,borderRadius:12,background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          Back to Sign In
        </button>
      </div>
    );

    // ── Register form ──
    if (view==="register") return (
      <>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#f0ece4",marginBottom:4}}>Create your account</h3>
        <p style={{fontSize:13,color:"rgba(240,236,228,0.4)",marginBottom:20}}>Save gift ideas and access them anytime.</p>

        {/* Google register */}
        <button onClick={handleGoogle} disabled={busy} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 16px",borderRadius:12,background:"#fff",color:"#3c4043",border:"1px solid #dadce0",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:16,transition:"box-shadow .2s"}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.15)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {busy?"Please wait…":"Sign up with Google"}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
          <span style={{fontSize:12,color:"rgba(240,236,228,0.3)"}}>or with email</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
        </div>

        <label style={lSt}>Full name</label>
        <input style={iSt} placeholder="Aarav Sharma" value={name} onChange={e=>setName(e.target.value)}/>
        <label style={lSt}>Email address</label>
        <input style={iSt} placeholder="you@example.com" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <label style={lSt}>Password <span style={{color:"rgba(240,236,228,0.3)"}}>(min. 6 characters)</span></label>
        <div style={{position:"relative",marginBottom:10}}>
          <input style={{...iSt,marginBottom:0,paddingRight:44}} placeholder="Create a password" type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(240,236,228,0.4)",fontSize:13}}>{showPw?"Hide":"Show"}</button>
        </div>
        <label style={lSt}>Confirm password</label>
        <input style={iSt} placeholder="Repeat your password" type={showPw?"text":"password"} value={pw2} onChange={e=>setPw2(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleRegister()}/>

        {error&&<p style={{color:"#f87171",fontSize:13,margin:"0 0 10px",textAlign:"center"}}>{error}</p>}

        <button onClick={handleRegister} disabled={busy} style={{width:"100%",padding:13,borderRadius:12,background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:busy?0.7:1}}>
          {busy?<Spinner/>:null} {busy?"Creating account…":"Create Account"}
        </button>
        <p style={{textAlign:"center",marginTop:14,fontSize:13,color:"rgba(240,236,228,0.38)"}}>
          Already have an account?{" "}
          <button onClick={()=>{setView("main");reset();}} style={{background:"none",border:"none",color:"#e8a87c",cursor:"pointer",fontWeight:600,fontSize:13}}>Sign In</button>
        </p>
      </>
    );

    // ── Forgot password form ──
    if (view==="forgot") return (
      <>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#f0ece4",marginBottom:4}}>Reset your password</h3>
        <p style={{fontSize:13,color:"rgba(240,236,228,0.4)",marginBottom:20}}>Enter your email and we'll send a reset link instantly.</p>
        <label style={lSt}>Email address</label>
        <input style={iSt} placeholder="you@example.com" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleForgot()}/>
        {error&&<p style={{color:"#f87171",fontSize:13,margin:"0 0 10px",textAlign:"center"}}>{error}</p>}
        <button onClick={handleForgot} disabled={busy} style={{width:"100%",padding:13,borderRadius:12,background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:busy?0.7:1}}>
          {busy?<Spinner/>:null} {busy?"Sending…":"Send Reset Link"}
        </button>
        <p style={{textAlign:"center",marginTop:14,fontSize:13,color:"rgba(240,236,228,0.38)"}}>
          <button onClick={()=>{setView("main");reset();}} style={{background:"none",border:"none",color:"#e8a87c",cursor:"pointer",fontWeight:600,fontSize:13}}>← Back to Sign In</button>
        </p>
      </>
    );

    // ── Main sign-in form (default) ──
    return (
      <>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#f0ece4",marginBottom:4}}>Welcome back</h3>
        <p style={{fontSize:13,color:"rgba(240,236,228,0.4)",marginBottom:20}}>Sign in to access your saved gifts.</p>

        {/* Google button */}
        <button onClick={handleGoogle} disabled={busy} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 16px",borderRadius:12,background:"#fff",color:"#3c4043",border:"1px solid #dadce0",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:12,transition:"box-shadow .2s"}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.15)"} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {busy?"Please wait…":"Continue with Google"}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
          <span style={{fontSize:12,color:"rgba(240,236,228,0.3)"}}>or with email</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
        </div>

        <label style={lSt}>Email address</label>
        <input style={iSt} placeholder="you@example.com" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <label style={{...lSt,marginBottom:0}}>Password</label>
          <button onClick={()=>{setView("forgot");reset();}} style={{background:"none",border:"none",color:"rgba(232,168,124,0.7)",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",padding:0}}>Forgot password?</button>
        </div>
        <div style={{position:"relative",marginBottom:10}}>
          <input style={{...iSt,marginBottom:0,paddingRight:44}} placeholder="Your password" type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleEmailLogin()}/>
          <button onClick={()=>setShowPw(v=>!v)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(240,236,228,0.4)",fontSize:13}}>{showPw?"Hide":"Show"}</button>
        </div>

        {error&&<p style={{color:"#f87171",fontSize:13,margin:"0 0 10px",textAlign:"center"}}>{error}</p>}

        <button onClick={handleEmailLogin} disabled={busy} style={{width:"100%",padding:13,borderRadius:12,background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:busy?0.7:1}}>
          {busy?<Spinner/>:null} {busy?"Signing in…":"Sign In"}
        </button>

        <p style={{textAlign:"center",marginTop:14,fontSize:13,color:"rgba(240,236,228,0.38)"}}>
          Don't have an account?{" "}
          <button onClick={()=>{setView("register");reset();}} style={{background:"none",border:"none",color:"#e8a87c",cursor:"pointer",fontWeight:600,fontSize:13}}>Create one</button>
        </p>
      </>
    );
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.80)",backdropFilter:"blur(10px)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#15101a",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"32px 28px",width:"100%",maxWidth:420,position:"relative",animation:"modalIn .3s ease"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:20}}>🎁</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:16,background:"linear-gradient(90deg,#f0ece4,#e8a87c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Giftlair</span>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(240,236,228,0.35)",cursor:"pointer",fontSize:20,lineHeight:1,padding:4}}>✕</button>
        </div>

        {/* Demo mode badge */}
        {demoMode && (
          <div style={{background:"rgba(201,169,110,0.12)",border:"1px solid rgba(201,169,110,0.3)",borderRadius:10,padding:"8px 13px",marginBottom:18,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>⚠️</span>
            <p style={{fontSize:12,color:"rgba(201,169,110,0.85)",lineHeight:1.5}}>
              <strong>Demo mode</strong> — add your Firebase config in §2 to enable real Google OAuth &amp; email verification.
            </p>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// §7  LANDING PAGE SECTIONS  (condensed but complete)
// ═══════════════════════════════════════════════════════════════════
function LandingNav({onNavigate,user,onLogout,onAuthOpen}) {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>32);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:900,background:scrolled?"rgba(250,248,244,0.93)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid var(--border)":"1px solid transparent",transition:"background .3s,border-color .3s"}}>
      <div className="lp-container" style={{height:68,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <a href="#" style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🎁</span>
          <span className="display" style={{fontSize:22,color:"var(--ink)",fontWeight:600}}>Giftlair</span>
        </a>
        <div style={{display:"flex",alignItems:"center",gap:32}} className="nav-links">
          {["Features","How it works","FAQ"].map(l=><a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{fontSize:14,fontWeight:500,color:"var(--mist)",transition:"color .2s"}} onMouseEnter={e=>e.target.style.color="var(--ink)"} onMouseLeave={e=>e.target.style.color="var(--mist)"}>{l}</a>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {user ? (
            <>
              {user.photoURL
                ? <img src={user.photoURL} style={{width:32,height:32,borderRadius:"50%",objectFit:"cover"}} alt="avatar"/>
                : <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#e8a87c,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#0f0a10"}}>{user.avatar}</div>
              }
              <button onClick={()=>onNavigate("app")} className="btn-primary" style={{padding:"10px 22px",fontSize:14}}>Open App</button>
            </>
          ):(
            <button onClick={()=>onNavigate("app")} className="btn-primary" style={{padding:"10px 22px",fontSize:14}}>Try for Free</button>
          )}
        </div>
      </div>
    </nav>
  );
}

function HeroSection({onNavigate}) {
  const cards=[
    {emoji:"🧣",name:"Pure Pashmina Shawl",price:"₹3,500–₹9,000",tag:"Luxury",bg:"#f0eaf8"},
    {emoji:"📷",name:"Fujifilm Instax Mini",price:"₹4,500–₹8,500",tag:"Unique",bg:"#e8f0fc"},
    {emoji:"🕯️",name:"Soy Candle Gift Set",price:"₹600–₹1,500",tag:"Budget",bg:"#fdf0e8"},
    {emoji:"⌚",name:"Apple Watch Series 9",price:"₹35,000+",tag:"Luxury",bg:"#e8f8f0"},
  ];
  return (
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",paddingTop:120,paddingBottom:80,position:"relative",overflow:"hidden",background:"var(--cream)"}}>
      <div style={{position:"absolute",top:"8%",right:"-6%",width:520,height:520,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,96,58,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"5%",left:"-8%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,169,110,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div className="lp-container">
        <div style={{maxWidth:780}}>
          <FadeUp><div style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--accent2)",border:"1px solid rgba(212,96,58,.2)",borderRadius:50,padding:"6px 16px",marginBottom:36}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block"}}/><span className="label" style={{fontSize:12}}>AI-Powered Gift Finder · Free to Use</span>
          </div></FadeUp>
          <FadeUp delay={80}><h1 className="display" style={{fontSize:"clamp(52px,7.5vw,96px)",color:"var(--ink)",marginBottom:28}}>
            Stop Guessing.{" "}<span className="display-strong" style={{color:"var(--accent)",fontStyle:"italic"}}>Start Gifting.</span>
          </h1></FadeUp>
          <FadeUp delay={150}><p style={{fontSize:"clamp(17px,2vw,20px)",color:"var(--mist)",lineHeight:1.65,maxWidth:580,marginBottom:44}}>
            Finding the right present shouldn't feel like a chore. Giftlair is your free AI shopping assistant — surfaces thoughtful, unique, and trending gifts in seconds, personalised for every person and occasion.
          </p></FadeUp>
          <FadeUp delay={220}><div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:52}}>
            <button className="btn-primary" onClick={()=>onNavigate("app")} style={{fontSize:16,padding:"15px 36px"}}>Find the Perfect Gift →</button>
            <a href="#how-it-works" className="btn-ghost">See how it works</a>
          </div></FadeUp>
          <FadeUp delay={300}><div style={{display:"flex",alignItems:"center",gap:28,flexWrap:"wrap"}}>
            {[{i:"⭐",t:"4.9 / 5 rating"},{i:"🛡️",t:"100% Free, no sign-up needed"},{i:"🇮🇳",t:"Prices in ₹ · Ships to India"}].map(t=>(
              <div key={t.t} style={{display:"flex",alignItems:"center",gap:7}}><span style={{fontSize:15}}>{t.i}</span><span style={{fontSize:13.5,color:"var(--mist)",fontWeight:500}}>{t.t}</span></div>
            ))}</div></FadeUp>
        </div>
        <FadeUp delay={200} style={{marginTop:64}}>
          <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
            {cards.map((c,i)=>(
              <div key={i} style={{flex:"0 0 210px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",padding:20,cursor:"pointer",transition:"transform .2s,box-shadow .2s"}} onClick={()=>onNavigate("app")}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(26,22,18,.09)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                <div style={{width:46,height:46,borderRadius:12,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:12}}>{c.emoji}</div>
                <p style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:3,lineHeight:1.3}}>{c.name}</p>
                <p style={{fontSize:12,color:"var(--mist)",marginBottom:8}}>{c.price}</p>
                <span style={{fontSize:11,fontWeight:600,color:"var(--accent)",background:"var(--accent2)",borderRadius:50,padding:"2px 9px"}}>{c.tag}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function SocialProofBar() {
  const p=[{n:"Amazon India",c:"#ff9900",i:"a"},{n:"Flipkart",c:"#2874f0",i:"F"},{n:"Myntra",c:"#ff3f6c",i:"M"},{n:"Coursera",c:"#0056d2",i:"C"},{n:"Udemy",c:"#a435f0",i:"U"},{n:"Google Shopping",c:"#34a853",i:"G"}];
  return (
    <section className="section-sm" style={{borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:"var(--surface)"}}>
      <div className="lp-container"><FadeUp>
        <p style={{textAlign:"center",fontSize:12,fontWeight:600,color:"var(--mist)",marginBottom:28,letterSpacing:"0.1em",textTransform:"uppercase"}}>Shop seamlessly across</p>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"clamp(14px,4vw,36px)",flexWrap:"wrap"}}>
          {p.map(x=><div key={x.n} style={{display:"flex",alignItems:"center",gap:7,opacity:.7,transition:"opacity .2s",cursor:"default"}} onMouseEnter={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="0.7"}>
            <div style={{width:28,height:28,borderRadius:7,background:x.c,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",fontWeight:900,fontSize:13,color:"#fff"}}>{x.i}</div>
            <span style={{fontSize:13.5,fontWeight:600,color:"var(--stone)"}}>{x.n}</span>
          </div>)}
        </div>
      </FadeUp></div>
    </section>
  );
}

function FeaturesSection() {
  const f=[
    {icon:"🌍",title:"Every Occasion, Covered",body:"Birthdays, weddings, anniversaries, Diwali, Christmas, or a heartfelt 'Just Because' — Giftlair knows the occasion and makes it count.",bg:"#e8f0fc"},
    {icon:"₹",title:"Smart Budget Filtering",body:"Set your range in Indian Rupees and instantly see the best value options — from thoughtful ₹500 picks to ₹50,000+ luxury statements.",bg:"#fdf0e8"},
    {icon:"⚡",title:"Fast, Available & Deliverable",body:"Every recommendation is in-stock, popularly rated, and ships to India. No chasing unavailable products or dead links.",bg:"#e8f8f0"},
    {icon:"🧠",title:"Curated by AI, Felt by Heart",body:"Our AI reads the relationship, the occasion, and their interests to surface gifts that feel personally chosen — not algorithmically generic.",bg:"#f0eaf8"},
    {icon:"🔗",title:"Multi-Platform Shopping",body:"Every gift links to Amazon, Flipkart, Myntra, Coursera, or Google Shopping — so you always buy where you're most comfortable.",bg:"#f5f0e8"},
    {icon:"🔒",title:"No Credit Card. Ever.",body:"Giftlair is completely free — no paywalls, no hidden fees, no subscription traps. Create a free account to save your favourite finds.",bg:"#e8f8f8"},
  ];
  return (
    <section className="section" id="features" style={{background:"var(--cream)"}}>
      <div className="lp-container">
        <FadeUp><div style={{textAlign:"center",marginBottom:60}}>
          <p className="label" style={{marginBottom:14}}>Why Giftlair</p>
          <h2 className="display" style={{fontSize:"clamp(36px,5vw,56px)",color:"var(--ink)",marginBottom:16}}>Gifting, <span className="display-strong" style={{fontStyle:"italic"}}>reimagined.</span></h2>
          <p style={{fontSize:17,color:"var(--mist)",maxWidth:440,margin:"0 auto",lineHeight:1.65}}>Everything you need to nail the gift. Nothing you don't.</p>
        </div></FadeUp>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(305px,1fr))",gap:18}}>
          {f.map((x,i)=><FadeUp key={x.title} delay={i*55}><div className="lp-card" style={{height:"100%"}}>
            <div style={{width:50,height:50,borderRadius:13,background:x.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,marginBottom:16}}>{x.icon}</div>
            <h3 style={{fontSize:16.5,fontWeight:600,color:"var(--ink)",marginBottom:9,lineHeight:1.3}}>{x.title}</h3>
            <p style={{fontSize:14,color:"var(--mist)",lineHeight:1.72}}>{x.body}</p>
          </div></FadeUp>)}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection({onNavigate}) {
  const steps=[
    {num:"01",icon:"✍️",title:"Tell us about them",body:"Choose the occasion, your relationship, their interests, and your budget. Takes under 20 seconds.",border:"rgba(212,96,58,.2)",bg:"var(--accent2)"},
    {num:"02",icon:"🧠",title:"AI does the thinking",body:"Our recommendation engine analyses trends, reviews, and personalisation signals to curate a shortlist just for them.",border:"rgba(40,116,240,.18)",bg:"#e8f0fc"},
    {num:"03",icon:"🎁",title:"Shop in one click",body:"Every result links to Amazon, Flipkart, Myntra, Coursera, and more — buy instantly and impress effortlessly.",border:"rgba(30,160,100,.18)",bg:"#e8f8f0"},
  ];
  return (
    <section className="section" id="how-it-works" style={{background:"var(--surface)",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
      <div className="lp-container">
        <FadeUp><div style={{textAlign:"center",marginBottom:60}}>
          <p className="label" style={{marginBottom:14}}>The Process</p>
          <h2 className="display" style={{fontSize:"clamp(36px,5vw,56px)",color:"var(--ink)",marginBottom:14}}>
            From blank page to{" "}<span className="display-strong" style={{fontStyle:"italic",color:"var(--accent)"}}>perfect gift</span>{" "}in three steps.
          </h2>
        </div></FadeUp>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(275px,1fr))",gap:22}}>
          {steps.map((s,i)=><FadeUp key={s.num} delay={i*90}><div style={{background:"var(--cream)",border:`1px solid ${s.border}`,borderRadius:"var(--r-lg)",padding:"30px 26px",transition:"transform .22s,box-shadow .22s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 14px 44px rgba(26,22,18,.07)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
              <div style={{width:50,height:50,borderRadius:13,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{s.icon}</div>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:300,color:"var(--border)",lineHeight:1}}>{s.num}</span>
            </div>
            <h3 style={{fontSize:17,fontWeight:600,color:"var(--ink)",marginBottom:10}}>{s.title}</h3>
            <p style={{fontSize:14,color:"var(--mist)",lineHeight:1.7}}>{s.body}</p>
          </div></FadeUp>)}
        </div>
        <FadeUp delay={280}><div style={{textAlign:"center",marginTop:52}}><button className="btn-primary" onClick={()=>onNavigate("app")} style={{fontSize:15.5,padding:"14px 38px"}}>Try it now — it's free →</button></div></FadeUp>
      </div>
    </section>
  );
}

function MidCTASection({onNavigate}) {
  return (
    <section style={{padding:"80px 0",background:"var(--ink)"}}>
      <div className="lp-container"><FadeUp><div style={{textAlign:"center",maxWidth:620,margin:"0 auto"}}>
        <p className="label" style={{color:"var(--gold)",marginBottom:20}}>Make gifting effortless</p>
        <h2 className="display" style={{fontSize:"clamp(34px,5vw,58px)",color:"#faf8f4",marginBottom:18}}>
          The gift that says{" "}<span className="display-strong" style={{fontStyle:"italic",color:"var(--gold)"}}>«I know you.»</span>
        </h2>
        <p style={{fontSize:16,color:"rgba(250,248,244,.5)",lineHeight:1.72,marginBottom:38}}>Stop spending hours scrolling. In under a minute, Giftlair finds something they'll actually love.</p>
        <button className="btn-primary" onClick={()=>onNavigate("app")} style={{fontSize:15.5,padding:"14px 36px"}}>Start Finding Gifts →</button>
      </div></FadeUp></div>
    </section>
  );
}

function FAQSection() {
  const [open,setOpen]=useState(null);
  const faqs=[
    {q:"How does the AI Gift Finder actually work?",a:"You tell us who the gift is for, the occasion, and your budget. Our AI matches those inputs against a curated database of trending, highly-rated products — then ranks them by relevance, availability, and value. The whole process takes under 30 seconds."},
    {q:"What makes a good White Elephant or Secret Santa gift?",a:"White Elephant gifts work best when they're fun, useful, and broadly appealing — think candle sets, quirky gadgets, artisan food boxes, or stylish notebooks. Set your budget to under ₹1,500 and filter for 'Budget-friendly' to find crowd-pleasing picks."},
    {q:"Can I shop from multiple platforms?",a:"Absolutely. Every recommendation includes links to Amazon India, Flipkart, Myntra, Coursera, Udemy, and Google Shopping — you choose where to buy."},
    {q:"Is Giftlair really free? Any catches?",a:"100% free. No credit card, no subscription, no pop-up ads. Create a free account to save gift ideas, but even that's optional."},
    {q:"How do I save my favourite gifts?",a:"Sign in with Google or create an email account, then tap the heart ❤️ on any gift card. Your saved list is tied to your account and syncs automatically."},
  ];
  return (
    <section className="section" id="faq" style={{background:"var(--surface)",borderTop:"1px solid var(--border)"}}>
      <div className="lp-container">
        <FadeUp><div style={{textAlign:"center",marginBottom:56}}>
          <p className="label" style={{marginBottom:14}}>Got questions?</p>
          <h2 className="display" style={{fontSize:"clamp(34px,5vw,54px)",color:"var(--ink)"}}>Frequently asked.</h2>
        </div></FadeUp>
        <div style={{maxWidth:700,margin:"0 auto",display:"flex",flexDirection:"column",gap:6}}>
          {faqs.map((f,i)=><FadeUp key={i} delay={i*45}>
            <div style={{border:"1px solid",borderColor:open===i?"rgba(212,96,58,.3)":"var(--border)",borderRadius:"var(--r-md)",overflow:"hidden",background:open===i?"rgba(245,230,222,.22)":"var(--surface)",transition:"border-color .2s,background .2s"}}>
              <button onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"19px 22px",background:"none",border:"none",cursor:"pointer",textAlign:"left",gap:14}}>
                <span style={{fontSize:15.5,fontWeight:600,color:"var(--ink)",lineHeight:1.4}}>{f.q}</span>
                <span style={{width:26,height:26,borderRadius:"50%",background:open===i?"var(--accent)":"var(--accent2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:open===i?"#fff":"var(--accent)",flexShrink:0,transition:"background .2s,transform .25s",transform:open===i?"rotate(45deg)":"rotate(0deg)"}}>+</span>
              </button>
              {open===i&&<div style={{padding:"0 22px 18px"}}><p style={{fontSize:14.5,color:"var(--mist)",lineHeight:1.75}}>{f.a}</p></div>}
            </div>
          </FadeUp>)}
        </div>
      </div>
    </section>
  );
}

function BottomCTASection({onNavigate}) {
  return (
    <section style={{padding:"88px 0 72px",background:"var(--cream)",borderTop:"1px solid var(--border)"}}>
      <div className="lp-container"><FadeUp>
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r-xl)",padding:"clamp(38px,6vw,68px)",textAlign:"center",maxWidth:740,margin:"0 auto",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"-30%",left:"50%",transform:"translateX(-50%)",width:480,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,96,58,.06) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <span style={{fontSize:38,display:"block",marginBottom:18}}>🎁</span>
          <p className="label" style={{marginBottom:16}}>Ready to impress?</p>
          <h2 className="display" style={{fontSize:"clamp(30px,5vw,54px)",color:"var(--ink)",marginBottom:18,lineHeight:1.08}}>
            Your next great gift is{" "}<span className="display-strong" style={{fontStyle:"italic",color:"var(--accent)"}}>one click away.</span>
          </h2>
          <p style={{fontSize:15.5,color:"var(--mist)",lineHeight:1.72,maxWidth:460,margin:"0 auto 36px"}}>Join thousands of thoughtful gifters in India. No guessing, no stress — just the right gift, every time.</p>
          <button className="btn-primary" onClick={()=>onNavigate("app")} style={{fontSize:16,padding:"14px 40px"}}>Find the Perfect Gift — Free →</button>
          <p style={{fontSize:12.5,color:"var(--mist)",marginTop:18}}>No account required · Ships to India · Prices in ₹</p>
        </div>
      </FadeUp></div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer style={{background:"var(--ink)",padding:"50px 0 30px"}}>
      <div className="lp-container">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:28,marginBottom:44}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><span style={{fontSize:19}}>🎁</span><span className="display" style={{fontSize:19,color:"#faf8f4",fontWeight:600}}>Giftlair</span></div>
            <p style={{fontSize:13.5,color:"rgba(250,248,244,.38)",lineHeight:1.65,maxWidth:220}}>AI-powered gift recommendations for every occasion and every budget.</p>
          </div>
          {[{h:"Product",l:["Features","How it works","Pricing","Changelog"]},{h:"Support",l:["FAQ","Contact","Privacy Policy","Terms of Use"]}].map(c=>(
            <div key={c.h}>
              <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(250,248,244,.3)",marginBottom:14}}>{c.h}</p>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {c.l.map(x=><a key={x} href="#" style={{fontSize:13.5,color:"rgba(250,248,244,.45)",transition:"color .2s"}} onMouseEnter={e=>e.target.style.color="#faf8f4"} onMouseLeave={e=>e.target.style.color="rgba(250,248,244,.45)"}>{x}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid rgba(250,248,244,.07)",paddingTop:22,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <p style={{fontSize:12.5,color:"rgba(250,248,244,.25)"}}>© 2025 Giftlair. All rights reserved.</p>
          <p style={{fontSize:12.5,color:"rgba(250,248,244,.25)"}}>Made with ❤️ for thoughtful gifters in 🇮🇳 India</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════
// §8  GIFT APP  (dark-themed engine)
// ═══════════════════════════════════════════════════════════════════
function AppStars({rating}) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:1}}>
      {[1,2,3,4,5].map(i=>{const f=Math.min(1,Math.max(0,rating-(i-1)));return(
        <span key={i} style={{position:"relative",fontSize:13,display:"inline-block",width:13,lineHeight:1}}>
          <span style={{color:"rgba(255,255,255,0.15)"}}>★</span>
          <span style={{position:"absolute",top:0,left:0,overflow:"hidden",width:`${f*100}%`,color:"#ff9900",whiteSpace:"nowrap"}}>★</span>
        </span>);})}
    </span>
  );
}

function AppProductImage({gift}) {
  const [st,setSt]=useState("loading");
  const cc={Personalized:"#e8a87c",Luxury:"#c084fc","Budget-friendly":"#6ee7b7",Unique:"#60a5fa"}[gift.cat]||"#aaa";
  return (
    <div style={{position:"relative",width:"100%",height:172,background:"rgba(255,255,255,0.04)",borderRadius:"16px 16px 0 0",overflow:"hidden",flexShrink:0}}>
      {st==="loading"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>}
      {st==="error"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:44}}>{gift.emoji}</span></div>}
      {st!=="error"&&<img src={productImageUrl(gift.imgKw,gift.id)} alt={gift.name} onLoad={()=>setSt("loaded")} onError={()=>setSt("error")} style={{width:"100%",height:"100%",objectFit:"cover",opacity:st==="loaded"?1:0,transition:"opacity 0.4s"}}/>}
      <div style={{position:"absolute",top:8,left:8}}><span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",color:cc,background:`${cc}22`,backdropFilter:"blur(8px)",padding:"3px 8px",borderRadius:20,border:`1px solid ${cc}44`}}>{gift.cat}</span></div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:52,background:"linear-gradient(to top,rgba(15,10,16,0.95),transparent)"}}/>
    </div>
  );
}

function AppVendorBtn({vkey,giftName}) {
  const m=VENDOR_META[vkey]; if(!m) return null;
  return <a href={vendorFns[vkey](giftName)} target="_blank" rel="noopener noreferrer"
    style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,textDecoration:"none",padding:"4px 10px",borderRadius:14,background:m.bg,color:m.tc,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",transition:"opacity .15s,transform .15s"}}
    onMouseEnter={e=>{e.currentTarget.style.opacity="0.8";e.currentTarget.style.transform="scale(1.06)";}}
    onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="scale(1)";}}>
    <span style={{fontWeight:900,fontSize:12,fontFamily:"Georgia,serif"}}>{m.icon}</span>{m.label}
  </a>;
}

function AppGiftCard({gift,isFav,onToggleFav,isLoggedIn,onFavNoAuth}) {
  const fmtR=n=>n>=1000?`${(n/1000).toFixed(1)}k`:n;
  const allV=gift.v.includes("google")?gift.v:[...gift.v,"google"];
  const cc={Personalized:"#e8a87c",Luxury:"#c084fc","Budget-friendly":"#6ee7b7",Unique:"#60a5fa"}[gift.cat]||"#aaa";
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:18,display:"flex",flexDirection:"column",backdropFilter:"blur(12px)",transition:"transform .22s,box-shadow .22s",position:"relative",overflow:"hidden"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 20px 48px rgba(0,0,0,0.4)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
      <AppProductImage gift={gift}/>
      <button onClick={()=>isLoggedIn?onToggleFav(gift.id):onFavNoAuth()} style={{position:"absolute",top:8,right:8,background:"rgba(15,10,16,0.65)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,transition:"transform .15s",opacity:isFav?1:0.6}} title={isLoggedIn?(isFav?"Remove from saved":"Save gift"):"Login to save gifts"}>
        {isFav?"❤️":"🤍"}
      </button>
      <div style={{padding:"13px 15px 15px",display:"flex",flexDirection:"column",gap:8,flexGrow:1}}>
        <h3 style={{margin:0,fontSize:14.5,fontWeight:700,color:"#f0ece4",fontFamily:"'Playfair Display',serif",lineHeight:1.3}}>{gift.name}</h3>
        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
          <AppStars rating={gift.r}/>
          <span style={{fontSize:12.5,fontWeight:700,color:"#ff9900"}}>{gift.r}</span>
          <span style={{fontSize:11,color:"rgba(240,236,228,0.35)"}}>({fmtR(gift.rv)} reviews)</span>
        </div>
        <p style={{margin:0,fontSize:12.5,color:"rgba(240,236,228,0.57)",lineHeight:1.62,flexGrow:1}}>{gift.desc}</p>
        <div style={{fontSize:15.5,fontWeight:700,color:"#f0ece4",fontFamily:"'Playfair Display',serif"}}>{gift.price}</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:2}}>{allV.map(v=><AppVendorBtn key={v} vkey={v} giftName={gift.name}/>)}</div>
      </div>
      <div style={{height:3,background:`linear-gradient(90deg,transparent,${cc},transparent)`,opacity:.6}}/>
    </div>
  );
}

function AppSelect({value,onChange,options,placeholder}) {
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:value?"#f0ece4":"rgba(240,236,228,0.35)",fontSize:14,cursor:"pointer",outline:"none",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",fontFamily:"'DM Sans',sans-serif"}}>
    <option value="" disabled style={{background:"#1a1014"}}>{placeholder}</option>
    {options.map(o=><option key={o} value={o} style={{background:"#1a1014"}}>{o}</option>)}
  </select>;
}

function GiftApp({user,demoMode,onNavigate,onAuthOpen,onLogout}) {
  const [occasion,setOccasion]=useState(""); const [relationship,setRelationship]=useState("");
  const [budget,setBudget]=useState([500,10000]); const [interests,setInterests]=useState(""); const [gender,setGender]=useState("Any");
  const [gifts,setGifts]=useState([]); const [loading,setLoading]=useState(false); const [hasSearched,setHasSearched]=useState(false);
  const [filterCat,setFilterCat]=useState("All"); const [filterMax,setFilterMax]=useState(60000); const [showFavs,setShowFavs]=useState(false);
  const [toast,setToast]=useState("");

  const [favs,setFavsState]=useState(()=>user?getUserFavs(user.uid):[]);
  const setFavs=useCallback(upd=>{setFavsState(prev=>{const next=typeof upd==="function"?upd(prev):upd;if(user)saveUserFavs(user.uid,next);return next;});});
  useEffect(()=>{if(user)setFavsState(getUserFavs(user.uid));else setFavsState([]);},[user]);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),3000);};

  const runGen=useCallback(p=>{setLoading(true);setHasSearched(true);setFilterCat("All");setTimeout(()=>{setGifts(generateGifts(p));setLoading(false);},1400);},[]);
  const handleGen=useCallback(()=>{if(!occasion||!relationship)return;runGen({occasion,relationship,budget,interests,gender});},[occasion,relationship,budget,interests,gender,runGen]);
  const handleSurp=useCallback(()=>{
    const o=OCCASIONS[Math.floor(Math.random()*OCCASIONS.length)],r=RELATIONSHIPS[Math.floor(Math.random()*RELATIONSHIPS.length)];
    const b=BUDGET_PRESETS[Math.floor(Math.random()*BUDGET_PRESETS.length)].range,g=GENDERS[Math.floor(Math.random()*GENDERS.length)];
    setOccasion(o);setRelationship(r);setBudget(b);setGender(g);setInterests("");
    runGen({occasion:o,relationship:r,budget:b,interests:"",gender:g});
  },[runGen]);

  const fmt=n=>"₹"+n.toLocaleString("en-IN");
  const filtered=gifts.filter(g=>(filterCat==="All"||g.cat===filterCat)&&g.minB<=filterMax);
  const favGifts=GIFT_POOL.filter(g=>favs.includes(g.id));
  const canGo=!!(occasion&&relationship);
  const lSt={display:"block",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"#e8a87c",marginBottom:7,fontWeight:600};
  const gSt={padding:"11px 20px",borderRadius:50,fontSize:13.5,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.06)",color:"#f0ece4",border:"1px solid rgba(255,255,255,0.14)",fontFamily:"'DM Sans',sans-serif",transition:"background .2s"};

  return (
    <div style={{minHeight:"100vh",background:"#0f0a10",backgroundImage:"radial-gradient(ellipse 60% 40% at 20% 10%,rgba(200,120,80,0.13) 0%,transparent 70%),radial-gradient(ellipse 50% 35% at 80% 90%,rgba(140,70,200,0.12) 0%,transparent 70%)",fontFamily:"'DM Sans',sans-serif",color:"#f0ece4",paddingBottom:80}}>

      {/* Topbar */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(15,10,16,0.88)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{maxWidth:1150,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <button onClick={()=>onNavigate("landing")} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:"6px 12px",borderRadius:50,color:"rgba(240,236,228,0.6)",fontSize:13.5,fontWeight:500,fontFamily:"'DM Sans',sans-serif",transition:"background .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
            ← Home
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>🎁</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15,background:"linear-gradient(90deg,#f0ece4,#e8a87c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Giftlair</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user ? (
              <>
                {user.photoURL
                  ? <img src={user.photoURL} style={{width:30,height:30,borderRadius:"50%",objectFit:"cover"}} alt="avatar"/>
                  : <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#e8a87c,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#0f0a10"}}>{user.avatar}</div>
                }
                <span style={{fontSize:13,color:"rgba(240,236,228,0.7)",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
                <button onClick={onLogout} style={{padding:"5px 13px",borderRadius:50,fontSize:12,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.06)",color:"rgba(240,236,228,0.6)",border:"1px solid rgba(255,255,255,0.12)",fontFamily:"'DM Sans',sans-serif"}}>Sign Out</button>
              </>
            ):(
              <button onClick={onAuthOpen} style={{padding:"8px 18px",borderRadius:50,fontSize:13,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",border:"none",fontFamily:"'DM Sans',sans-serif"}}>Sign In</button>
            )}
          </div>
        </div>
      </div>

      {toast&&<div style={{position:"fixed",top:66,left:"50%",transform:"translateX(-50%)",background:"rgba(232,168,124,0.15)",border:"1px solid rgba(232,168,124,0.4)",backdropFilter:"blur(12px)",padding:"9px 20px",borderRadius:30,fontSize:14,fontWeight:600,color:"#e8a87c",zIndex:300,whiteSpace:"nowrap",animation:"slideDown .3s ease"}}>{toast}</div>}

      {/* Demo mode banner */}
      {demoMode&&<div style={{background:"rgba(201,169,110,0.1)",borderBottom:"1px solid rgba(201,169,110,0.25)",padding:"10px 20px",textAlign:"center"}}>
        <span style={{fontSize:12.5,color:"rgba(201,169,110,0.8)"}}>⚠️ <strong>Demo mode</strong> — auth is localStorage-only. Add your Firebase config in §2 to enable real Google OAuth &amp; email verification.</span>
      </div>}

      <header style={{textAlign:"center",padding:"40px 24px 22px"}}>
        <div style={{fontSize:11.5,letterSpacing:"0.22em",textTransform:"uppercase",color:"#e8a87c",marginBottom:12,fontWeight:600}}>✦ Personalised Gift Discovery — India ✦</div>
        <h1 style={{margin:0,fontSize:"clamp(28px,5vw,52px)",fontFamily:"'Playfair Display',serif",fontWeight:700,lineHeight:1.1,background:"linear-gradient(135deg,#f0ece4 30%,#e8a87c 58%,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Find the Perfect Gift</h1>
        <p style={{margin:"11px auto 0",maxWidth:500,color:"rgba(240,236,228,0.43)",fontSize:14,lineHeight:1.8}}>
          Shop across <span style={{color:"#ff9900",fontWeight:600}}>Amazon</span>, <span style={{color:"#2874f0",fontWeight:600}}>Flipkart</span>, <span style={{color:"#ff3f6c",fontWeight:600}}>Myntra</span>, <span style={{color:"#0056d2",fontWeight:600}}>Coursera</span> &amp; <span style={{color:"#34a853",fontWeight:600}}>Google Shopping</span>.
          {!user&&<span> <button onClick={onAuthOpen} style={{background:"none",border:"none",color:"#e8a87c",cursor:"pointer",fontWeight:600,fontSize:14,textDecoration:"underline"}}>Sign in</button> to save favourites.</span>}
        </p>
      </header>

      <main style={{maxWidth:1150,margin:"0 auto",padding:"0 20px"}}>
        {/* Form */}
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:28,padding:"26px 26px 22px",marginBottom:26,backdropFilter:"blur(20px)"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:13}}>
            <div><label style={lSt}>Occasion *</label><AppSelect value={occasion} onChange={setOccasion} options={OCCASIONS} placeholder="Select occasion"/></div>
            <div><label style={lSt}>Relationship *</label><AppSelect value={relationship} onChange={setRelationship} options={RELATIONSHIPS} placeholder="Select relationship"/></div>
            <div><label style={lSt}>Gender</label><AppSelect value={gender} onChange={setGender} options={GENDERS} placeholder="Any"/></div>
            <div><label style={lSt}>Interests</label><input type="text" placeholder="e.g. cooking, music, tech" value={interests} onChange={e=>setInterests(e.target.value)} style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"#f0ece4",fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/></div>
          </div>
          <div style={{marginTop:18}}>
            <label style={lSt}>Budget Range</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
              {BUDGET_PRESETS.map(p=>{const a=budget[0]===p.range[0]&&budget[1]===p.range[1];return <button key={p.label} onClick={()=>setBudget(p.range)} style={{padding:"5px 13px",borderRadius:50,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid",fontFamily:"'DM Sans',sans-serif",borderColor:a?"#e8a87c":"rgba(255,255,255,0.14)",background:a?"rgba(232,168,124,0.15)":"transparent",color:a?"#e8a87c":"rgba(240,236,228,0.5)",transition:"all .15s"}}>{p.label}</button>;})}
            </div>
            <div style={{maxWidth:420}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#e8a87c",fontWeight:600,marginBottom:6}}><span>{fmt(budget[0])}</span><span>{fmt(budget[1])}</span></div>
              <div style={{position:"relative",height:28,display:"flex",alignItems:"center"}}>
                <div style={{position:"absolute",left:0,right:0,height:4,background:"rgba(255,255,255,0.12)",borderRadius:4}}/>
                <div style={{position:"absolute",left:`${(budget[0]/60000)*100}%`,right:`${100-(budget[1]/60000)*100}%`,height:4,background:"linear-gradient(90deg,#e8a87c,#c084fc)",borderRadius:4}}/>
                <input type="range" min={0} max={60000} step={500} value={budget[0]} onChange={e=>{const v=+e.target.value;if(v<budget[1]-1000)setBudget([v,budget[1]]);}} style={{position:"absolute",width:"100%",appearance:"none",background:"transparent",zIndex:2,cursor:"pointer",height:0}}/>
                <input type="range" min={0} max={60000} step={500} value={budget[1]} onChange={e=>{const v=+e.target.value;if(v>budget[0]+1000)setBudget([budget[0],v]);}} style={{position:"absolute",width:"100%",appearance:"none",background:"transparent",zIndex:2,cursor:"pointer",height:0}}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:20,flexWrap:"wrap"}}>
            <button onClick={handleGen} disabled={!canGo||loading} style={{padding:"11px 28px",borderRadius:50,fontSize:14,fontWeight:700,cursor:canGo?"pointer":"not-allowed",background:canGo?"linear-gradient(135deg,#e8a87c,#c084fc)":"rgba(255,255,255,0.07)",color:canGo?"#0f0a10":"rgba(240,236,228,0.25)",border:"none",transition:"transform .15s",fontFamily:"'DM Sans',sans-serif"}}
              onMouseEnter={e=>{if(canGo)e.currentTarget.style.transform="scale(1.03)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>
              {loading?"Generating…":"✨ Find Gifts"}
            </button>
            <button onClick={handleSurp} disabled={loading} style={gSt} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.11)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>🎲 Surprise Me</button>
            <button onClick={()=>{if(!user){onAuthOpen();return;}setShowFavs(v=>!v);}} style={{...gSt,background:showFavs?"rgba(232,168,124,0.13)":"rgba(255,255,255,0.06)",color:showFavs?"#e8a87c":"#f0ece4",borderColor:showFavs?"#e8a87c55":"rgba(255,255,255,0.14)"}}>❤️ Saved ({favs.length})</button>
          </div>
        </div>

        {showFavs&&user&&<div style={{marginBottom:26}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:21,marginBottom:18,color:"#e8a87c"}}>❤️ {user.name.split(" ")[0]}'s Saved Gifts</h2>
          {favGifts.length===0?<p style={{color:"rgba(240,236,228,0.38)",fontSize:14}}>No saved gifts yet — heart any gift to save it here.</p>
            :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))",gap:20}}>
              {favGifts.map(g=><AppGiftCard key={g.id} gift={g} isFav isLoggedIn={!!user} onToggleFav={id=>setFavs(p=>p.filter(f=>f!==id))} onFavNoAuth={onAuthOpen}/>)}
            </div>}
          <div style={{margin:"20px 0",height:1,background:"rgba(255,255,255,0.07)"}}/>
        </div>}

        {loading&&<div style={{textAlign:"center",padding:"52px 0"}}>
          <div style={{width:44,height:44,border:"3px solid rgba(255,255,255,0.1)",borderTop:"3px solid #e8a87c",borderRadius:"50%",animation:"spin .9s linear infinite",margin:"0 auto 16px"}}/>
          <p style={{color:"rgba(240,236,228,0.45)",animation:"pulse 1.5s infinite",fontSize:14}}>Curating the perfect gifts…</p>
        </div>}

        {!loading&&hasSearched&&gifts.length>0&&<>
          <div style={{display:"flex",gap:7,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:11,color:"rgba(240,236,228,0.35)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Filter:</span>
            {CATEGORIES.map(cat=><button key={cat} onClick={()=>setFilterCat(cat)} style={{padding:"5px 14px",borderRadius:50,fontSize:12.5,fontWeight:600,cursor:"pointer",border:"1px solid",borderColor:filterCat===cat?"#e8a87c":"rgba(255,255,255,0.11)",background:filterCat===cat?"rgba(232,168,124,0.14)":"transparent",color:filterCat===cat?"#e8a87c":"rgba(240,236,228,0.5)",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>{cat}</button>)}
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"rgba(240,236,228,0.35)"}}>Max {fmt(filterMax)}</span>
              <input type="range" min={500} max={60000} step={500} value={filterMax} onChange={e=>setFilterMax(+e.target.value)} style={{width:86,appearance:"none",background:"rgba(255,255,255,0.12)",height:4,borderRadius:4,cursor:"pointer"}}/>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,margin:0}}>
              {filtered.length} Gift{filtered.length!==1?"s":""} Found
              <span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:400,color:"rgba(240,236,228,0.38)",marginLeft:10}}>for {relationship} · {occasion} · {fmt(budget[0])}–{fmt(budget[1])}</span>
            </h2>
          </div>
          {filtered.length===0?<p style={{color:"rgba(240,236,228,0.38)",textAlign:"center",padding:40}}>No gifts match this filter.</p>
            :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(298px,1fr))",gap:22}}>
              {filtered.map((g,i)=><div key={g.id} className="gc-anim" style={{animationDelay:`${i*55}ms`}}>
                <AppGiftCard gift={g} isFav={favs.includes(g.id)} isLoggedIn={!!user} onToggleFav={id=>setFavs(p=>p.includes(id)?p.filter(f=>f!==id):[...p,id])} onFavNoAuth={onAuthOpen}/>
              </div>)}
            </div>}
        </>}

        {!loading&&!hasSearched&&<div style={{textAlign:"center",padding:"50px 20px",opacity:.35}}>
          <div style={{fontSize:46,marginBottom:13}}>🎁</div>
          <p style={{fontSize:14.5}}>Fill in the occasion & relationship above to discover gifts</p>
        </div>}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// §9  ROOT  —  AUTH ORCHESTRATOR + ROUTER
// ═══════════════════════════════════════════════════════════════════
export default function GiftlairApp() {
  const [user,      setUser]      = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [demoMode,  setDemoMode]  = useState(!FIREBASE_READY);
  const [route,     setRoute]     = useState("landing");
  const [animCls,   setAnimCls]   = useState("");
  const [showAuth,  setShowAuth]  = useState(false);

  // Load Firebase SDK and wire onAuthStateChanged
  useEffect(() => {
    if (!FIREBASE_READY) {
      // Demo mode: restore session from localStorage
      const saved = getDemoSess();
      if (saved) setUser(saved);
      setAuthReady(true);
      return;
    }
    loadFirebase().then(ok => {
      if (!ok) { setDemoMode(true); setAuthReady(true); return; }
      const unsub = fbOnAuthStateChanged(fbUser => {
        setUser(fbUser ? normalizeUser(fbUser) : null);
        setAuthReady(true);
      });
      return () => unsub();
    });
  }, []);

  const handleAuth = useCallback(u => {
    setUser(u);
    if (demoMode) saveDemoSess(u);
    setShowAuth(false);
  }, [demoMode]);

  const handleLogout = useCallback(async () => {
    if (!demoMode && fbSignOut) await fbSignOut();
    clearDemoSess();
    setUser(null);
  }, [demoMode]);

  const navigate = useCallback(dest => {
    if (dest === route) return;
    setAnimCls(dest === "app" ? "page-enter-app" : "page-enter-landing");
    setRoute(dest);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);

  // Loading screen while Firebase initialises
  if (!authReady) return (
    <div style={{minHeight:"100vh",background:"#0f0a10",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{width:44,height:44,border:"3px solid rgba(255,255,255,0.1)",borderTop:"3px solid #e8a87c",borderRadius:"50%",animation:"spin .9s linear infinite"}}/>
      <p style={{color:"rgba(240,236,228,0.4)",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Loading Giftlair…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth} demoMode={demoMode}/>}

      <div key={route} className={`page ${animCls}`} onAnimationEnd={()=>setAnimCls("")}>
        {route === "landing" ? (
          <>
            <LandingNav onNavigate={navigate} user={user} onLogout={handleLogout} onAuthOpen={()=>setShowAuth(true)}/>
            <main>
              <HeroSection onNavigate={navigate}/>
              <SocialProofBar/>
              <FeaturesSection/>
              <HowItWorksSection onNavigate={navigate}/>
              <MidCTASection onNavigate={navigate}/>
              <FAQSection/>
              <BottomCTASection onNavigate={navigate}/>
            </main>
            <LandingFooter/>
          </>
        ) : (
          <GiftApp user={user} demoMode={demoMode} onNavigate={navigate} onAuthOpen={()=>setShowAuth(true)} onLogout={handleLogout}/>
        )}
      </div>
    </>
  );
}
