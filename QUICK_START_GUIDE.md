# Quick Start Guide - Frontend Stellar Transactions

## What Was Fixed
The app was stuck on "Waiting for Freighter..." because backend calls timed out. Now all Stellar transactions happen in the browser.

## How to Run

### 1. Start the Frontend
```bash
cd frontend
npm run dev
```
The app will start on `http://localhost:5173`

### 2. Connect Freighter Wallet
- Click "Connect Wallet" or "Launch App"
- Select "Freighter"
- Approve the connection in Freighter extension
- Make sure Freighter is set to **TESTNET**

### 3. Test Fund Invoice
1. Go to **Marketplace** tab
2. Click any deal card
3. Enter amount (e.g., 100)
4. Click **"FUND THIS INVOICE"**
5. **Freighter popup should open within 2-3 seconds**
6. Click "Approve" in Freighter
7. Transaction hash appears on screen
8. Click explorer link to verify on Stellar testnet

### 4. Test Simulation
1. Go to **Simulation** tab
2. Select a deal from dropdown
3. Enter amount (e.g., 1000)
4. Click **"Simulate on Testnet ▷"**
5. **Freighter popup should open within 2-3 seconds**
6. Click "Approve" in Freighter
7. Simulation result appears with transaction hash

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/services/stellarTransactions.ts` | Frontend-only Stellar logic (NEW) |
| `frontend/src/components/DealDetailView.tsx` | Fund invoice handler (UPDATED) |
| `frontend/src/components/SimulationFlow.tsx` | Simulation handler (UPDATED) |

## How It Works

### Before (Broken)
```
User clicks "Fund" 
  → Frontend calls backend /api/stellar/build
  → Backend times out (408)
  → Freighter never opens
  → User stuck forever
```

### After (Fixed)
```
User clicks "Fund"
  → Frontend builds transaction locally
  → Frontend calls signTransaction() from Freighter
  → Freighter popup opens immediately (2-3 seconds)
  → User approves
  → Frontend submits to Horizon
  → Transaction hash returned
  → Backend records it (optional)
```

## Troubleshooting

### Freighter doesn't open
- Make sure Freighter is installed and unlocked
- Make sure Freighter is set to **TESTNET** (not mainnet)
- Make sure you approved this site in Freighter settings
- Check browser console for errors

### Transaction fails
- Make sure wallet has at least 2 XLM for fees
- Make sure you clicked "Approve" (not "Decline")
- Check Stellar testnet status at https://stellar.expert/explorer/testnet

### "Freighter wallet not connected"
- Click "Connect Wallet" first
- Select "Freighter"
- Approve in Freighter extension

## Testing Checklist

- [ ] Freighter opens within 2-3 seconds when clicking "Fund"
- [ ] Freighter opens within 2-3 seconds when clicking "Simulate"
- [ ] Transaction hash appears after approval
- [ ] Explorer link works
- [ ] No "408 timeout" errors
- [ ] No "Waiting for Freighter..." forever

## Environment

- **Network:** Stellar Testnet
- **Horizon:** https://horizon-testnet.stellar.org
- **XLM Rate:** ~$0.11 per XLM
- **Base Fee:** 0.01 XLM

## Support

If something doesn't work:
1. Check browser console (F12 → Console tab)
2. Check Freighter extension logs
3. Verify Freighter is on TESTNET
4. Try refreshing the page
5. Try disconnecting and reconnecting wallet
