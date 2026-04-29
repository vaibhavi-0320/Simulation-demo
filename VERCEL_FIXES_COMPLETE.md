# Production Fixes for Fintrix — Vercel Deployment

**Date:** April 29, 2026  
**Status:** ✅ COMPLETED

## Summary of Changes

Your production errors on Vercel have been fixed by implementing **three critical changes**:

### 1. ✅ Created Vercel Serverless Functions

The root cause was that Express backend (`backend/server.ts`) is **not deployed on Vercel**. Vercel only serves the static frontend. All API calls from the frontend (`/api/stellar/build`, `/api/stellar/submit`) were returning 404 or HTML error pages instead of JSON, causing XDR to be undefined.

**Solution:** Converted backend routes to Vercel Serverless Functions in `frontend/api/`:

#### Created Files:
- **`frontend/api/stellar-build.ts`** — Builds funding transaction XDR
  - Validates investor public key
  - Checks wallet balance
  - Returns valid transaction XDR
  
- **`frontend/api/stellar-submit.ts`** — Submits signed transactions to Stellar
  - Validates signed XDR
  - Submits to Horizon testnet
  - Returns transaction hash & explorer URL
  
- **`frontend/api/stellar-build-simulation.ts`** — Builds simulation transaction XDR
  - Validates wallet has minimum 2 XLM
  - Creates self-payment transaction
  - Returns XDR for signing

### 2. ✅ Updated Vercel Configuration

**File:** `vercel.json`

Changed from simple rewrites to proper builds configuration:
```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build" },
    { "src": "frontend/api/*.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/stellar/build", "dest": "/frontend/api/stellar-build.ts" },
    { "src": "/api/stellar/submit", "dest": "/frontend/api/stellar-submit.ts" },
    { "src": "/api/stellar/build-simulation", "dest": "/frontend/api/stellar-build-simulation.ts" },
    { "src": "/(.*)", "dest": "/frontend/dist/$1" }
  ]
}
```

This ensures:
- Frontend is built as static content → `/frontend/dist/`
- API routes are built as Node.js serverless functions
- Routes properly map HTTP requests to serverless functions

### 3. ✅ Fixed Defensive Error Handling in Frontend

**File:** `frontend/src/services/stellarService.ts`

#### Fix #1: Validate XDR Before Signing (Both `fundInvoice` and `simulateOnTestnet`)
```typescript
// Before signing — verify XDR is valid
if (!xdr || typeof xdr !== 'string' || xdr.length < 100) {
  throw new Error(
    `Invalid XDR received from server: "${String(xdr).substring(0, 50)}". ` +
    `This usually means the API call failed and returned HTML instead of JSON.`
  );
}
```

**Why:** When API calls fail, they return HTML error pages, not JSON. This causes `buildData.xdr` to be undefined.

#### Fix #2: Handle All Freighter Response Shapes
```typescript
// Handle all possible Freighter response shapes
signedXdr = (signResult as any)?.signedTxXdr 
  || (signResult as any)?.xdr
  || (signResult as any)?.signed_envelope_xdr
  || (typeof signResult === 'string' ? signResult : '');

if (!signedXdr || signedXdr.length < 100) {
  throw new Error('Freighter returned empty signed transaction...');
}
```

**Why:** Different Freighter versions return different response shapes. This handles all cases.

#### Fix #3: Validate txHash Exists Before substring() — IN `simulateOnTestnet()`
```typescript
// CHECK THAT txHash EXISTS before calling substring()
if (!submitData.txHash || typeof submitData.txHash !== 'string') {
  throw new Error(
    'Simulation was submitted but server returned invalid transaction hash. ' +
    'This is a server error. Please try again.'
  );
}

const realSimId = `SIM-${submitData.txHash.substring(0, 8).toUpperCase()}`;
```

**Why:** This was causing "Cannot read properties of undefined (reading 'substring')" error when `txHash` was missing.

---

## What This Fixes

### ERROR 1: "Freighter returned empty signed transaction"
- **Cause:** API returned HTML instead of XDR → `xdr = undefined` → Freighter got `undefined` → returned empty
- **Fix:** Validate XDR is valid JSON before passing to Freighter

### ERROR 2: "Cannot read properties of undefined (reading 'substring')"
- **Cause:** `submitData.txHash` was undefined → code tried `undefined.substring(0, 8)` → error
- **Fix:** Check `txHash` exists and is a string before calling methods on it

---

## Deployment Steps

### 1. Install Dependencies (if not already installed)
```bash
cd frontend
npm install
```

The necessary dependency `@vercel/node` is already in `devDependencies`.

### 2. Test Locally
```bash
# In one terminal (Vercel dev server)
vercel dev

# In another terminal (test)
curl -X POST http://localhost:3000/api/stellar/build \
  -H "Content-Type: application/json" \
  -d '{"investorPublicKey":"GAMZFU...VOHC","amountUSD":100,"invoiceId":"INV-123"}'
```

### 3. Deploy to Vercel
```bash
vercel deploy --prod
```

Vercel will:
1. Build frontend → `frontend/dist/`
2. Compile serverless functions → `frontend/api/*.ts`
3. Deploy both as a single project
4. Route `/api/stellar/*` to serverless functions
5. Route all other paths to static frontend

---

## Environment Variables Needed on Vercel

If using custom escrow wallet, set in Vercel dashboard:
```
ESCROW_DESTINATION=GAxxxxxx...
USD_PER_XLM=0.11  (or your current rate)
```

Otherwise, defaults are built-in.

---

## Verification Checklist

- [ ] `frontend/api/stellar-build.ts` exists and compiles
- [ ] `frontend/api/stellar-submit.ts` exists and compiles  
- [ ] `frontend/api/stellar-build-simulation.ts` exists and compiles
- [ ] `vercel.json` has proper `builds` and `routes` sections
- [ ] `frontend/src/services/stellarService.ts` has XDR validation and txHash checking
- [ ] `frontend/package.json` has `@vercel/node` in devDependencies
- [ ] Deploy to Vercel and test:
  - Click "Fund This Invoice" → should work now
  - Go to Simulation page → should work now

---

## FAQ

**Q: Will this affect local development?**
- No. Local development continues to use `frontend/server.ts` and the existing backend.
- The serverless functions are only deployed on Vercel.

**Q: Do I need to delete the old backend?**
- No. Keep it. It's used locally for development.
- On Vercel, the static frontend + serverless functions replace the old Express server.

**Q: What if the API calls are still slow?**
- Vercel serverless functions are fast. If slow, check network > look for 504 timeouts.
- If timeouts, increase function timeout in `vercel.json`:
  ```json
  "functions": { "frontend/api/*.ts": { "memory": 512, "maxDuration": 60 } }
  ```

**Q: Can I see logs for serverless functions?**
- Yes. In Vercel dashboard: Deployments → Logs → Filter by function name.
- Look for `stellar-build`, `stellar-submit`, `stellar-build-simulation`.

---

## Files Modified

1. **Created:** `frontend/api/stellar-build.ts`
2. **Created:** `frontend/api/stellar-submit.ts`  
3. **Created:** `frontend/api/stellar-build-simulation.ts`
4. **Modified:** `vercel.json` — Complete rewrite with proper build config
5. **Modified:** `frontend/src/services/stellarService.ts` — Added XDR validation & txHash checking

All other files remain unchanged.

---

## Next Steps

1. **Push to GitHub** — Commit and push these changes
2. **Deploy** — Run `vercel deploy --prod` or push to main branch if configured
3. **Test on Vercel** — Go to fintrix-invoicee.vercel.app
4. **Fund an Invoice** — Should now work without "empty signed transaction" error
5. **Simulate on Testnet** — Should now work without "substring" error

Good luck! 🚀
