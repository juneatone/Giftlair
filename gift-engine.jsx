/**
 * 🎁 Gift Recommendation Engine — India Edition v4
 *
 * NEW IN THIS VERSION:
 * ─────────────────────────────────────────────────────────────
 * 1. AUTH SYSTEM
 *    • Register / Login with email + password (localStorage-based)
 *    • SSO: Google, GitHub, Facebook (simulated OAuth flow — swap
 *      each handler with real OAuth redirect in production)
 *    • Per-user Saved list — each account gets its own favorites
 *    • Persistent session (auto-login on refresh)
 *
 * 2. SMART VENDOR ROUTING
 *    • Each product has a curated vendor list: amazon, flipkart,
 *      myntra, coursera, google-shopping
 *    • Coursera linked for all learning/education gifts
 *    • Google Shopping as universal fallback for every product
 *    • Products show only the vendors that make sense for them
 *
 * 3. PRODUCT IMAGES & RATINGS (unchanged from v3)
 *    • Unsplash free images keyed by product keyword
 *    • Curated realistic Amazon India ratings + review counts
 *
 * UPGRADE PATHS:
 *    Auth     → Firebase Auth / Supabase / Auth0 (drop-in replace)
 *    SSO      → Google OAuth2, GitHub OAuth App, Facebook Login SDK
 *    Images   → Amazon PA API v5 Images.Primary.Large.URL
 *    Ratings  → Amazon PA API v5 CustomerReviews
 *    Shopping → Google Custom Search API (shopping results)
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── VENDOR LINK BUILDERS ────────────────────────────────────────────────────
const vendors = {
  amazon:   name => `https://www.amazon.in/s?k=${encodeURIComponent(name + " india")}`,
  flipkart: name => `https://www.flipkart.com/search?q=${encodeURIComponent(name)}`,
  myntra:   name => `https://www.myntra.com/${encodeURIComponent(name.toLowerCase().replace(/\s+/g,"-"))}`,
  coursera: name => `https://www.coursera.org/search?query=${encodeURIComponent(name)}`,
  udemy:    name => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(name)}`,
  google:   name => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(name + " india buy online")}`,
};

const VENDOR_META = {
  amazon:   { label:"Amazon",   color:"#ff9900", bg:"#ff9900", textColor:"#111", icon:"a" },
  flipkart: { label:"Flipkart", color:"#2874f0", bg:"#2874f0", textColor:"#fff", icon:"F" },
  myntra:   { label:"Myntra",   color:"#ff3f6c", bg:"#ff3f6c", textColor:"#fff", icon:"M" },
  coursera: { label:"Coursera", color:"#0056d2", bg:"#0056d2", textColor:"#fff", icon:"C" },
  udemy:    { label:"Udemy",    color:"#a435f0", bg:"#a435f0", textColor:"#fff", icon:"U" },
  google:   { label:"Google Shopping", color:"#34a853", bg:"#34a853", textColor:"#fff", icon:"G" },
};

// Product image via Unsplash (free, no key)
const productImageUrl = (keyword, id) =>
  `https://source.unsplash.com/400x300/?${encodeURIComponent(keyword)}&sig=${id}`;

// ─── GIFT DATABASE ────────────────────────────────────────────────────────────
// vendors: array of vendor keys — only shown if relevant to that product
// google is always added as fallback in GiftCard
const GIFT_POOL = [
  { id:1,  name:"Custom Star Map Print",          imageKeyword:"night sky stars print",              rating:4.5, reviews:2841,  description:"A beautifully printed map of the night sky on a meaningful date — first date, birthday, or anniversary.", priceRange:"₹3,500–₹6,500",  category:"Personalized",    emoji:"🌌", tags:["romantic","anniversary","birthday","partner","friend"],            minBudget:3500,  vendors:["amazon","flipkart","google"] },
  { id:2,  name:"Monogrammed Leather Wallet",      imageKeyword:"leather wallet brown monogram",      rating:4.3, reviews:5612,  description:"Hand-stitched full-grain leather wallet with initials embossed. Classic and enduring.",                   priceRange:"₹1,800–₹4,500",  category:"Personalized",    emoji:"👛", tags:["birthday","colleague","parent","graduation"],                      minBudget:1800,  vendors:["amazon","flipkart","myntra","google"] },
  { id:3,  name:"Custom Portrait Illustration",    imageKeyword:"watercolor portrait artwork",        rating:4.7, reviews:1203,  description:"A digital artist creates a stylized portrait from a photo — watercolor, cartoon, or oil-paint style.",    priceRange:"₹2,500–₹6,000",  category:"Personalized",    emoji:"🎨", tags:["birthday","anniversary","friend","partner","parent"],              minBudget:2500,  vendors:["google"] },
  { id:4,  name:"Engraved Wooden Jewelry Box",     imageKeyword:"wooden jewelry box engraved",        rating:4.4, reviews:3890,  description:"Velvet-lined wooden jewelry box with a personal message laser-engraved on the lid.",                       priceRange:"₹1,500–₹3,500",  category:"Personalized",    emoji:"💍", tags:["birthday","wedding","anniversary","female","partner"],             minBudget:1500,  vendors:["amazon","flipkart","myntra","google"] },
  { id:5,  name:"Custom Photo Recipe Book",        imageKeyword:"hardcover recipe book kitchen",      rating:4.6, reviews:987,   description:"A hardcover book filled with family recipes, photos, and handwritten notes — printed and bound.",           priceRange:"₹2,200–₹4,000",  category:"Personalized",    emoji:"📖", tags:["parent","grandparent","anniversary","cooking"],                    minBudget:2200,  vendors:["amazon","google"] },
  { id:24, name:"Leather-Bound Journal",           imageKeyword:"leather journal notebook brass",     rating:4.4, reviews:7241,  description:"A thick, deckle-edge journal with a leather cover and brass clasp for the thoughtful writer.",             priceRange:"₹800–₹2,200",    category:"Personalized",    emoji:"📔", tags:["birthday","graduation","friend","writing"],                        minBudget:800,   vendors:["amazon","flipkart","myntra","google"] },
  { id:6,  name:"Sony WH-1000XM5 Headphones",      imageKeyword:"sony noise cancelling headphones",   rating:4.6, reviews:28540, description:"Industry-leading noise cancellation, 30-hour battery, spatial audio and buttery comfort.",                  priceRange:"₹22,000–₹32,000", category:"Luxury",          emoji:"🎧", tags:["birthday","graduation","music","tech","friend","partner","colleague"], minBudget:22000, vendors:["amazon","flipkart","google"] },
  { id:7,  name:"Luxury Spa Day Voucher",          imageKeyword:"luxury spa massage candles",         rating:4.5, reviews:1542,  description:"Full-day spa experience: deep-tissue massage, facial, hydrotherapy. Pure indulgence.",                      priceRange:"₹4,500–₹12,000",  category:"Luxury",          emoji:"🛁", tags:["birthday","anniversary","female","partner","parent","wedding"],    minBudget:4500,  vendors:["google"] },
  { id:8,  name:"Pure Pashmina Shawl",             imageKeyword:"pashmina kashmir shawl wrap",        rating:4.3, reviews:4821,  description:"100% genuine Pashmina from Kashmir, in a classic herringbone weave. Impossibly soft.",                     priceRange:"₹3,500–₹9,000",   category:"Luxury",          emoji:"🧣", tags:["birthday","parent","anniversary","wedding","colleague"],            minBudget:3500,  vendors:["amazon","flipkart","myntra","google"] },
  { id:9,  name:"Premium Wine & Cheese Hamper",    imageKeyword:"wine cheese gift hamper basket",     rating:4.4, reviews:2103,  description:"Three curated imported wines with artisan cheese, crackers, and a crystal decanter.",                       priceRange:"₹4,000–₹9,000",   category:"Luxury",          emoji:"🍷", tags:["anniversary","wedding","colleague","parent","birthday"],            minBudget:4000,  vendors:["amazon","google"] },
  { id:10, name:"Apple Watch Series 9",            imageKeyword:"apple watch smartwatch wrist",       rating:4.7, reviews:51230, description:"Tracks heart rate, sleep, GPS, ECG and crash detection. Stunning always-on Retina display.",               priceRange:"₹35,000–₹55,000", category:"Luxury",          emoji:"⌚", tags:["birthday","graduation","fitness","tech","partner","friend"],       minBudget:35000, vendors:["amazon","flipkart","google"] },
  { id:20, name:"Ergonomic Zero-Gravity Chair",    imageKeyword:"ergonomic recliner chair modern",    rating:4.1, reviews:3201,  description:"Premium recliner that distributes body weight perfectly — the gift of total relaxation.",                  priceRange:"₹12,000–₹25,000", category:"Luxury",          emoji:"🪑", tags:["parent","grandparent","birthday","wellness"],                      minBudget:12000, vendors:["amazon","flipkart","google"] },
  { id:11, name:"Scented Soy Candle Gift Set",     imageKeyword:"soy candle set gift box",            rating:4.5, reviews:8934,  description:"Hand-poured soy candles in three signature scents: sandalwood, fig & amber, ocean rain.",                  priceRange:"₹600–₹1,500",    category:"Budget-friendly", emoji:"🕯️", tags:["birthday","colleague","friend","female","housewarming"],           minBudget:600,   vendors:["amazon","flipkart","myntra","google"] },
  { id:12, name:"Artisan Chocolate Gift Box",      imageKeyword:"chocolate gift box assortment",      rating:4.6, reviews:12450, description:"An assortment of 24 premium chocolates — dark, milk, white, with exotic Indian & Belgian fillings.",       priceRange:"₹500–₹1,800",    category:"Budget-friendly", emoji:"🍫", tags:["birthday","colleague","friend","partner","valentine"],             minBudget:500,   vendors:["amazon","flipkart","google"] },
  { id:13, name:"Succulent Terrarium Kit",         imageKeyword:"succulent plant terrarium ceramic",  rating:4.3, reviews:6712,  description:"A ceramic planter with three mini succulents, volcanic soil, and a tiny bamboo rake.",                     priceRange:"₹600–₹1,500",    category:"Budget-friendly", emoji:"🌵", tags:["birthday","colleague","housewarming","friend"],                    minBudget:600,   vendors:["amazon","flipkart","google"] },
  { id:14, name:"Gourmet Spice Collection",        imageKeyword:"spice jars collection kitchen",      rating:4.4, reviews:4301,  description:"12 rare global & Indian spices in reusable glass jars — Kashmiri saffron, smoked paprika, sumac.",         priceRange:"₹900–₹2,200",    category:"Budget-friendly", emoji:"🌶️", tags:["birthday","parent","friend","cooking","housewarming"],             minBudget:900,   vendors:["amazon","flipkart","google"] },
  { id:15, name:"Kindle Paperwhite",               imageKeyword:"kindle ereader book reading",        rating:4.7, reviews:89023, description:"Glare-free display, IPX8 waterproof, weeks of battery and access to millions of books.",                   priceRange:"₹8,999–₹14,999", category:"Budget-friendly", emoji:"📚", tags:["birthday","friend","parent","graduation","reading"],              minBudget:8999,  vendors:["amazon","flipkart","google"] },
  { id:23, name:"Smart Home Starter Kit",          imageKeyword:"smart home lights speaker bulb",     rating:4.2, reviews:15820, description:"Voice-controlled smart bulbs, smart plug, and mini speaker — transform any room instantly.",               priceRange:"₹2,500–₹5,000",  category:"Budget-friendly", emoji:"💡", tags:["birthday","housewarming","tech","friend","colleague"],             minBudget:2500,  vendors:["amazon","flipkart","google"] },
  { id:16, name:"MasterClass Annual Membership",   imageKeyword:"online learning masterclass education", rating:4.6, reviews:3421, description:"12-month access to 180+ world-class courses in cooking, writing, film, music and more.",              priceRange:"₹7,500–₹15,000", category:"Unique",          emoji:"🎓", tags:["birthday","graduation","friend","partner","colleague","learning"], minBudget:7500,  vendors:["coursera","udemy","google"] },
  { id:17, name:"DNA Ancestry & Health Kit",       imageKeyword:"dna test kit science ancestry",      rating:4.3, reviews:2087,  description:"Discover heritage, health traits, and unexpected family connections through DNA analysis.",                 priceRange:"₹5,000–₹9,000",  category:"Unique",          emoji:"🧬", tags:["birthday","parent","grandparent","friend"],                        minBudget:5000,  vendors:["amazon","google"] },
  { id:18, name:"Hot Air Balloon Flight Jaipur",   imageKeyword:"hot air balloon jaipur sunrise",     rating:4.8, reviews:1243,  description:"A sunrise balloon flight over the Pink City for two, with traditional Rajasthani breakfast after.",        priceRange:"₹12,000–₹18,000", category:"Unique",          emoji:"🎈", tags:["anniversary","birthday","partner","adventure"],                    minBudget:12000, vendors:["google"] },
  { id:19, name:"Single Malt Whisky Tasting Set",  imageKeyword:"whisky tasting set bottles gift",    rating:4.5, reviews:3102,  description:"Six premium single-malt whiskies from Scotland and India's finest distilleries, with a tasting guide.",    priceRange:"₹4,000–₹9,000",  category:"Unique",          emoji:"🥃", tags:["birthday","male","parent","colleague","friend"],                   minBudget:4000,  vendors:["amazon","flipkart","google"] },
  { id:21, name:"Fujifilm Instax Mini Camera",     imageKeyword:"fujifilm instax mini camera polaroid", rating:4.5, reviews:34120, description:"Instant film camera with 10 color films included. Real, tangible memories in seconds.",               priceRange:"₹4,500–₹8,500",  category:"Unique",          emoji:"📷", tags:["birthday","friend","graduation","photography"],                    minBudget:4500,  vendors:["amazon","flipkart","google"] },
  { id:22, name:"Cooking Masterclass for Two",     imageKeyword:"cooking class chef kitchen",         rating:4.7, reviews:891,   description:"A 3-hour hands-on class with a professional chef in Mumbai/Delhi — pasta, sushi, or Indian cuisine.",      priceRange:"₹3,500–₹7,000",  category:"Unique",          emoji:"👨‍🍳", tags:["anniversary","birthday","partner","friend","cooking"],             minBudget:3500,  vendors:["coursera","google"] },
  { id:25, name:"Online Photography Course",       imageKeyword:"photography course camera learn",    rating:4.5, reviews:8320,  description:"Learn professional photography from composition to editing — self-paced, certificate included.",            priceRange:"₹1,200–₹4,500",  category:"Unique",          emoji:"📸", tags:["birthday","friend","graduation","photography","learning"],         minBudget:1200,  vendors:["coursera","udemy","google"] },
  { id:26, name:"Creative Writing Workshop",       imageKeyword:"writing workshop creative desk",     rating:4.4, reviews:3102,  description:"A structured 8-week writing course with expert feedback, for aspiring novelists and bloggers.",             priceRange:"₹2,000–₹6,000",  category:"Unique",          emoji:"✍️", tags:["birthday","graduation","friend","writing","learning"],             minBudget:2000,  vendors:["coursera","udemy","google"] },
];

const CATEGORIES    = ["All","Personalized","Luxury","Budget-friendly","Unique"];
const OCCASIONS     = ["Birthday","Anniversary","Wedding","Graduation","Valentine's Day","Christmas","Housewarming","Baby Shower","Retirement","Just Because"];
const RELATIONSHIPS = ["Partner","Friend","Parent","Sibling","Colleague","Grandparent","Child","Teacher"];
const GENDERS       = ["Any","Female","Male","Non-binary"];
const BUDGET_PRESETS= [
  {label:"Under ₹1K",  range:[0,1000]},
  {label:"₹1K–₹5K",   range:[1000,5000]},
  {label:"₹5K–₹15K",  range:[5000,15000]},
  {label:"₹15K–₹60K", range:[15000,60000]},
];

// ─── AUTH HELPERS (localStorage-based, swap with Firebase/Supabase) ──────────
const AUTH_KEY    = "gift_engine_users_v4";
const SESSION_KEY = "gift_engine_session_v4";
const FAVS_KEY    = uid => `gift_favs_${uid}`;

function getUsers()            { try { return JSON.parse(localStorage.getItem(AUTH_KEY)||"{}"); } catch { return {}; } }
function saveUsers(u)          { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function getSession()          { try { return JSON.parse(localStorage.getItem(SESSION_KEY)||"null"); } catch { return null; } }
function saveSession(u)        { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession()        { localStorage.removeItem(SESSION_KEY); }
function getUserFavs(uid)      { try { return JSON.parse(localStorage.getItem(FAVS_KEY(uid))||"[]"); } catch { return []; } }
function saveUserFavs(uid,f)   { localStorage.setItem(FAVS_KEY(uid), JSON.stringify(f)); }

function registerUser({ name, email, password }) {
  const users = getUsers();
  if (users[email]) return { error:"An account with this email already exists." };
  const uid = "u_" + Date.now();
  users[email] = { uid, name, email, password, avatar: name[0].toUpperCase(), createdAt: new Date().toISOString() };
  saveUsers(users);
  return { user: users[email] };
}
function loginUser({ email, password }) {
  const users = getUsers();
  const user  = users[email];
  if (!user)            return { error:"No account found with this email." };
  if (user.password !== password) return { error:"Incorrect password." };
  return { user };
}
// SSO simulation — in production replace with real OAuth redirect
function ssoLogin(provider) {
  const users = getUsers();
  const email = `demo_${provider}@giftengine.app`;
  if (!users[email]) {
    const uid  = `u_sso_${provider}_${Date.now()}`;
    const name = provider === "google" ? "Google User" : provider === "github" ? "GitHub User" : "Facebook User";
    users[email] = { uid, name, email, password:"__sso__", avatar: provider[0].toUpperCase(), provider, createdAt: new Date().toISOString() };
    saveUsers(users);
  }
  return { user: users[email] };
}

// ─── GIFT ENGINE ──────────────────────────────────────────────────────────────
function generateGifts({ occasion, relationship, budget, interests, gender }) {
  const [minB, maxB] = budget;
  const lowerI = (interests||"").toLowerCase();
  return GIFT_POOL
    .filter(g => g.minBudget <= maxB)
    .map(g => {
      let score = 0;
      const tags = g.tags.map(t=>t.toLowerCase());
      if (tags.includes(occasion.toLowerCase()))     score+=3;
      if (tags.includes(relationship.toLowerCase())) score+=3;
      if (gender!=="Any") {
        if (tags.includes(gender.toLowerCase())) score+=2;
        else if (tags.includes("female")||tags.includes("male")) score-=1;
      }
      if (g.minBudget>=minB*0.8 && g.minBudget<=maxB) score+=2;
      if (lowerI) lowerI.split(/[\s,]+/).filter(Boolean).forEach(w=>{
        if (tags.some(t=>t.includes(w))||g.name.toLowerCase().includes(w)||g.description.toLowerCase().includes(w)) score+=4;
      });
      score+=Math.random()*0.5;
      return {...g, score};
    })
    .sort((a,b)=>b.score-a.score)
    .slice(0,9);
}

// ─── STARS ───────────────────────────────────────────────────────────────────
function Stars({rating}) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:1}}>
      {[1,2,3,4,5].map(i=>{
        const fill=Math.min(1,Math.max(0,rating-(i-1)));
        return (
          <span key={i} style={{position:"relative",fontSize:13,display:"inline-block",width:13,lineHeight:1}}>
            <span style={{color:"rgba(255,255,255,0.15)"}}>★</span>
            <span style={{position:"absolute",top:0,left:0,overflow:"hidden",width:`${fill*100}%`,color:"#ff9900",whiteSpace:"nowrap"}}>★</span>
          </span>
        );
      })}
    </span>
  );
}

// ─── PRODUCT IMAGE ───────────────────────────────────────────────────────────
function ProductImage({gift}) {
  const [status,setStatus]=useState("loading");
  const catColors={"Personalized":"#e8a87c","Luxury":"#c084fc","Budget-friendly":"#6ee7b7","Unique":"#60a5fa"};
  const cc=catColors[gift.category]||"#aaa";
  return (
    <div style={{position:"relative",width:"100%",height:175,background:"rgba(255,255,255,0.04)",borderRadius:"16px 16px 0 0",overflow:"hidden",flexShrink:0}}>
      {status==="loading"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>}
      {status==="error"&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}><span style={{fontSize:48}}>{gift.emoji}</span><span style={{fontSize:11,color:"rgba(240,236,228,0.3)"}}>{gift.name}</span></div>}
      {status!=="error"&&<img src={productImageUrl(gift.imageKeyword,gift.id)} alt={gift.name} onLoad={()=>setStatus("loaded")} onError={()=>setStatus("error")} style={{width:"100%",height:"100%",objectFit:"cover",opacity:status==="loaded"?1:0,transition:"opacity 0.4s ease"}}/>}
      <div style={{position:"absolute",top:9,left:9}}>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:cc,background:`${cc}22`,backdropFilter:"blur(8px)",padding:"3px 9px",borderRadius:20,border:`1px solid ${cc}44`}}>{gift.category}</span>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:55,background:"linear-gradient(to top,rgba(15,10,16,0.95),transparent)"}}/>
    </div>
  );
}

// ─── VENDOR BUTTON ───────────────────────────────────────────────────────────
function VendorBtn({vkey, giftName}) {
  const m=VENDOR_META[vkey];
  if(!m) return null;
  return (
    <a href={vendors[vkey](giftName)} target="_blank" rel="noopener noreferrer"
      style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,fontWeight:700,textDecoration:"none",padding:"4px 10px",borderRadius:14,background:m.bg,color:m.textColor,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",transition:"opacity 0.15s,transform 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.opacity="0.8";e.currentTarget.style.transform="scale(1.06)";}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="scale(1)";}}
    >
      <span style={{fontWeight:900,fontSize:12,fontFamily:"Georgia,serif"}}>{m.icon}</span>
      {m.label}
    </a>
  );
}

// ─── GIFT CARD ────────────────────────────────────────────────────────────────
function GiftCard({gift, isFavorited, onToggleFavorite, isLoggedIn, onFavClickNoAuth}) {
  const fmtR = n => n>=1000?`${(n/1000).toFixed(1)}k`:n;
  // Always include google shopping as final fallback if not already in vendors
  const allVendors = gift.vendors.includes("google") ? gift.vendors : [...gift.vendors,"google"];
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:18,display:"flex",flexDirection:"column",backdropFilter:"blur(12px)",transition:"transform 0.22s,box-shadow 0.22s",position:"relative",overflow:"hidden"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 20px 48px rgba(0,0,0,0.4)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}
    >
      <ProductImage gift={gift}/>
      <button onClick={()=>isLoggedIn?onToggleFavorite(gift.id):onFavClickNoAuth()}
        style={{position:"absolute",top:9,right:9,background:"rgba(15,10,16,0.65)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"50%",width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,transition:"transform 0.15s",opacity:isFavorited?1:0.6}}
        title={isLoggedIn?(isFavorited?"Remove from saved":"Save gift"):"Login to save gifts"}
      >
        {isFavorited?"❤️":"🤍"}
      </button>
      <div style={{padding:"14px 16px 16px",display:"flex",flexDirection:"column",gap:9,flexGrow:1}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:"#f0ece4",fontFamily:"'Playfair Display',serif",lineHeight:1.3}}>{gift.name}</h3>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          <Stars rating={gift.rating}/>
          <span style={{fontSize:13,fontWeight:700,color:"#ff9900"}}>{gift.rating}</span>
          <span style={{fontSize:11.5,color:"rgba(240,236,228,0.35)"}}>({fmtR(gift.reviews)} reviews)</span>
        </div>
        <p style={{margin:0,fontSize:12.5,color:"rgba(240,236,228,0.58)",lineHeight:1.65,flexGrow:1}}>{gift.description}</p>
        <div style={{fontSize:16,fontWeight:700,color:"#f0ece4",fontFamily:"'Playfair Display',serif"}}>{gift.priceRange}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
          {allVendors.map(v=><VendorBtn key={v} vkey={v} giftName={gift.name}/>)}
        </div>
      </div>
      <div style={{height:3,background:`linear-gradient(90deg,transparent,${{"Personalized":"#e8a87c","Luxury":"#c084fc","Budget-friendly":"#6ee7b7","Unique":"#60a5fa"}[gift.category]||"#aaa"},transparent)`,opacity:0.6}}/>
    </div>
  );
}

// ─── SELECT ───────────────────────────────────────────────────────────────────
function Select({value,onChange,options,placeholder}) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:value?"#f0ece4":"rgba(240,236,228,0.35)",fontSize:14,cursor:"pointer",outline:"none",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23aaa' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",fontFamily:"'DM Sans',sans-serif"}}>
      <option value="" disabled style={{background:"#1a1014"}}>{placeholder}</option>
      {options.map(o=><option key={o} value={o} style={{background:"#1a1014"}}>{o}</option>)}
    </select>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({onClose,onAuth}) {
  const [mode,setMode]         = useState("login"); // login | register
  const [name,setName]         = useState("");
  const [email,setEmail]       = useState("");
  const [password,setPassword] = useState("");
  const [error,setError]       = useState("");
  const [loading,setLoading]   = useState(false);

  const inputSt = { width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:12,color:"#f0ece4",fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",marginBottom:12,transition:"border-color 0.2s" };

  const handle = () => {
    setError(""); setLoading(true);
    setTimeout(()=>{
      const result = mode==="login" ? loginUser({email,password}) : registerUser({name,email,password});
      if(result.error) { setError(result.error); setLoading(false); return; }
      saveSession(result.user); onAuth(result.user); setLoading(false);
    },600);
  };

  const handleSSO = provider => {
    setLoading(true);
    setTimeout(()=>{
      const result = ssoLogin(provider);
      saveSession(result.user); onAuth(result.user); setLoading(false);
    },800);
  };

  const ssoProviders=[
    {key:"google",  label:"Continue with Google",   bg:"#fff",    color:"#3c4043", border:"#dadce0",
     icon:<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>},
    {key:"github",  label:"Continue with GitHub",   bg:"#24292e", color:"#fff",    border:"#444",
     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>},
    {key:"facebook",label:"Continue with Facebook", bg:"#1877f2", color:"#fff",    border:"#1877f2",
     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>},
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#15101a",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"36px 32px",width:"100%",maxWidth:420,position:"relative"}} onClick={e=>e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:32,marginBottom:8}}>🎁</div>
          <h2 style={{margin:0,fontFamily:"'Playfair Display',serif",fontSize:22,background:"linear-gradient(135deg,#f0ece4,#e8a87c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {mode==="login"?"Welcome back":"Create account"}
          </h2>
          <p style={{margin:"6px 0 0",fontSize:13,color:"rgba(240,236,228,0.4)"}}>
            {mode==="login"?"Sign in to access your saved gifts":"Join to save and organise your gift ideas"}
          </p>
        </div>

        {/* SSO Buttons */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {ssoProviders.map(p=>(
            <button key={p.key} onClick={()=>handleSSO(p.key)} disabled={loading}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 16px",borderRadius:12,background:p.bg,color:p.color,border:`1px solid ${p.border}`,cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif",transition:"opacity 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            >
              {p.icon}<span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
          <span style={{fontSize:12,color:"rgba(240,236,228,0.3)"}}>or with email</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.1)"}}/>
        </div>

        {/* Email form */}
        {mode==="register"&&<input style={inputSt} placeholder="Full name" value={name} onChange={e=>setName(e.target.value)}/>}
        <input style={inputSt} placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input style={inputSt} placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>

        {error&&<p style={{color:"#f87171",fontSize:13,margin:"-6px 0 12px",textAlign:"center"}}>{error}</p>}

        <button onClick={handle} disabled={loading}
          style={{width:"100%",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"opacity 0.2s",opacity:loading?0.7:1}}
        >{loading?"Please wait…":mode==="login"?"Sign In":"Create Account"}</button>

        <p style={{textAlign:"center",marginTop:16,fontSize:13,color:"rgba(240,236,228,0.4)"}}>
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <button onClick={()=>{setMode(m=>m==="login"?"register":"login");setError("");}} style={{background:"none",border:"none",color:"#e8a87c",cursor:"pointer",fontWeight:600,fontSize:13}}>
            {mode==="login"?"Register":"Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Auth
  const [user,       setUser]       = useState(()=>getSession());
  const [showAuth,   setShowAuth]   = useState(false);
  const [authToast,  setAuthToast]  = useState("");

  // Form
  const [occasion,     setOccasion]     = useState("");
  const [relationship, setRelationship] = useState("");
  const [budget,       setBudget]       = useState([500,10000]);
  const [interests,    setInterests]    = useState("");
  const [gender,       setGender]       = useState("Any");

  // Results
  const [gifts,       setGifts]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filterCat,   setFilterCat]   = useState("All");
  const [filterMax,   setFilterMax]   = useState(60000);
  const [showFavs,    setShowFavs]    = useState(false);

  // Favorites per user
  const [favorites, setFavoritesState] = useState(()=> user ? getUserFavs(user.uid) : []);
  const setFavorites = useCallback(updater => {
    setFavoritesState(prev => {
      const next = typeof updater==="function" ? updater(prev) : updater;
      if(user) saveUserFavs(user.uid, next);
      return next;
    });
  },[user]);

  // When user changes, reload their favorites
  useEffect(()=>{ if(user) setFavoritesState(getUserFavs(user.uid)); else setFavoritesState([]); },[user]);

  const handleAuth = useCallback(u => {
    setUser(u); setShowAuth(false);
    showToast(`Welcome, ${u.name.split(" ")[0]}! 🎉`);
  },[]);

  const logout = useCallback(()=>{ clearSession(); setUser(null); setFavoritesState([]); },[]);

  const showToast = msg => { setAuthToast(msg); setTimeout(()=>setAuthToast(""),3000); };

  const toggleFavorite = useCallback(id=>{
    setFavorites(p=>p.includes(id)?p.filter(f=>f!==id):[...p,id]);
  },[setFavorites]);

  const runGenerate = useCallback(params=>{
    setLoading(true); setHasSearched(true); setFilterCat("All");
    setTimeout(()=>{ setGifts(generateGifts(params)); setLoading(false); },1400);
  },[]);

  const handleGenerate = useCallback(()=>{
    if(!occasion||!relationship) return;
    runGenerate({occasion,relationship,budget,interests,gender});
  },[occasion,relationship,budget,interests,gender,runGenerate]);

  const handleSurprise = useCallback(()=>{
    const o=OCCASIONS[Math.floor(Math.random()*OCCASIONS.length)];
    const r=RELATIONSHIPS[Math.floor(Math.random()*RELATIONSHIPS.length)];
    const b=BUDGET_PRESETS[Math.floor(Math.random()*BUDGET_PRESETS.length)].range;
    const g=GENDERS[Math.floor(Math.random()*GENDERS.length)];
    setOccasion(o);setRelationship(r);setBudget(b);setGender(g);setInterests("");
    runGenerate({occasion:o,relationship:r,budget:b,interests:"",gender:g});
  },[runGenerate]);

  const fmt = n=>"₹"+n.toLocaleString("en-IN");
  const filtered = gifts.filter(g=>(filterCat==="All"||g.category===filterCat)&&g.minBudget<=filterMax);
  const favGifts = GIFT_POOL.filter(g=>favorites.includes(g.id));
  const canGo    = !!(occasion&&relationship);

  const lSt={display:"block",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"#e8a87c",marginBottom:7,fontWeight:600};
  const gSt={padding:"11px 22px",borderRadius:50,fontSize:13.5,fontWeight:600,cursor:"pointer",background:"rgba(255,255,255,0.06)",color:"#f0ece4",border:"1px solid rgba(255,255,255,0.14)",fontFamily:"'DM Sans',sans-serif",transition:"background 0.2s"};

  return (
    <div style={{minHeight:"100vh",background:"#0f0a10",backgroundImage:"radial-gradient(ellipse 60% 40% at 20% 10%,rgba(200,120,80,0.13) 0%,transparent 70%),radial-gradient(ellipse 50% 35% at 80% 90%,rgba(140,70,200,0.12) 0%,transparent 70%)",fontFamily:"'DM Sans',sans-serif",color:"#f0ece4",paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#e8a87c,#c084fc);cursor:pointer;border:2px solid #0f0a10;}
        input:focus{border-color:rgba(232,168,124,0.5)!important;}
        select option{background:#1a1014;color:#f0ece4;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{opacity:.45;}50%{opacity:1;}}
        @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-12px);}to{opacity:1;transform:translateY(0);}}
        .gc-anim{animation:fadeUp 0.4s ease forwards;opacity:0;}
        .toast{animation:slideDown 0.3s ease;}
      `}</style>

      {/* ── Topbar ── */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(15,10,16,0.85)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{maxWidth:1150,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>🎁</span>
            <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:17,background:"linear-gradient(90deg,#f0ece4,#e8a87c)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>GiftEngine</span>
            <span style={{fontSize:11,color:"rgba(240,236,228,0.3)",marginLeft:2}}>India</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {user ? (
              <>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#e8a87c,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#0f0a10"}}>{user.avatar}</div>
                  <span style={{fontSize:13,fontWeight:600,color:"rgba(240,236,228,0.8)",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
                </div>
                <button onClick={logout} style={{...gSt,padding:"6px 14px",fontSize:12.5}}>Sign Out</button>
              </>
            ) : (
              <button onClick={()=>setShowAuth(true)} style={{padding:"8px 20px",borderRadius:50,fontSize:13,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#e8a87c,#c084fc)",color:"#0f0a10",border:"none",fontFamily:"'DM Sans',sans-serif"}}>Sign In</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {authToast&&(
        <div className="toast" style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"rgba(232,168,124,0.15)",border:"1px solid rgba(232,168,124,0.4)",backdropFilter:"blur(12px)",padding:"10px 22px",borderRadius:30,fontSize:14,fontWeight:600,color:"#e8a87c",zIndex:200,whiteSpace:"nowrap"}}>{authToast}</div>
      )}

      {/* ── Auth Modal ── */}
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={handleAuth}/>}

      {/* ── Header ── */}
      <header style={{textAlign:"center",padding:"44px 24px 24px"}}>
        <div style={{fontSize:11.5,letterSpacing:"0.22em",textTransform:"uppercase",color:"#e8a87c",marginBottom:12,fontWeight:600}}>✦ Personalised Gift Discovery — India ✦</div>
        <h1 style={{margin:0,fontSize:"clamp(28px,5vw,54px)",fontFamily:"'Playfair Display',serif",fontWeight:700,lineHeight:1.1,background:"linear-gradient(135deg,#f0ece4 30%,#e8a87c 58%,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Find the Perfect Gift</h1>
        <p style={{margin:"12px auto 0",maxWidth:520,color:"rgba(240,236,228,0.45)",fontSize:14,lineHeight:1.8}}>
          Shop across <span style={{color:"#ff9900",fontWeight:600}}>Amazon</span>, <span style={{color:"#2874f0",fontWeight:600}}>Flipkart</span>, <span style={{color:"#ff3f6c",fontWeight:600}}>Myntra</span>, <span style={{color:"#0056d2",fontWeight:600}}>Coursera</span> & <span style={{color:"#34a853",fontWeight:600}}>Google Shopping</span> — all in one place.
          {!user&&<span> <button onClick={()=>setShowAuth(true)} style={{background:"none",border:"none",color:"#e8a87c",cursor:"pointer",fontWeight:600,fontSize:14,textDecoration:"underline"}}>Sign in</button> to save your favourites.</span>}
        </p>
      </header>

      <main style={{maxWidth:1150,margin:"0 auto",padding:"0 20px"}}>

        {/* Form */}
        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:28,padding:"26px 26px 22px",marginBottom:26,backdropFilter:"blur(20px)"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:13}}>
            <div><label style={lSt}>Occasion *</label><Select value={occasion} onChange={setOccasion} options={OCCASIONS} placeholder="Select occasion"/></div>
            <div><label style={lSt}>Relationship *</label><Select value={relationship} onChange={setRelationship} options={RELATIONSHIPS} placeholder="Select relationship"/></div>
            <div><label style={lSt}>Gender</label><Select value={gender} onChange={setGender} options={GENDERS} placeholder="Any"/></div>
            <div><label style={lSt}>Interests</label>
              <input type="text" placeholder="e.g. cooking, music, tech" value={interests} onChange={e=>setInterests(e.target.value)}
                style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,color:"#f0ece4",fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
            </div>
          </div>
          <div style={{marginTop:18}}>
            <label style={lSt}>Budget Range</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
              {BUDGET_PRESETS.map(p=>{
                const a=budget[0]===p.range[0]&&budget[1]===p.range[1];
                return <button key={p.label} onClick={()=>setBudget(p.range)} style={{padding:"5px 13px",borderRadius:50,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid",fontFamily:"'DM Sans',sans-serif",borderColor:a?"#e8a87c":"rgba(255,255,255,0.14)",background:a?"rgba(232,168,124,0.15)":"transparent",color:a?"#e8a87c":"rgba(240,236,228,0.5)",transition:"all 0.15s"}}>{p.label}</button>;
              })}
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
            <button onClick={handleGenerate} disabled={!canGo||loading} style={{padding:"11px 28px",borderRadius:50,fontSize:14,fontWeight:700,cursor:canGo?"pointer":"not-allowed",background:canGo?"linear-gradient(135deg,#e8a87c,#c084fc)":"rgba(255,255,255,0.07)",color:canGo?"#0f0a10":"rgba(240,236,228,0.25)",border:"none",transition:"transform 0.15s",fontFamily:"'DM Sans',sans-serif"}}
              onMouseEnter={e=>{if(canGo)e.currentTarget.style.transform="scale(1.03)";}} onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}
            >{loading?"Generating…":"✨ Find Gifts"}</button>
            <button onClick={handleSurprise} disabled={loading} style={gSt} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.11)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>🎲 Surprise Me</button>
            <button onClick={()=>{ if(!user){setShowAuth(true);return;} setShowFavs(v=>!v); }} style={{...gSt,background:showFavs?"rgba(232,168,124,0.13)":"rgba(255,255,255,0.06)",color:showFavs?"#e8a87c":"#f0ece4",borderColor:showFavs?"#e8a87c55":"rgba(255,255,255,0.14)"}}>
              ❤️ Saved ({favorites.length})
            </button>
          </div>
        </div>

        {/* Saved Panel */}
        {showFavs&&user&&(
          <div style={{marginBottom:26}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:21,marginBottom:18,color:"#e8a87c"}}>❤️ {user.name.split(" ")[0]}'s Saved Gifts</h2>
            {favGifts.length===0
              ?<p style={{color:"rgba(240,236,228,0.38)",fontSize:14}}>No saved gifts yet — heart any gift to save it here.</p>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))",gap:20}}>
                {favGifts.map(g=><GiftCard key={g.id} gift={g} isFavorited isLoggedIn={!!user} onToggleFavorite={toggleFavorite} onFavClickNoAuth={()=>setShowAuth(true)}/>)}
              </div>}
            <div style={{margin:"22px 0",height:1,background:"rgba(255,255,255,0.07)"}}/>
          </div>
        )}

        {/* Loading */}
        {loading&&(
          <div style={{textAlign:"center",padding:"56px 0"}}>
            <div style={{width:46,height:46,border:"3px solid rgba(255,255,255,0.1)",borderTop:"3px solid #e8a87c",borderRadius:"50%",animation:"spin 0.9s linear infinite",margin:"0 auto 18px"}}/>
            <p style={{color:"rgba(240,236,228,0.45)",animation:"pulse 1.5s infinite",fontSize:14}}>Curating the perfect gifts…</p>
          </div>
        )}

        {/* Results */}
        {!loading&&hasSearched&&gifts.length>0&&(
          <>
            {/* Filter bar */}
            <div style={{display:"flex",gap:7,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:"rgba(240,236,228,0.35)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Filter:</span>
              {CATEGORIES.map(cat=>(
                <button key={cat} onClick={()=>setFilterCat(cat)} style={{padding:"5px 14px",borderRadius:50,fontSize:12.5,fontWeight:600,cursor:"pointer",border:"1px solid",borderColor:filterCat===cat?"#e8a87c":"rgba(255,255,255,0.11)",background:filterCat===cat?"rgba(232,168,124,0.14)":"transparent",color:filterCat===cat?"#e8a87c":"rgba(240,236,228,0.5)",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>{cat}</button>
              ))}
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:"rgba(240,236,228,0.35)"}}>Max {fmt(filterMax)}</span>
                <input type="range" min={500} max={60000} step={500} value={filterMax} onChange={e=>setFilterMax(+e.target.value)} style={{width:88,appearance:"none",background:"rgba(255,255,255,0.12)",height:4,borderRadius:4,cursor:"pointer"}}/>
              </div>
            </div>

            {/* Vendor legend */}
            <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:"rgba(240,236,228,0.3)"}}>Shop on:</span>
              {Object.entries(VENDOR_META).map(([k,m])=>(
                <span key={k} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11.5,color:"rgba(240,236,228,0.45)"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:m.color,display:"inline-block"}}/>
                  {m.label}
                </span>
              ))}
            </div>

            <div style={{marginBottom:20}}>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,margin:0}}>
                {filtered.length} Gift{filtered.length!==1?"s":""} Found
                <span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:400,color:"rgba(240,236,228,0.38)",marginLeft:10}}>for {relationship} · {occasion} · {fmt(budget[0])}–{fmt(budget[1])}</span>
              </h2>
            </div>

            {filtered.length===0
              ?<p style={{color:"rgba(240,236,228,0.38)",textAlign:"center",padding:40}}>No gifts match this filter. Try adjusting the price or category.</p>
              :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:22}}>
                {filtered.map((g,i)=>(
                  <div key={g.id} className="gc-anim" style={{animationDelay:`${i*60}ms`}}>
                    <GiftCard gift={g} isFavorited={favorites.includes(g.id)} isLoggedIn={!!user} onToggleFavorite={toggleFavorite} onFavClickNoAuth={()=>setShowAuth(true)}/>
                  </div>
                ))}
              </div>}
          </>
        )}

        {/* Empty */}
        {!loading&&!hasSearched&&(
          <div style={{textAlign:"center",padding:"52px 20px",opacity:0.35}}>
            <div style={{fontSize:48,marginBottom:14}}>🎁</div>
            <p style={{fontSize:14.5}}>Fill in the occasion & relationship above to discover gifts</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{maxWidth:1150,margin:"52px auto 0",padding:"20px 20px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <p style={{margin:0,fontSize:12,color:"rgba(240,236,228,0.2)",lineHeight:1.9}}>
          🔐 <strong style={{color:"rgba(240,236,228,0.35)"}}>Auth:</strong> localStorage-based demo — swap with Firebase Auth / Supabase for production SSO. &nbsp;·&nbsp;
          🛒 <strong style={{color:"rgba(240,236,228,0.35)"}}>Smart links:</strong> Amazon · Flipkart · Myntra · Coursera · Udemy · Google Shopping — each product routes to the most relevant vendors. &nbsp;·&nbsp;
          📸 <strong style={{color:"rgba(240,236,228,0.35)"}}>Images:</strong> Unsplash free tier — upgrade to Amazon PA API v5 for real product photos.
        </p>
      </footer>
    </div>
  );
}
