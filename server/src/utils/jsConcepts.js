/**
 * JavaScript Core Concepts — Expense Tracker Edition
 *
 * Each concept is demonstrated with a real example drawn from this
 * codebase so the explanations connect to code you can actually run.
 *
 * Topics covered:
 *   1. Closures
 *   2. Hoisting
 *   3. Event Loop
 *   4. Promises vs Callbacks
 *   5. Async / Await
 */

// ═══════════════════════════════════════════════════════════════════
// 1. CLOSURES
// ═══════════════════════════════════════════════════════════════════
// A closure is a function that "closes over" (remembers) variables
// from the outer scope even after the outer function has returned.
//
// Real-world use in this app:
//   generateToken() in authController.js closes over process.env.JWT_SECRET.
//   createRateLimiter() below closes over `windowMs` and `maxRequests`.

/**
 * Factory that creates a per-user rate limiter.
 * The returned function closes over `hits` and the config values —
 * each caller gets its own independent counter without sharing state.
 */
export const createRateLimiter = (maxRequests = 5, windowMs = 60_000) => {
  const hits = {}; // captured in closure — lives as long as the returned fn does

  return function checkLimit(userId) {
    const now = Date.now();

    if (!hits[userId] || now - hits[userId].windowStart > windowMs) {
      // Start a fresh window for this user
      hits[userId] = { count: 1, windowStart: now };
      return { allowed: true, remaining: maxRequests - 1 };
    }

    hits[userId].count++;

    if (hits[userId].count > maxRequests) {
      const retryAfterMs = windowMs - (now - hits[userId].windowStart);
      return { allowed: false, remaining: 0, retryAfterMs };
    }

    return { allowed: true, remaining: maxRequests - hits[userId].count };
  };
};

// Usage:
const aiLimiter = createRateLimiter(10, 60_000); // 10 AI calls per minute
console.log('Closure — rate limiter:', aiLimiter('user_123')); // { allowed: true, remaining: 9 }
console.log('Closure — rate limiter:', aiLimiter('user_123')); // { allowed: true, remaining: 8 }

// Each call to createRateLimiter() produces an independent `hits` object —
// this is the closure capturing a *new* copy of the variable each time.
const expenseLimiter = createRateLimiter(100, 60_000); // separate state, not shared
console.log('Closure — independent instance:', expenseLimiter('user_123')); // remaining: 99


// ═══════════════════════════════════════════════════════════════════
// 2. HOISTING
// ═══════════════════════════════════════════════════════════════════
// Hoisting is the JS engine moving *declarations* to the top of their
// scope before code runs.
//
//  • function declarations  → fully hoisted (callable before the line)
//  • var declarations       → hoisted but initialised as `undefined`
//  • let / const            → hoisted into a "temporal dead zone" (TDZ);
//                             accessing before declaration throws ReferenceError

// ── Function declaration hoisting ───────────────────────────────────
// Works because function declarations are fully hoisted.
console.log('Hoisting — function before declaration:', formatCurrency(1234.5));

function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

// ── var hoisting ─────────────────────────────────────────────────────
// `defaultCategory` is hoisted as `undefined`; the string is assigned later.
console.log('Hoisting — var before assignment:', defaultCategory); // undefined  ← hoisted declaration
var defaultCategory = 'Other';
console.log('Hoisting — var after assignment:', defaultCategory);  // "Other"

// ── let / const in the temporal dead zone ────────────────────────────
// Uncommenting the line below would throw:
//   ReferenceError: Cannot access 'EXPENSE_LIMIT' before initialization
// console.log(EXPENSE_LIMIT); // TDZ — throws ReferenceError
const EXPENSE_LIMIT = 100_000;
console.log('Hoisting — const after declaration:', EXPENSE_LIMIT); // 100000

// ── Why this matters in Express route handlers ────────────────────────
// Because routes are registered after the server is created but before
// the first request, function-hoisting guarantees controller functions
// defined anywhere in the file are already in memory. var-based flags
// inside controllers would cause subtle "undefined" bugs if read too early.


// ═══════════════════════════════════════════════════════════════════
// 3. EVENT LOOP
// ═══════════════════════════════════════════════════════════════════
// Node.js is single-threaded but non-blocking. The event loop processes:
//   1. Call stack     — synchronous code runs first
//   2. Microtask queue — Promise callbacks (.then, await continuations)
//   3. Macrotask queue — I/O callbacks, setTimeout, setInterval

export const demonstrateEventLoop = () => {
  console.log('\n── Event Loop order ──────────────────────────');

  // 1️⃣ Synchronous — runs immediately, on the call stack
  console.log('1. SYNC: Request received for GET /api/expenses');

  // 3️⃣ Macrotask — scheduled via the macrotask queue (runs last)
  setTimeout(() => {
    console.log('4. MACRO: Cleanup timeout fired (e.g., log slow request)');
  }, 0);

  // 2️⃣ Microtask — Promise.resolve enqueues a microtask (runs before setTimeout)
  Promise.resolve()
    .then(() => {
      console.log('3. MICRO: Prisma query resolved → expense list ready');
    })
    .then(() => {
      console.log('   MICRO: Response serialised and sent to client');
    });

  // 1️⃣ Still synchronous — runs before either async queue
  console.log('2. SYNC: Auth token validated (synchronous JWT verify)');

  // OUTPUT ORDER:
  //   1. SYNC: Request received for GET /api/expenses
  //   2. SYNC: Auth token validated (synchronous JWT verify)
  //   3. MICRO: Prisma query resolved → expense list ready
  //      MICRO: Response serialised and sent to client
  //   4. MACRO: Cleanup timeout fired (e.g., log slow request)
};

demonstrateEventLoop();

// Why this matters in Express:
//   If you block the call stack with a CPU-heavy operation (e.g., looping
//   over 100k expenses for a report), ALL other requests wait. Offload such
//   work to worker threads or a background queue.


// ═══════════════════════════════════════════════════════════════════
// 4. PROMISES vs CALLBACKS
// ═══════════════════════════════════════════════════════════════════
// Callbacks were the original async pattern. Promises solved "callback hell"
// by making async code composable and chainable.

// ── Callback style ────────────────────────────────────────────────────
// Hard to read when nested (callback hell), errors must be checked manually.
export const fetchExpensesByUserCallback = (userId, callback) => {
  // Simulates a DB lookup with a delayed response
  setTimeout(() => {
    if (!userId) {
      return callback(new Error('userId is required'), null);
    }
    callback(null, [
      { id: '1', title: 'Pizza', amount: 450, category: 'Food', userId },
      { id: '2', title: 'Uber', amount: 280, category: 'Travel', userId },
    ]);
  }, 50);
};

// ── Promise style ─────────────────────────────────────────────────────
// Chainable, errors handled with .catch(), composable with Promise.all.
export const fetchExpensesByUserPromise = (userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) {
        reject(new Error('userId is required'));
        return;
      }
      resolve([
        { id: '1', title: 'Pizza', amount: 450, category: 'Food', userId },
        { id: '2', title: 'Uber', amount: 280, category: 'Travel', userId },
      ]);
    }, 50);
  });
};

// ── Side-by-side demonstration ────────────────────────────────────────
console.log('\n── Callback vs Promise ───────────────────────');

// Callback — nested error handling becomes unwieldy with multiple steps
fetchExpensesByUserCallback('user_abc', (err, expenses) => {
  if (err) {
    console.error('Callback error:', err.message);
    return;
  }
  console.log('Callback result — expense count:', expenses.length);
});

// Promise — flat chain, easy to extend
fetchExpensesByUserPromise('user_abc')
  .then((expenses) => {
    console.log('Promise result — expense count:', expenses.length);
    // Can chain more .then() calls without nesting
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  })
  .then((total) => {
    console.log('Promise chain — total amount: ₹' + total);
  })
  .catch((err) => {
    console.error('Promise error:', err.message);
  });

// Promise.all — fetch multiple data sources concurrently
// (mirrors what the AI controller does: fetch expenses before calling Gemini)
const fetchUserProfile = (userId) =>
  Promise.resolve({ id: userId, name: 'Arjun', monthlyBudget: 50000 });

Promise.all([
  fetchExpensesByUserPromise('user_abc'),
  fetchUserProfile('user_abc'),
]).then(([expenses, profile]) => {
  console.log(`Promise.all — ${profile.name} has ${expenses.length} expenses`);
});


// ═══════════════════════════════════════════════════════════════════
// 5. ASYNC / AWAIT
// ═══════════════════════════════════════════════════════════════════
// async/await is syntactic sugar over Promises. It makes async code read
// like synchronous code while keeping it non-blocking.
//
// Rules:
//   - `await` can only be used inside an `async` function
//   - An async function always returns a Promise
//   - Use try/catch for error handling (mirrors .catch() on a Promise)

/**
 * Calculates a spending summary for a user.
 * Mirrors what DashboardStats.jsx computes on the client — but server-side,
 * using async/await for the database call.
 */
export const calculateSpendingSummary = async (userId) => {
  try {
    // `await` suspends this function (not the thread) until the Promise resolves
    const expenses = await fetchExpensesByUserPromise(userId);

    // Once resolved, synchronous computation continues normally
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const average = expenses.length > 0 ? total / expenses.length : 0;
    const highest = expenses.reduce(
      (max, e) => (e.amount > max.amount ? e : max),
      expenses[0] || { amount: 0 }
    );

    return {
      userId,
      total,
      count: expenses.length,
      average: parseFloat(average.toFixed(2)),
      highest: highest?.title ?? 'N/A',
    };
  } catch (error) {
    // try/catch works exactly like .catch() on a Promise chain
    console.error('calculateSpendingSummary error:', error.message);
    throw error; // re-throw so the caller (e.g., an Express controller) can handle it
  }
};

// Async IIFE — run the example immediately (module-level await alternative)
(async () => {
  console.log('\n── Async / Await ──────────────────────────────');
  const summary = await calculateSpendingSummary('user_abc');
  console.log('Async/Await — spending summary:', summary);
  // { userId: 'user_abc', total: 730, count: 2, average: 365, highest: 'Pizza' }
})();

// ── Parallel async calls with await + Promise.all ────────────────────
// Sequential (slow — waits for each one):
//   const a = await fetchA();
//   const b = await fetchB(); // only starts after fetchA finishes

// Parallel (fast — both run at the same time):
export const getDashboardData = async (userId) => {
  const [expenses, profile] = await Promise.all([
    fetchExpensesByUserPromise(userId),
    fetchUserProfile(userId),
  ]);
  // Both are available here after the slower one completes
  return { expenses, profile };
};
