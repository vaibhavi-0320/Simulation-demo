export const WALLET_OPTIONS = [
    {
        id: "freighter",
        name: "Freighter",
        description: "Direct browser extension connection for Stellar testnet accounts.",
        accent: "from-sky-500 to-cyan-400",
        mode: "extension",
    },
    {
        id: "albedo",
        name: "Albedo",
        description: "Bridge-ready wallet flow with secure public-key onboarding.",
        accent: "from-amber-400 to-orange-500",
        mode: "bridge",
    },
    {
        id: "phyto",
        name: "Phyto Wallet",
        description: "Manual bridge option for external wallet flows and partner SDKs.",
        accent: "from-emerald-400 to-teal-500",
        mode: "manual",
    },
    {
        id: "demo",
        name: "Demo Wallet",
        description: "Instant sandbox mode for judging, demos, and product walkthroughs.",
        accent: "from-fuchsia-500 to-rose-500",
        mode: "manual",
    },
];
export const LEADERBOARD_DATA = [
    { rank: 1, name: "Ayush Patil", tag: "Cross-Border Alpha", roi: "+42.1%", totalReturns: "$210,000", deals: 142 },
    { rank: 2, name: "Mrunal Desai", tag: "Seed Capital Desk", roi: "+38.8%", totalReturns: "$184,000", deals: 128 },
    { rank: 3, name: "Durvesh Kadam", tag: "Protocol Lab", roi: "+34.1%", totalReturns: "$141,000", deals: 115 },
    { rank: 4, name: "Gayatri Joshi", tag: "Trade Finance Guild", roi: "+31.2%", totalReturns: "$98,000", deals: 94 },
    { rank: 5, name: "Arna Mehta", tag: "Fintrix Veteran", roi: "+29.8%", totalReturns: "$87,000", deals: 87 },
];
export const PRODUCT_PILLARS = [
    {
        title: "AI Invoice Intelligence",
        body: "Extracts buyer, due date, amount, and market notes from uploaded invoices before listing.",
    },
    {
        title: "Soroban Escrow Core",
        body: "Rust contracts govern create, fund, repay, and audit-safe status transitions for every deal.",
    },
    {
        title: "XLM Settlement Rails",
        body: "Funding and repayment flows are modeled as Stellar-native movements with clear portfolio impact.",
    },
    {
        title: "Gamified Finance UX",
        body: "Leaderboards, role play, rewards, and progress loops turn trade finance into an approachable simulation.",
    },
];
export const ARCHITECTURE_LAYERS = [
    "Stitch-inspired React frontend for hero, upload, and market flows",
    "Node/Vercel API routes for invoice lifecycle, AI parsing, and demo persistence",
    "Soroban Rust escrow contract for safe state transitions",
    "Stellar testnet wallet access through Freighter plus Albedo and Phyto bridge options",
];
