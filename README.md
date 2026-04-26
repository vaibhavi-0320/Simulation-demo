# Fintrix

Fintrix is a Stellar-based Web3 fintech application for invoice-finance simulation. Businesses can create invoice simulations, investors can fund them through the marketplace, and the UI surfaces funding and repayment states while preserving the existing backend APIs, wallet flow, and contract-aware behavior.

## Overview

Fintrix is built as a frontend + API + contract stack:

- `frontend/`: React + Vite application with premium dark UI, Freighter wallet flow, AI assistant, and routed product surfaces
- `backend/`: API handlers and persistence for invoices, transactions, visitor tracking, chat, and AI parsing
- `contracts/`: Soroban Rust contract source for invoice lifecycle logic

## Features

- Invoice simulation
  Create an invoice simulation from uploaded or manually entered data and push it through the existing backend flow.
- Marketplace
  Browse invoice opportunities, filter by status, risk, APY, and duration, then open detailed deal views.
- Funding system
  Connect with Freighter, fund invoices, and trigger repayment while preserving the current backend and smart-contract integration path.
- AI assistant
  Floating assistant with page-aware guidance for dashboard, marketplace, simulation, deal detail, and resources.

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/connect` | Freighter wallet connection |
| `/app` | Dashboard |
| `/simulation` | Guided invoice simulation flow |
| `/marketplace` | Invoice marketplace |
| `/deal/:id` | Deal detail, funding, success, and repayment state |
| `/resources` | Resources and support |

## Smart Contracts

The invalid Stellar Expert page happened because the old README used a placeholder URL:

```text
https://stellar.expert/explorer/testnet/contract/your-contract-id
```

That is not a real contract address, so Stellar Expert correctly rejects it.

This repository does not currently include a real deployed testnet contract ID in tracked environment files. The frontend expects `VITE_STELLAR_CONTRACT_ID` and the backend listener expects `SOROBAN_CONTRACT_ADDRESS`. Until one of those is set to a real deployed contract address, no Stellar Expert contract link can be valid.

| Contract Name | Contract ID Source | Description | Explorer Link |
| --- | --- | --- | --- |
| Invoice Lifecycle Contract | `VITE_STELLAR_CONTRACT_ID` / `SOROBAN_CONTRACT_ADDRESS` | Main Soroban contract for invoice listing, funding, repayment, and cancellation | `https://stellar.expert/explorer/testnet/contract/{real-contract-id}` |


### Contract Source Files

All contract source files are present in `contracts/src/` and can be opened directly from this repository.

| File | Purpose | Open in Repo | Open on GitHub |
| --- | --- | --- | --- |
| `contract.rs` | Main contract implementation: list, fund, repay, cancel, read invoice IDs, and tests | [contracts/src/contract.rs](contracts/src/contract.rs) | [GitHub](https://github.com/vaibhavi-0320/Simulation-demo/blob/main/contracts/src/contract.rs) |
| `errors.rs` | Contract error definitions and error codes | [contracts/src/errors.rs](contracts/src/errors.rs) | [GitHub](https://github.com/vaibhavi-0320/Simulation-demo/blob/main/contracts/src/errors.rs) |
| `lib.rs` | Contract module entry point and public export | [contracts/src/lib.rs](contracts/src/lib.rs) | [GitHub](https://github.com/vaibhavi-0320/Simulation-demo/blob/main/contracts/src/lib.rs) |
| `storage.rs` | Persistent storage helpers and invoice registry functions | [contracts/src/storage.rs](contracts/src/storage.rs) | [GitHub](https://github.com/vaibhavi-0320/Simulation-demo/blob/main/contracts/src/storage.rs) |
| `types.rs` | Shared contract types including `InvoiceState`, `InvoiceStatus`, and storage keys | [contracts/src/types.rs](contracts/src/types.rs) | [GitHub](https://github.com/vaibhavi-0320/Simulation-demo/blob/main/contracts/src/types.rs) |

If you want a working Stellar Expert link, deploy the contract first and then replace the placeholder format with the actual contract address returned by deployment.

## Wallet Integration

- Freighter is the active wallet integration
- Public key retrieval is handled from the live Freighter session
- Wallet state persists in local storage across page navigation
- Missing-wallet and failed-transaction cases are surfaced with non-crashing UI feedback

## Setup

### Prerequisites

- Node.js 22+
- npm 10+
- Freighter wallet extension

### Install

```bash
npm install
```

### Environment

Create `.env` from `.env.example` and configure the values you need for your environment.

Important values:

```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SECURITY_RELAXED_LOCAL=false
SOROBAN_CONTRACT_ADDRESS=
VITE_STELLAR_CONTRACT_ID=
GEMINI_API_KEY=
```

If you are developing locally without Clerk, set:

```bash
VITE_SECURITY_RELAXED_LOCAL=true
SECURITY_RELAXED_LOCAL=true
```

### Run the frontend

```bash
npm run dev
```

### Build the frontend

```bash
npm run build
```

### Run contract tests

```bash
npm run contract:test
```

## Explorer Links in UI

The premium frontend exposes Stellar Expert contract links using this format:

```text
https://stellar.expert/explorer/testnet/contract/{contractId}
```

If `VITE_STELLAR_CONTRACT_ID` is not configured, the UI shows the contract reference as unavailable instead of breaking the page.

## Notes

- The loading screen is preserved.
- Existing backend invoice, funding, repayment, AI parsing, and chat calls remain intact.
- The UI replacement intentionally avoids changing the underlying API structure or wallet connection logic.
