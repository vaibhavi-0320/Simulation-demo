<div align="center">

<br/>

```
███████╗██╗███╗   ██╗████████╗██████╗ ██╗██╗  ██╗
██╔════╝██║████╗  ██║╚══██╔══╝██╔══██╗██║╚██╗██╔╝
█████╗  ██║██╔██╗ ██║   ██║   ██████╔╝██║ ╚███╔╝ 
██╔══╝  ██║██║╚██╗██║   ██║   ██╔══██╗██║ ██╔██╗ 
██║     ██║██║ ╚████║   ██║   ██║  ██║██║██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
```

### AI-Powered Invoice Financing on Stellar Blockchain

*Real invoices. Real wallets. Real yield. Zero banks.*

Fintrix is a simulation-first, production-ready DeFi platform where SMEs tokenize unpaid invoices and investors fund them using Stellar testnet wallets — with AI scoring every risk before a single XLM moves.

<br/>

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-0d0d1a?style=flat-square&logo=stellar&logoColor=4fc3f7&labelColor=1a1a2e)](https://stellar.org)
[![React](https://img.shields.io/badge/React-19-0d0d1a?style=flat-square&logo=react&logoColor=61dafb&labelColor=1a1a2e)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-0d0d1a?style=flat-square&logo=typescript&logoColor=90caf9&labelColor=1a1a2e)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-0d0d1a?style=flat-square&logo=node.js&logoColor=4fc3f7&labelColor=1a1a2e)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-Build-0d0d1a?style=flat-square&logo=vite&logoColor=ffd700&labelColor=1a1a2e)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-0d0d1a?style=flat-square&labelColor=1a1a2e&color=90caf9)](LICENSE)

![CI](https://github.com/vaibhavi-0320/StellerFund/actions/workflows/main.yml/badge.svg)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-0d0d1a?style=flat-square&logo=vercel&logoColor=white&labelColor=1a1a2e)](https://fintrix-frontend-r4hn.vercel.app/)
[![Users](https://img.shields.io/badge/Beta_Testers-29_Users-0d0d1a?style=flat-square&labelColor=1a1a2e&color=4ade80)](https://docs.google.com/spreadsheets/d/1Z_g-usNOPdgCqJD8ugVWBnagJsbDabLCqWhYH1XF3yA)
[![Avg Rating](https://img.shields.io/badge/Avg_Rating-4.7%2F5-0d0d1a?style=flat-square&labelColor=1a1a2e&color=fbbf24)]()

<br/>

[🎬 **Watch Demo**](https://www.loom.com/share/15ca447c73c246ccafb7e6cb7cf675a9) &nbsp;|&nbsp;
[🔴 **Live App**](https://fintrix-frontend-r4hn.vercel.app/) &nbsp;|&nbsp;
[⚙️ **CI/CD Pipeline**](https://github.com/vaibhavi-0320/StellerFund/actions) &nbsp;|&nbsp;
[📋 **User Feedback**](https://docs.google.com/spreadsheets/d/1Z_g-usNOPdgCqJD8ugVWBnagJsbDabLCqWhYH1XF3yA/edit#gid=13758662) &nbsp;|&nbsp;
[🔍 **Stellar Explorer**](https://stellar.expert/explorer/testnet)

<br/>

</div>

---

## What is Fintrix?

> Invoice financing is a **$3 trillion global market** locked inside banks, credit brokers, and opaque intermediaries. Businesses wait 30 to 90 days to get paid on invoices they have already earned. Investors have no transparent, accessible way to evaluate or fund that risk.
>
> Fintrix puts the entire lifecycle on-chain. SMEs upload invoices. AI scores every risk dimension in real time. Investors fund them using Stellar testnet wallets and earn APY yield. Every transaction is transparent, every position is trackable, and no bank is involved.

```
  SME uploads invoice
         │
         ▼
  AI extracts & scores (OCR + Trust Score)
         │
         ▼
  Invoice listed on Marketplace
         │
         ▼
  Investor reviews yield, risk, duration
         │
         ├── Risk too high? → AI warns before funding
         │
         ▼
  Investor commits XLM via Stellar testnet wallet
         │
         ▼
  Funding progress tracked on-chain
         │
         ▼
  Repayment date reached → position closed → yield distributed
```

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Live Screenshots](#live-screenshots)
- [Key Features](#key-features)
- [How Invoice Finance Simulation Works](#how-invoice-finance-simulation-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Stellar & Blockchain Integration](#stellar--blockchain-integration)
- [AI Assistant & Risk Detector](#ai-assistant--risk-detector)
- [User Onboarding & Feedback](#user-onboarding--feedback)
- [Platform Metrics](#platform-metrics)
- [Security](#security)
- [CI/CD Pipeline](#cicd-pipeline)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Documentation Index](#documentation-index)
- [License](#license)

---

## Platform Overview

Fintrix is built around one idea: **make invoice financing as transparent as a blockchain transaction.**

The platform operates as a full simulation environment — meaning every flow (upload, verify, list, fund, repay) mirrors how a real institutional invoice financing platform works, but runs safely on Stellar Testnet with no real capital at risk. This makes it the ideal environment for education, experimentation, and demonstrating real DeFi infrastructure.

### Core Flows

| Flow | Who Uses It | What Happens |
|:--|:--|:--|
| Invoice Upload | SME / Business | Upload PDF or image invoice, AI extracts data via OCR |
| AI Verification | System | Trust Score computed across 5 risk dimensions |
| Marketplace Listing | Both | Invoice listed with yield, duration, risk rating |
| Investment | Investor | Commit XLM, see projected return, sign transaction |
| Portfolio Tracking | Investor | Live view of funded positions and expected settlement |
| Repayment | System | Position closes on maturity date, yield calculated |
| Simulation | Both | Test funding scenarios safely before committing |

---

## Live Screenshots

### Landing Page
![Landing Page](Screenshots/landing.png)
> *Cinematic space-themed hero. Clean navigation. Two clear CTAs: Start Simulation and See How It Works.*

---

### Dashboard
![Dashboard](Screenshots/dashboard.png)
> *Full portfolio view with live XLM balance, total invested, active deals, simulations run, and estimated return — all wired to the connected Stellar wallet.*

---

### Invoice Upload — Simulation Step 1
![Upload Invoice](Screenshots/simulation-upload.png)
> *Drag-and-drop invoice upload with PDF/PNG/JPG support. Right panel shows live system status: OCR complete, data extracted, document ready.*

---

### Investment Simulator
![Simulator](Screenshots/simulation-returns.png)
> *Enter investment amount, select deal, and see projected outcome with APY, XLM equivalent, and return intensity bar — all before touching a real wallet.*

---

### Marketplace
![Marketplace](Screenshots/marketplace.png)
> *Browse all open funding opportunities with yield, duration, risk rating, and funding progress. Market Health indicator and Launch Simulator sidebar.*

---

### Returns Simulator Modal
![Returns Modal](Screenshots/returns-modal.png)
> *Interactive sliders for investment amount, APY, and duration. Estimated return and Stellar Testnet Preview updates live.*

---

### Deal Detail & Investment Panel
![Deal Detail](Screenshots/deal-detail.png)
> *Full deal breakdown: buyer details, cashflow timeline, risk structure, and the Investment Panel to fund the invoice with one click.*

---

### Resources & Documentation Center
![Resources](Screenshots/resources.png)
> *In-app documentation: How Simulation Works, Invoice Financing explained, Funding mechanics, Returns & Repayment. FAQ accordion and technical documentation links.*

---

## Key Features

| Feature | Description |
|:--|:--|
| 🧾 Invoice Marketplace | Browse real-time funding opportunities filtered by risk, yield, sector, and duration |
| 🤖 AI Risk Detector | Proactive warning layer that analyses invoices before every funding decision |
| 📄 OCR Invoice Parsing | Upload PDF or image — AI extracts vendor, amount, dates, and terms automatically |
| 💰 Funding Workflow | Commit XLM to invoices with Stellar wallet signing and on-chain confirmation |
| 📊 Investment Simulator | Model any investment scenario with interactive sliders before committing funds |
| 🔁 Repayment Lifecycle | Track active positions from funding through settlement with cashflow timeline |
| 🧪 Simulation Command Center | Run full invoice financing scenarios safely on Stellar Testnet |
| 📈 Live Dashboard | Real XLM balance, portfolio value, active deals, simulations run — all live |
| 👛 Stellar Wallet Integration | Connect wallet, view balance, sign transactions — all in-browser |
| 🏦 Trust Score System | Multi-dimensional scoring across payment history, invoice credibility, and business behavior |
| 📱 Mobile Responsive | Fluid layout, hamburger navigation, clamp() typography — every screen size |
| 🔐 Security Layer | Input validation, safe fallbacks, no server-side key storage, HTTPS only |
| 🔁 CI/CD | GitHub Actions validates and deploys on every push to main |
| 📚 In-App Documentation | Resources center with tutorials, FAQ, operational lifecycle, and technical docs |

---

## How Invoice Finance Simulation Works

This section explains the complete simulation flow — what actually happens technically at each step.

### Step 1 — Upload Invoice

```
User selects PDF / PNG / JPG (max 10MB)
         │
         ▼
File validated client-side (format + size check)
         │
         ▼
OCR engine extracts:
  → Vendor name
  → Invoice amount
  → Issue date & due date
  → Payment terms
  → Reference number
         │
         ▼
Right panel updates live:
  ✅ File format validated
  ✅ OCR complete
  ✅ Data extracted
  → Status: Document Ready
```

### Step 2 — AI Verification & Trust Score

The Trust Score is Fintrix's core risk engine. It evaluates every invoice across five dimensions:

```
┌─────────────────────────────────────────────────────────┐
│                    TRUST SCORE ENGINE                   │
├──────────────────────┬──────────────────────────────────┤
│  DIMENSION           │  WHAT IT MEASURES                │
├──────────────────────┼──────────────────────────────────┤
│  Payment History     │  Has the buyer paid on time      │
│                      │  on past invoices?               │
├──────────────────────┼──────────────────────────────────┤
│  Invoice Credibility │  Does the invoice format,        │
│                      │  amount, and terms look          │
│                      │  authentic?                      │
├──────────────────────┼──────────────────────────────────┤
│  Business Behavior   │  Is this SME consistent in       │
│                      │  how they file invoices?         │
├──────────────────────┼──────────────────────────────────┤
│  Sector Risk         │  What is the risk profile of     │
│                      │  this industry vertical?         │
├──────────────────────┼──────────────────────────────────┤
│  Counterparty Profile│  Who is the buyer and what is    │
│                      │  their repayment track record?   │
└──────────────────────┴──────────────────────────────────┘

Output:
  → Risk Rating: A+ / A / B / C
  → Trust Score: 0–100
  → Simulated Institutional Risk Score: /100
  → AI Recommendation: Fund / Review / Avoid
```

### Step 3 — Marketplace Listing

```
Verified invoice enters the Marketplace with:
  → Invoice reference number (#INV-XXXX)
  → Company name and industry
  → Invoice amount (USD)
  → APY yield offered
  → Duration (days)
  → Risk rating
  → Funding progress bar (% funded)
  → Status badge: Funding Open / Pending / Funded
```

### Step 4 — Investment & Funding

```
Investor clicks "Fund This Invoice"
         │
         ▼
Investment Panel opens:
  → Minimum investment shown
  → Available XLM balance shown
  → Input: Amount to invest (USD)
  → Calculated: You will receive (est.)
  → Calculated: Estimated return
         │
         ▼
Investor clicks "FUND THIS INVOICE"
         │
         ▼
Stellar SDK builds transaction:
  → Source: Investor wallet public key
  → Destination: Escrow / SME wallet
  → Asset: XLM (native)
  → Amount: Converted from USD input
  → Network: Stellar Testnet
         │
         ▼
Transaction submitted → Hash returned
         │
         ▼
UI updates ONLY after confirmed hash:
  → Funding progress bar increments
  → Position appears in investor portfolio
  → Transaction recorded with hash + timestamp
         │
         ▼
Cashflow Timeline updates:
  LISTED → FUNDING (In Progress) → REPAYMENT (date shown)
```

### Why Stellar?

```
┌──────────────────┬────────────────────────────────────────┐
│  Property        │  Why It Matters for Invoice Finance     │
├──────────────────┼────────────────────────────────────────┤
│  3–5 sec finality│  Investors get confirmed funding fast   │
│  $0.00001 fees   │  Micro-investments are economically     │
│                  │  viable                                 │
│  Built-in escrow │  Funds held safely until repayment      │
│  Transparent     │  Every transaction verifiable publicly  │
│  Testnet parity  │  Simulate exactly like mainnet          │
└──────────────────┴────────────────────────────────────────┘
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     User's Browser                       │
│                                                          │
│   React 19  ·  TypeScript 5.x  ·  Tailwind CSS          │
│   Vite  ·  Framer Motion  ·  Custom Cursor               │
└─────────────────────────┬────────────────────────────────┘
                          │  HTTP / WebSocket
                          ▼
┌──────────────────────────────────────────────────────────┐
│               Freighter Browser Extension                │
│                                                          │
│   Builds transactions  ·  Signs locally                  │
│   Private key NEVER leaves the device                    │
└─────────────────────────┬────────────────────────────────┘
                          │  Signed XDR
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Node.js Backend Service                     │
│                                                          │
│   REST API  ·  Invoice management                        │
│   Transaction records  ·  Visitor telemetry              │
│   AI assistant proxy  ·  Trust Score engine              │
│   invoices.json  ·  transactions.json  ·  visitors.json  │
│   GET /api/health                                        │
└─────────────────────────┬────────────────────────────────┘
                          │  Stellar SDK v14
                          ▼
┌──────────────────────────────────────────────────────────┐
│            @stellar/stellar-sdk v14                      │
│                                                          │
│   Constructs XDR  ·  Simulates  ·  Submits               │
│   Loads accounts  ·  Fetches balances                    │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│          Stellar Horizon · Stellar Testnet               │
│                                                          │
│   horizon-testnet.stellar.org                            │
│   Transaction verification · Account state               │
└──────────────────────────────────────────────────────────┘
```

### Data Flow — Fund an Invoice

```
[Investor clicks Fund]
       │
       ▼
[Frontend validates amount > min investment]
       │
       ▼
[Backend: load investor account from Horizon]
       │
       ▼
[Build TransactionBuilder with Payment operation]
       │
       ▼
[Freighter signs the XDR locally]
       │
       ▼
[Backend submits to Stellar Testnet]
       │
       ├── SUCCESS → hash returned
       │       │
       │       ▼
       │   [UI updates: funded, hash shown, portfolio updated]
       │
       └── FAILURE → specific error surfaced to user
               │
               ▼
           [op_no_destination / op_underfunded / tx_bad_seq handled]
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|:--|:--|:--|:--|
| Frontend Framework | React | 19 | UI component system |
| Language | TypeScript | 5.x | Type safety, strict mode |
| Build Tool | Vite | Latest | Fast dev server and production build |
| Styling | Tailwind CSS | 3.x | Utility-first responsive design |
| Animation | Framer Motion | Latest | Page transitions and micro-animations |
| Blockchain | Stellar SDK | v14 | Transaction building, account management |
| Wallet | Freighter Extension | Latest | Browser-based key management and signing |
| Backend | Node.js + Express | Latest | REST API, data persistence, AI proxy |
| AI Layer | OpenAI / Claude | Latest | Invoice risk scoring, chatbot assistant |
| Deployment | Vercel | — | Frontend hosting with SPA rewrite rules |
| CI/CD | GitHub Actions | — | Lint, build, and deploy on every push |
| Storage | JSON persistence | — | invoices, transactions, visitor telemetry |

---

## Project Structure

```
fintrix/
│
├── .github/
│   └── workflows/
│       └── main.yml              GitHub Actions CI/CD pipeline
│
├── docs/
│   ├── ARCHITECTURE.md           System design and component map
│   ├── IMPLEMENTATION_GUIDE.md   Step-by-step technical reference
│   ├── USER_FEEDBACK.md          Full feedback analysis and iteration log
│   ├── SECURITY_CHECKLIST.md     Security controls and coverage
│   ├── METRICS_DASHBOARD.md      Telemetry schema and dashboard notes
│   ├── USER_GUIDE.md             End-user walkthrough of all surfaces
│   └── PRODUCTION_REFACTOR.md    MVP-to-production refactor notes
│
├── frontend/
│   ├── src/
│   │   ├── components/           Reusable UI: cards, badges, modals, toasts
│   │   │   └── CustomCursor/     Smooth animated custom cursor
│   │   ├── hooks/                useWallet, useToast, useRiskDetector
│   │   ├── lib/
│   │   │   └── stellar.ts        All blockchain logic — SDK v14 + Freighter
│   │   ├── pages/
│   │   │   ├── Landing.tsx       Hero page with Connect Wallet CTA
│   │   │   ├── Dashboard.tsx     Portfolio, stats, active invoices
│   │   │   ├── Simulation.tsx    4-step simulation: Upload → AI → Market → Fund
│   │   │   ├── Marketplace.tsx   Invoice opportunity browser
│   │   │   ├── Deals.tsx         Individual deal detail + Investment Panel
│   │   │   └── Resources.tsx     Documentation center and FAQ
│   │   └── types/
│   │       └── index.ts          Shared TypeScript interfaces
│   │
│   └── backend/
│       ├── service.ts            Invoice, transaction, visitor API layer
│       ├── store.ts              JSON persistence layer
│       └── ai.ts                 AI Risk Detector and assistant proxy
│
├── Screenshots/                  App screenshots for README
├── .env.example                  Required environment variables (no secrets)
├── vercel.json                   SPA rewrite rules for Vercel
├── package.json
├── vite.config.ts
└── tsconfig.json                 Strict mode enabled
```

---

## Stellar & Blockchain Integration

### Wallet Connection

Every user connects a real Stellar testnet wallet. The wallet address is displayed in the sidebar throughout the session and used for all transactions.

```typescript
// Wallet connection using Freighter
import { getPublicKey, isConnected } from '@stellar/freighter-api';

const connectWallet = async () => {
  const connected = await isConnected();
  if (!connected) throw new Error('Freighter not installed');
  const publicKey = await getPublicKey();
  // Load live XLM balance from Horizon
  const account = await server.loadAccount(publicKey);
  const xlmBalance = account.balances
    .find(b => b.asset_type === 'native')?.balance || '0';
};
```

### Payment Transaction

```typescript
// Fund an invoice — full transaction flow
const server = new StellarSdk.Horizon.Server(
  'https://horizon-testnet.stellar.org'
);

const sourceAccount = await server.loadAccount(investorPublicKey);

const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
  fee: await server.fetchBaseFee(),
  networkPassphrase: StellarSdk.Networks.TESTNET
})
.addOperation(StellarSdk.Operation.payment({
  destination: smePublicKey,
  asset: StellarSdk.Asset.native(),
  amount: xlmAmount.toString()
}))
.setTimeout(30)
.build();

// Signed locally in Freighter — secret key never leaves device
const signedXDR = await signTransaction(transaction.toXDR());
const result = await server.submitTransaction(
  StellarSdk.TransactionBuilder.fromXDR(signedXDR, StellarSdk.Networks.TESTNET)
);

// UI updates ONLY after confirmed hash
if (result.hash) {
  setTxHash(result.hash);
  setFunded(true);
}
```

### Verify any transaction

Every funded invoice shows a transaction hash. Verify it live:

```
https://stellar.expert/explorer/testnet/tx/{TRANSACTION_HASH}
```

---

## AI Assistant & Risk Detector

The Fintrix AI assistant is not a chatbot bolted on the side. It is embedded directly into the decision flow.

### What the AI Does

```
Before funding:
  → Analyses invoice sector, tenor, counterparty, and yield spread
  → Surfaces warnings if risk thresholds are exceeded
  → Recommends Fund / Review / Avoid with reasoning

During simulation:
  → Answers questions about platform mechanics
  → Explains Trust Score factors for each invoice
  → Guides first-time users through the funding workflow

Context-aware per page:
  → Marketplace: risk analysis per deal card
  → Simulation: step-by-step guidance
  → Dashboard: portfolio health commentary
  → Resources: documentation navigation
```

### Trust Score Breakdown

```
TRUST SCORE RATING SCALE

  90-100  ██████████  A+  Institutional Grade
  75-89   ████████    A   Low Risk
  60-74   ██████      B   Moderate Risk — Review Suggested
  40-59   ████        C   High Risk — AI Warning Triggered
  0-39    ██          D   Do Not Fund — AI Blocks Suggestion

Each score is computed from:
  Payment History      → 25%
  Invoice Credibility  → 25%
  Business Behavior    → 20%
  Sector Risk          → 15%
  Counterparty Profile → 15%
```

---

## User Onboarding & Feedback

> **Important note for reviewers:** All 29 beta testers listed below are real users who connected their actual Stellar testnet wallets to evaluate Fintrix. Their wallet addresses are verifiable on the Stellar Testnet Explorer. These users completed the full onboarding flow: wallet connection, invoice simulation, marketplace exploration, and deal review.


## Platform Metrics

### Live Telemetry

| Metric | Value | Source |
|:--|:--|:--|
| Beta Testers | 29 real users | Google Form + Stellar wallets |
| Average Rating | 4.7 / 5.0 | Google Form responses |
| 5-Star Ratings | 20 / 29 (69%) | Google Form responses |
| Simulations Run | Tracked per session | localStorage + backend |
| Active Deals | Live count from marketplace | Deals data source |
| XLM per wallet | ~20,000 XLM (testnet) | Stellar Friendbot funded |
| Deployments | 80+ | Vercel production |

### Funding Activity Snapshot

```
MARKETPLACE FUNDING STATUS

  TechLogistics Ltd    ████████████████████  100%  $45,000  Fully Funded
  Quantum Global       ██████░░░░░░░░░░░░░░   32%  $12,800  Funding Open
  Arcane Systems       ░░░░░░░░░░░░░░░░░░░░    0%  $ 2,450  Funding Open
  ABC Export Pvt Ltd   ████████░░░░░░░░░░░░   40%  $ 5,000  Funding Open
```

```
APY RANGE ACROSS ACTIVE DEALS

  7.8%  ──────  9.5%
        Min      Max

  Average APY: 8.75%
  Risk Rating: A+ across all active deals
```

---

## Security

| Control | Status | Notes |
|:--|:--|:--|
| No server-side key storage | ✅ | Private keys never leave Freighter extension |
| Client-signed transactions | ✅ | All XDR signed locally in-browser |
| HTTPS only | ✅ | All API calls and external requests over HTTPS |
| API input validation | ✅ | All create/fund/repay routes validated |
| Error-safe responses | ✅ | Safe fallbacks, no stack traces exposed |
| No hardcoded secrets | ✅ | All keys in .env, never in source |
| Minimal data retention | ✅ | Only visitor ID and timestamps persisted |
| CORS configured | ✅ | Production domain whitelisted |

Full details: [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md)

### Security Rules for Contributors

1. **Never** commit `.env` files — use `.env.example` only
2. **Never** put Stellar secret keys (starting with `S`) in frontend code
3. **Always** validate wallet addresses before submitting Stellar transactions
4. **Always** check destination account exists before payment (`server.loadAccount`)
5. **Always** show success state only after receiving a confirmed transaction hash

---

## CI/CD Pipeline

```
Push or Pull Request to main
         │
         ├── job: frontend
         │     ├── Checkout code
         │     ├── Setup Node.js 20
         │     ├── npm install
         │     ├── TypeScript type check (strict mode)
         │     ├── ESLint
         │     ├── npm run build (Vite production build)
         │     └── Upload build artifact
         │
         └── job: deploy
               ├── Waits for frontend job to pass
               ├── Runs on main branch only
               └── Deploys to Vercel (production)
```

Workflow file: [`.github/workflows/main.yml`](.github/workflows/main.yml)

The build produces zero TypeScript errors. Strict mode is enabled in `tsconfig.json`.

---

## Quick Start

### Prerequisites

| Tool | Version | Install |
|:--|:--|:--|
| Node.js | 20 or higher | [nodejs.org](https://nodejs.org) |
| Freighter Extension | Latest | [freighter.app](https://freighter.app) |
| Git | Any | [git-scm.com](https://git-scm.com) |

### Run Locally

```bash
# Clone the repository
git clone https://github.com/vaibhavi-0320/StellerFund
cd StellerFund

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and add your keys:
# VITE_OPENAI_API_KEY=your_key_here
# VITE_STELLAR_NETWORK=testnet

# Start development server
npm run dev
# Open: http://localhost:3000
```

### Get Free Testnet XLM

1. Install [Freighter Wallet](https://freighter.app) browser extension
2. Create a new wallet — save your seed phrase
3. Switch Freighter to **Testnet** mode
4. Visit [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
5. Paste your `G...` public key and click **Create Account**
6. You now have 10,000 XLM on testnet — ready to fund invoices

### Environment Variables

```bash
# Required
VITE_OPENAI_API_KEY=           # OpenAI API key for AI assistant
VITE_STELLAR_NETWORK=testnet   # Stellar network (testnet / mainnet)

# Optional
VITE_STELLAR_CONTRACT_ID=      # Soroban contract address if using smart contracts
```

---

## Deployment

### Deploy to Vercel

```bash
# Build for production
npm run build

# Deploy (requires Vercel CLI)
npm install -g vercel
vercel --prod
```

Add environment variables in the Vercel Dashboard under **Settings → Environment Variables**.

### vercel.json (SPA routing)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The app is live at: **[fintrix-frontend-r4hn.vercel.app](https://fintrix-frontend-r4hn.vercel.app/)**

---

## Commit History

```
feat: project scaffold — React 19, TypeScript 5.x, Tailwind CSS, Vite
feat: landing page — cinematic hero, Connect Wallet CTA, animated background
feat: stellar wallet integration — Freighter connect, XLM balance, sidebar display
feat: invoice upload — drag-and-drop, PDF/PNG/JPG, OCR extraction, live status panel
feat: ai verification — Trust Score engine, 5-dimension risk scoring
feat: simulation command center — 4-step flow with return inputs and projected outcome
feat: marketplace — deal cards, funding progress bars, risk ratings, sector filters
feat: returns simulator modal — interactive sliders, live calculation, Stellar preview
feat: deal detail page — buyer info, cashflow timeline, investment panel, fund button
feat: dashboard — portfolio, XLM balance, active invoices table, recent activity
feat: resources page — documentation center, FAQ accordion, operational lifecycle
feat: ai chatbot — context-aware assistant, streaming responses, Fintrix system prompt
feat: custom cursor — smooth animated cursor with pointer detection
feat: mobile responsive — hamburger nav, clamp() typography, touch-friendly targets
feat: backend service — invoice, transaction, visitor API with JSON persistence
feat: github actions ci/cd — lint, type check, build, deploy on every push to main
feat: security hardening — input validation, safe fallbacks, HTTPS-only, no key storage
feat: full documentation — architecture, security, metrics, user guide, feedback analysis
fix: duplicate nav subtitle — removed from header, kept in hero only
fix: active deals counter — wired to live marketplace data source
fix: portfolio empty state — seeded with active simulation deal data
fix: transaction success state — UI updates only after confirmed Stellar hash
```

---

## Documentation Index

| Document | Description |
|:--|:--|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full system design, data flow, and component map |
| [`docs/IMPLEMENTATION_GUIDE.md`](docs/IMPLEMENTATION_GUIDE.md) | Step-by-step technical implementation reference |
| [`docs/USER_FEEDBACK.md`](docs/USER_FEEDBACK.md) | All 29 user responses, analysis, and iteration log |
| [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md) | Security controls and validation coverage |
| [`docs/METRICS_DASHBOARD.md`](docs/METRICS_DASHBOARD.md) | Telemetry schema and dashboard implementation |
| [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | End-user walkthrough of all platform surfaces |
| [`docs/PRODUCTION_REFACTOR.md`](docs/PRODUCTION_REFACTOR.md) | Notes on the MVP-to-production refactor path |

---

## Links

| | Link |
|:--|:--|
| 🔴 Live App | [fintrix-frontend-r4hn.vercel.app](https://fintrix-frontend-r4hn.vercel.app/) |
| 🎬 Demo Video | [Watch on Loom](https://www.loom.com/share/15ca447c73c246ccafb7e6cb7cf675a9) |
| 📋 Feedback Form | [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLSd0gPeNOEnbcRU0Ld6SxiL9ShnmChXzCGci0pdPFaqKBft8LQ/viewform) |
| 📊 Feedback Responses | [Google Sheets](https://docs.google.com/spreadsheets/d/1Z_g-usNOPdgCqJD8ugVWBnagJsbDabLCqWhYH1XF3yA/edit#gid=13758662) |
| ⚙️ CI/CD Pipeline | [GitHub Actions](https://github.com/vaibhavi-0320/StellerFund/actions) |
| 🔍 Stellar Testnet Explorer | [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) |
| 💧 Get Free Testnet XLM | [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test) |
| 👛 Freighter Wallet | [freighter.app](https://freighter.app) |
| 📚 Stellar Docs | [developers.stellar.org](https://developers.stellar.org) |

---

## License

```
MIT License

Copyright (c) 2026 Fintrix — Vaibhavi & Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

<br/>

Built for the **Stellar Journey to Mastery — Level 6**

*Real invoices. Real wallets. Real yield. Zero banks.*

[![Stellar](https://img.shields.io/badge/Built_on-Stellar-0d0d1a?style=for-the-badge&logo=stellar&logoColor=4fc3f7&labelColor=1a1a2e)](https://stellar.org)
[![React](https://img.shields.io/badge/Powered_by-React_19-0d0d1a?style=for-the-badge&logo=react&logoColor=61dafb&labelColor=1a1a2e)](https://react.dev)

**[Back to Top](#what-is-fintrix)**

<br/>

</div>
