# Fintrix Architecture & System Design

## Overview
Fintrix is a decentralized, Web3-enabled invoice financing platform built on the Stellar network. It serves as a simulation environment and marketplace where businesses can tokenize invoices for immediate liquidity, and investors can fund these invoices to earn fixed-yield returns. 

The architecture is designed to be highly modular, separating the frontend presentation layer, the backend service orchestration, and the on-chain settlement logic via Soroban Smart Contracts.

## Core Stack

- **Frontend Application**: React, Vite, TypeScript, Tailwind CSS
- **Backend & APIs**: Node.js, Express (Serverless deployment ready for Vercel)
- **Blockchain Layer**: Stellar Network (Horizon API), Soroban Smart Contracts
- **Wallet Integration**: Freighter Extension Integration
- **AI Engine**: Google Gemini API (for automated invoice parsing and risk assessment)

## System Components

### 1. Presentation Layer (Frontend)
The frontend is a single-page application (SPA) optimized for high performance and mobile responsiveness. It handles the user experience for both Borrowers (Invoice Sellers) and Investors (Funders).
- **Marketplace**: Displays active, tokenized invoices awaiting funding.
- **Simulation Flow**: Allows users to model yield and repayment scenarios before executing on-chain transactions.
- **Dashboard**: Visualizes portfolio health, active deals, APY estimates, and transaction history.
- **AI Assistant**: A contextual chat interface integrated directly into the UX to guide users through DeFi concepts and specific invoice risk profiles.

### 2. Service Layer (Backend APIs)
The backend acts as an orchestration layer, handling metadata that does not need to live on-chain, as well as complex AI processing.
- **Invoice Processing Engine**: Accepts raw invoice data and utilizes the Gemini API to extract key fields (Buyer, Amount, Due Date, Industry) and assign a dynamic Risk Score based on repayment likelihood.
- **Stellar Transaction Builder**: Formats and prepares XDR transactions (e.g., `fund_invoice`, `repay_invoice`) for the frontend to sign.
- **Data Persistence**: Manages the local caching of simulation states, visitor analytics, and off-chain invoice metadata (e.g., `invoices.json`).

### 3. Blockchain Layer (Stellar & Soroban)
The foundation of Fintrix's trustless settlement.
- **Identity & Authentication**: Leverages Freighter wallet for decentralized identity and cryptographic transaction signing.
- **Soroban Contracts**: Smart contracts handle the escrow of funds, yield calculations, and the automated release of capital upon invoice maturity or repayment. 
- **Asset Tokenization**: Invoices are represented as digital assets on the Stellar network, allowing for fractional ownership and instant, low-cost cross-border settlement using XLM and USDC.

## Deployment & Hosting Strategy
The application is structured as a monorepo intended for serverless deployment on platforms like Vercel.

- **Vercel Build Configuration**: The project is configured via `vercel.json` to route API requests to the Express backend while serving the Vite static build for the frontend.
- **Environment Management**: Strict separation of environments (`.env.local` vs `.env.production`) ensures that sensitive keys (Gemini API, Clerk Secrets, Stellar Admin keys) are never exposed to the client bundle.

## Security Considerations
- **Non-Custodial Architecture**: Fintrix never holds investor funds. Capital remains in the user's Freighter wallet until an on-chain escrow transaction is cryptographically signed by the user.
- **Secret Management**: Environment variables are strictly ignored in version control (`.gitignore`) and injected at runtime via Vercel.
- **AI Fallbacks**: If the AI parser fails or encounters malformed data, strict deterministic fallbacks ensure the marketplace does not crash.
