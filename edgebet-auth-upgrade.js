// auth-upgrade.js - Updated frontend authentication with secure plan verification
// Replace the relevant sections in your edgebet.html with these

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BACKEND = "https://YOUR-BACKEND.onrender.com"; // Update this!

// ─── SECURE PLAN CHECK ─────────────────────────────────────────────────────────
// Replace the existing isPro() function with this:

async function fetchPlanStatus(email) {
  try {
    const res = await fetch(`${BACKEND}/subscription/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Plan check failed:', err);
    return { plan: 'free', active: false };
  }
}

// Use this instead of isPro() - it verifies with backend
async function checkUserPlan(email) {
  const cached = localStorage.getItem('edgebet_plan_cache');
  const cacheTime = localStorage.getItem('edgebet_plan_cache_time');
  const now = Date.now();
  
  // Use cached value if less than 5 minutes old
  if (cached && cacheTime && (now - parseInt(cacheTime)) < 5 * 60 * 1000) {
    return JSON.parse(cached);
  }
  
  // Fetch fresh data
  const status = await fetchPlanStatus(email);
  
  // Cache the result
  localStorage.setItem('edgebet_plan_cache', JSON.stringify(status));
  localStorage.setItem('edgebet_plan_cache_time', now.toString());
  
  return status;
}

// Legacy fallback for components that need sync check
function isPro() {
  const cached = localStorage.getItem('edgebet_plan_cache');
  if (!cached) return false;
  const status = JSON.parse(cached);
  return status.active && (status.plan === 'pro' || status.plan === 'sharp');
}

// ─── PAYMENT REDIRECT HANDLING ─────────────────────────────────────────────────
// Add this useEffect in your Page component (inside function Page()):

function usePaymentRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const plan = params.get('plan');
    
    if (payment === 'success' && plan) {
      // Verify payment with backend
      verifyAndUnlock(plan);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancelled') {
      // Show friendly message
      showToast('Payment cancelled. Your picks are still waiting! 🏀');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
}

async function verifyAndUnlock(plan) {
  const user = JSON.parse(localStorage.getItem('edgebet_currentUser') || '{}');
  if (!user.email) return;
  
  // Poll backend for subscription status (Stripe webhooks can take a few seconds)
  let attempts = 0;
  const maxAttempts = 10;
  
  const checkSubscription = async () => {
    const status = await fetchPlanStatus(user.email);
    
    if (status.active) {
      // Success!
      localStorage.setItem('edgebet_plan_cache', JSON.stringify(status));
      localStorage.setItem('edgebet_plan', status.plan);
      
      // Update user object
      user.plan = status.plan;
      localStorage.setItem('edgebet_currentUser', JSON.stringify(user));
      
      // Refresh the page or update state
      window.location.reload();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkSubscription, 2000); // Try again in 2 seconds
    } else {
      showToast('Payment processing... Refresh in a moment!');
    }
  };
  
  checkSubscription();
}

// ─── UPDATED STRIPE LINKS WITH REDIRECT ────────────────────────────────────────
// Update your PLANS config with redirect URLs:

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Free",
    scans: 2,
    features: ["2 picks/day", "Basic confidence score", "Parlay builder"],
    cta: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro",
    price: 1999,
    priceLabel: "$19.99/mo",
    scans: Infinity,
    features: [
      "Unlimited picks/day",
      "Full 7-agent breakdown",
      "Live odds from The Odds API",
      "Line movement alerts",
      "Injury report flags",
      "Share pick cards",
      "Parlay optimizer",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    // Add redirect URLs and metadata
    stripeLink: `https://buy.stripe.com/14A28r6qJ9nh206gEcgYU00` +
      `?success_url=${encodeURIComponent('https://edgebet.app/?payment=success&plan=pro')}` +
      `&cancel_url=${encodeURIComponent('https://edgebet.app/?payment=cancelled')}` +
      `&prefilled_email=` + (getUserEmail() || ''),
  },
  {
    id: "sharp",
    name: "Sharp",
    price: 4999,
    priceLabel: "$49.99/mo",
    scans: Infinity,
    features: [
      "Everything in Pro",
      "Sharp money tracker",
      "Steam move alerts",
      "Model confidence history",
      "Priority Telegram alerts",
      "1-on-1 Discord access",
    ],
    cta: "Go Sharp",
    stripeLink: `https://buy.stripe.com/eVqfZhg1jbvp9syafOgYU01` +
      `?success_url=${encodeURIComponent('https://edgebet.app/?payment=success&plan=sharp')}` +
      `&cancel_url=${encodeURIComponent('https://edgebet.app/?payment=cancelled')}` +
      `&prefilled_email=` + (getUserEmail() || ''),
  },
];

function getUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem('edgebet_currentUser') || '{}');
    return user.email || '';
  } catch {
    return '';
  }
}

// ─── SUBSCRIPTION MANAGEMENT ───────────────────────────────────────────────────
// Add this to the ProfileModal for users to manage their subscription:

function ManageSubscriptionButton({ customerId }) {
  const [loading, setLoading] = useState(false);
  
  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/create-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      showToast('Failed to open billing portal. Try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={openPortal}
      disabled={loading}
      style={{ 
        width: "100%", 
        padding: "12px", 
        background: "rgba(255,255,255,0.06)", 
        border: "1px solid rgba(255,255,255,0.1)", 
        borderRadius: 10, 
        color: "#9ca3af",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: 10
      }}
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}

// ─── TOAST NOTIFICATION HELPER ─────────────────────────────────────────────────

function showToast(message, duration = 3000) {
  // Create toast element
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(17, 17, 19, 0.95);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-radius: 12px;
    padding: 14px 24px;
    color: #22d3ee;
    font-weight: 600;
    z-index: 9999;
    animation: fadein 0.3s ease;
    backdrop-filter: blur(10px);
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── ANTI-TAMPERING CHECK ──────────────────────────────────────────────────────
// Add this to periodically verify plan status

function usePlanVerifier(email) {
  useEffect(() => {
    if (!email) return;
    
    // Check immediately on mount
    checkUserPlan(email);
    
    // Check every 5 minutes while app is open
    const interval = setInterval(() => {
      checkUserPlan(email);
    }, 5 * 60 * 1000);
    
    // Check when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUserPlan(email);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [email]);
}
