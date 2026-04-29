import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Building2, CheckCircle2, ChevronDown, Code2, Droplets, ExternalLink, FileText, Globe2, KeyRound, Layers3, Lock, Menu, ShieldCheck, Sparkles, Store, TrendingUp, X, Wallet, } from "lucide-react";
import { useCountUp } from "../hooks/useCountUp";
import { usePageSkeleton } from "../hooks/usePageSkeleton";
import { SkeletonLanding } from "./PageSkeletons";
function createRipple(event) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    ripple.style.width = "24px";
    ripple.style.height = "24px";
    ripple.style.borderRadius = "9999px";
    ripple.style.background = "rgba(255,255,255,0.55)";
    ripple.style.pointerEvents = "none";
    ripple.style.opacity = "0";
    ripple.style.transform = "translate(-50%, -50%) scale(0)";
    ripple.style.animation = "fintrix-ripple 500ms ease-out";
    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}
function PillButton({ children, tone, onClick, className, enableRipple, }) {
    function handleClick(event) {
        if (enableRipple) {
            createRipple(event);
        }
        onClick();
    }
    return (_jsxs("button", { type: "button", onClick: handleClick, className: [
            "group relative inline-flex overflow-hidden rounded-full border-[0.6px] border-white/80 bg-transparent p-[1px] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]",
            className ?? "",
        ].join(" "), children: [_jsx("span", { className: "pointer-events-none absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-full bg-white/25 blur-2xl" }), _jsx("span", { className: [
                    "relative z-10 inline-flex items-center justify-center rounded-full px-[20px] py-[10px] text-[14px] font-medium leading-none transition-colors duration-200 sm:px-[29px] sm:py-[11px]",
                    tone === "dark" ? "bg-black text-white" : tone === "light" ? "bg-white text-black" : "bg-black/0 text-white",
                ].join(" "), children: children })] }));
}
function SectionHeading({ label, title, description, }) {
    return (_jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [label ? _jsx("p", { className: "text-[11px] uppercase tracking-[0.28em] text-white/38", children: label }) : null, _jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl", children: title }), description ? _jsx("p", { className: "mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55", children: description }) : null] }));
}
function FeatureCard({ icon: Icon, title, description, accent, }) {
    return (_jsxs("div", { "data-reveal-card": "true", className: "rounded-[24px] border border-white/10 bg-white/[0.02] p-8 transition-all duration-[250ms] ease-[ease] hover:border-white/20 hover:bg-white/[0.04] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: [_jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-xl ${accent}`, children: _jsx(Icon, { size: 18 }) }), _jsx("h3", { className: "mt-6 text-2xl font-semibold text-white", children: title }), _jsx("p", { className: "mt-4 text-sm leading-7 text-white/58", children: description })] }));
}
function CountUpText({ value }) {
    const ref = useRef(null);
    const [triggered, setTriggered] = useState(false);
    const numericMatch = value.match(/\d+(,\d{3})*(\.\d+)?/);
    const rawValue = numericMatch ? Number(numericMatch[0].replace(/,/g, "")) : 0;
    const decimalPart = numericMatch?.[0].split(".")[1];
    const decimals = decimalPart ? decimalPart.length : 0;
    const scale = decimals > 0 ? 10 ** decimals : 1;
    const count = useCountUp(Math.round(rawValue * scale), 1800, triggered);
    useEffect(() => {
        if (!ref.current || !rawValue)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting)
                return;
            setTriggered(true);
            observer.disconnect();
        }, { threshold: 0.35 });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [rawValue]);
    const displayValue = scale > 1 ? (count / scale).toFixed(decimals) : count.toLocaleString();
    const formatted = numericMatch ? value.replace(/\d+(,\d{3})*(\.\d+)?/, displayValue) : value;
    return _jsx("span", { ref: ref, children: formatted });
}
function JourneyStep({ index, title, active, completed, onClick, progressKey, isPaused, }) {
    return (_jsxs("button", { type: "button", onClick: onClick, className: [
            "relative flex min-w-0 flex-1 items-center gap-4 overflow-hidden rounded-full border px-4 py-3 text-left transition-all duration-300",
            active
                ? "border-blue-400/60 bg-blue-500/10 text-white shadow-[0_0_18px_rgba(99,179,237,0.16)]"
                : completed
                    ? "border-blue-400/25 bg-blue-500/[0.05] text-white/78"
                    : "border-white/10 bg-white/[0.02] text-white/62 hover:border-white/20",
        ].join(" "), children: [_jsx("span", { className: [
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300",
                    active ? "bg-blue-500 text-black" : completed ? "bg-blue-500/20 text-blue-200" : "bg-white/8 text-white",
                ].join(" "), children: index + 1 }), _jsx("span", { className: "text-sm font-medium", children: title }), active ? (_jsx("div", { className: ["absolute bottom-0 left-0 h-0.5 rounded-full bg-indigo-400", isPaused ? "w-full opacity-70" : "tab-progress-animate"].join(" ") }, `${index}-${progressKey}-${isPaused ? "paused" : "playing"}`)) : null] }));
}
function JourneyFeatureIcon({ stepIndex, bulletIndex }) {
    const iconClassName = "h-4 w-4 text-blue-300";
    if (stepIndex === 0) {
        if (bulletIndex === 0)
            return _jsx(FileText, { className: iconClassName });
        if (bulletIndex === 1)
            return _jsx(Sparkles, { className: iconClassName });
        return _jsx(CheckCircle2, { className: iconClassName });
    }
    return _jsx(CheckCircle2, { className: iconClassName });
}
function JourneySimulationPanel({ activeStep, progressKey, }) {
    const [showAiResults, setShowAiResults] = useState(false);
    useEffect(() => {
        if (activeStep !== 1) {
            setShowAiResults(false);
            return;
        }
        const timer = window.setTimeout(() => setShowAiResults(true), 1500);
        return () => window.clearTimeout(timer);
    }, [activeStep, progressKey]);
    if (activeStep === 0) {
        return (_jsxs("div", { className: "step-content-animate mt-6 rounded-[22px] border border-white/10 bg-black p-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-red-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-amber-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" })] }), _jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]", children: [_jsx("div", { className: "flex items-center justify-center", children: _jsxs("div", { className: "relative flex h-36 w-28 items-center justify-center rounded-[22px] border border-blue-400/20 bg-[#060b14]", children: [_jsx(FileText, { size: 40, className: "text-blue-300" }), _jsx("div", { className: "absolute inset-x-3 top-4 h-1.5 rounded-full bg-blue-400/70 blur-[1px] upload-scan-animate" })] }) }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.24em] text-blue-300/80", children: "System Status" }), _jsx("div", { className: "text-2xl font-semibold text-white", children: "Invoice Intake Live" }), _jsx("div", { className: "h-2 overflow-hidden rounded-full bg-white/8", children: _jsx("div", { className: "h-full w-[32%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" }) }), _jsx("div", { className: "grid gap-2 pt-2 text-sm text-white/60", children: [
                                        "Invoice structure parsed",
                                        "Risk checks completed",
                                        "Marketplace ready",
                                    ].map((line, index) => (_jsxs("div", { className: "stagger-check-item flex items-center gap-2", style: { animationDelay: `${index * 400}ms` }, children: [_jsx(CheckCircle2, { size: 14, className: "text-blue-300" }), line] }, line))) })] })] })] }, `simulation-${activeStep}-${progressKey}`));
    }
    if (activeStep === 1) {
        return (_jsxs("div", { className: "step-content-animate mt-6 rounded-[22px] border border-white/10 bg-black p-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-red-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-amber-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" })] }), _jsxs("div", { className: "mt-6 space-y-4", children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.24em] text-blue-300/80", children: "System Status" }), _jsx("div", { className: "text-2xl font-semibold text-white", children: "AI Verification Running" }), !showAiResults ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-sm text-white/52", children: "Extracting invoice metadata..." }), _jsx("div", { className: "space-y-3 pt-2", children: [88, 76, 92].map((width) => (_jsx("div", { className: "h-4 overflow-hidden rounded-full bg-white/[0.04]", children: _jsx("div", { className: "skeleton h-full rounded-full", style: { width: `${width}%` } }) }, width))) })] })) : (_jsx("div", { className: "space-y-3 pt-2 text-sm text-white/72", children: [
                                "Company name: Quantum Global Ltd.",
                                "Amount: $128,000",
                                "Due date: 2026-07-28",
                            ].map((line, index) => (_jsx("div", { className: "typewriter-line overflow-hidden whitespace-nowrap border-r border-blue-300/60 pr-1 font-mono text-blue-200", style: { animationDelay: `${index * 450}ms` }, children: line }, line))) }))] })] }, `simulation-${activeStep}-${progressKey}`));
    }
    if (activeStep === 2) {
        return (_jsxs("div", { className: "step-content-animate mt-6 rounded-[22px] border border-white/10 bg-black p-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-red-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-amber-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" })] }), _jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-emerald-300", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400 live-dot-animate" }), "Live"] })] }), _jsxs("div", { className: "mt-6 rounded-[20px] border border-white/10 bg-white/[0.02] p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.24em] text-blue-300/80", children: "Marketplace Listing" }), _jsx("div", { className: "mt-2 text-xl font-semibold text-white", children: "Quantum Global Invoice" })] }), _jsx("span", { className: "rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45", children: "9.5% APY" })] }), _jsxs("div", { className: "mt-6 grid gap-4 text-sm text-white/60 sm:grid-cols-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-white/35", children: "Amount" }), _jsx("div", { className: "mt-2 text-white", children: "$128,000" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-white/35", children: "Buyer" }), _jsx("div", { className: "mt-2 text-white", children: "A-rated" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[10px] uppercase tracking-[0.22em] text-white/35", children: "Demand" }), _jsx("div", { className: "mt-2 text-white", children: "High" })] })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/42", children: [_jsx("span", { children: "Funding Progress" }), _jsx("span", { children: "73%" })] }), _jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-white/8", children: _jsx("div", { className: "market-progress-animate h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" }, `market-progress-${progressKey}`) })] })] })] }, `simulation-${activeStep}-${progressKey}`));
    }
    return (_jsxs("div", { className: "step-content-animate mt-6 rounded-[22px] border border-white/10 bg-black p-5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-red-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-amber-400" }), _jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" })] }), _jsxs("div", { className: "mt-6 rounded-[22px] border border-blue-500/20 bg-[#06090d] p-5", children: [_jsx("div", { className: "text-[11px] uppercase tracking-[0.24em] text-blue-300/80", children: "Wallet Confirmation" }), _jsxs("div", { className: "mt-4 rounded-[18px] border border-white/10 bg-black/80 p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300", children: _jsx(Wallet, { size: 18 }) }), _jsx("span", { className: "rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/45", children: "Freighter" })] }), _jsxs("div", { className: "mt-5 space-y-3 text-sm text-white/68", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Wallet" }), _jsx("span", { className: "font-mono text-white", children: "GBLQAZR2...SEB3" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Funding amount" }), _jsx("span", { className: "text-white", children: "$12,800" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Settlement rail" }), _jsx("span", { className: "text-white", children: "Stellar testnet" })] })] }), _jsx("button", { type: "button", className: "wallet-confirm-animate mt-6 inline-flex w-full items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/15 px-5 py-3 text-sm font-medium text-blue-100", children: "Confirm" })] })] })] }, `simulation-${activeStep}-${progressKey}`));
}
// ENHANCED: auto-advance + interactivity
export default function Web3HeroLanding({ onLaunch, onStartSimulation, walletConnected }) {
    const loading = usePageSkeleton("landing");
    const [activeStep, setActiveStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progressKey, setProgressKey] = useState(0);
    const [simulationNotice, setSimulationNotice] = useState("");
    const [openMenu, setOpenMenu] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const rootRef = useRef(null);
    const heroSectionRef = useRef(null);
    const heroTiltRef = useRef(null);
    const revealSectionsRef = useRef([]);
    const pauseTimeoutRef = useRef(null);
    function scrollToSection(id) {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
    const closeMenu = () => setOpenMenu(null);
    const toggleMenu = (name) => {
        setOpenMenu((prev) => (prev === name ? null : name));
    };
    const runMenuAction = (action) => {
        action();
        closeMenu();
        setMobileMenuOpen(false);
    };
    const productItems = [
        {
            label: "Invoice Financing",
            description: "Upload and tokenize invoices for funding",
            icon: FileText,
            action: () => onLaunch(),
        },
        {
            label: "Marketplace",
            description: "Browse live invoice deals as an investor",
            icon: Store,
            action: () => scrollToSection("marketplace"),
        },
        {
            label: "Trust Score",
            description: "How invoice risk is evaluated on Fintrix",
            icon: ShieldCheck,
            action: () => scrollToSection("features"),
        },
        {
            label: "Simulation",
            description: "Run a full invoice financing simulation",
            icon: Sparkles,
            action: () => handleStartSimulation(),
        },
    ];
    const developerItems = [
        {
            label: "API Docs",
            description: "REST API reference for Fintrix integration",
            icon: Code2,
            action: () => window.open("https://developers.stellar.org/docs", "_blank"),
            external: true,
        },
        {
            label: "Stellar SDK",
            description: "JavaScript SDK for Stellar blockchain",
            icon: Globe2,
            action: () => window.open("https://stellar.github.io/js-stellar-sdk/", "_blank"),
            external: true,
        },
        {
            label: "GitHub",
            description: "Fintrix source code and contribution guide",
            icon: ExternalLink,
            action: () => window.open("https://github.com", "_blank"),
            external: true,
        },
        {
            label: "Testnet Tools",
            description: "Stellar testnet explorer and account viewer",
            icon: Droplets,
            action: () => window.open("https://stellar.expert/explorer/testnet", "_blank"),
            external: true,
        },
    ];
    const resourceItems = [
        {
            label: "Documentation",
            description: "How Fintrix works — invoice flow, trust scores, wallets",
            icon: BookOpen,
            action: () => scrollToSection("journey"),
        },
        {
            label: "Stellar Docs",
            description: "Official Stellar blockchain developer documentation",
            icon: ExternalLink,
            action: () => window.open("https://developers.stellar.org/docs", "_blank"),
            external: true,
        },
        {
            label: "Freighter Wallet",
            description: "Install the Freighter browser extension for Stellar",
            icon: Wallet,
            action: () => window.open("https://freighter.app", "_blank"),
            external: true,
        },
        {
            label: "Albedo Wallet",
            description: "Use Albedo — no extension needed for Stellar signing",
            icon: KeyRound,
            action: () => window.open("https://albedo.link", "_blank"),
            external: true,
        },
        {
            label: "Testnet Faucet",
            description: "Get free test XLM for the Stellar testnet",
            icon: Droplets,
            action: () => window.open("https://friendbot.stellar.org", "_blank"),
            external: true,
        },
        {
            label: "API Reference",
            description: "Fintrix backend API endpoints and integration guide",
            icon: Code2,
            action: () => scrollToSection("features"),
        },
    ];
    const navItems = [
        { label: "Product", menuKey: "product", menu: productItems },
        { label: "Developers", menuKey: "developers", menu: developerItems },
        { label: "Resources", menuKey: "resources", menu: resourceItems },
    ];
    const journeySteps = [
        {
            title: "Upload Invoice",
            eyebrow: "01 / Intake",
            body: "Submit an invoice or supporting document and Fintrix begins structuring the opportunity in seconds.",
            bullets: ["Smart parsing from PDFs or images", "Instant invoice metadata extraction", "Ready for simulation immediately"],
        },
        {
            title: "AI Verification",
            eyebrow: "02 / Intelligence",
            body: "AI checks the invoice, validates the fields, and surfaces risk cues before any funding action is taken.",
            bullets: ["Buyer and amount recognition", "Anomaly and completeness checks", "Transparent review summaries"],
        },
        {
            title: "Marketplace",
            eyebrow: "03 / Distribution",
            body: "The opportunity is listed into a live marketplace where capital can discover and compare deals.",
            bullets: ["Dynamic risk and yield display", "Investor-ready deal cards", "Responsive market visibility"],
        },
        {
            title: "Funding",
            eyebrow: "04 / Settlement",
            body: "Wallet-connected investors can fund the invoice, triggering the simulated on-chain flow.",
            bullets: ["Wallet-based execution", "Soroban-backed workflow", "Clear settlement status"],
        },
    ];
    const activeJourney = journeySteps[activeStep];
    useEffect(() => {
        if (isPaused)
            return;
        const interval = window.setInterval(() => {
            setActiveStep((prev) => (prev + 1) % journeySteps.length);
            setProgressKey((prev) => prev + 1);
        }, 3500);
        return () => window.clearInterval(interval);
    }, [isPaused, journeySteps.length]);
    useEffect(() => {
        return () => {
            if (pauseTimeoutRef.current) {
                window.clearTimeout(pauseTimeoutRef.current);
            }
        };
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".navbar-shell")) {
                setOpenMenu(null);
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    useEffect(() => {
        const heroSection = heroSectionRef.current;
        const heroTilt = heroTiltRef.current;
        if (!heroSection || !heroTilt)
            return;
        const handleMouseMove = (event) => {
            const rect = heroSection.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            heroTilt.style.transition = "transform 0.08s linear";
            heroTilt.style.transform = `perspective(1000px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
        };
        const handleMouseLeave = () => {
            heroTilt.style.transition = "transform 0.5s ease";
            heroTilt.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
        };
        heroSection.addEventListener("mousemove", handleMouseMove);
        heroSection.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            heroSection.removeEventListener("mousemove", handleMouseMove);
            heroSection.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);
    useEffect(() => {
        const sections = revealSectionsRef.current.filter(Boolean);
        if (!sections.length)
            return;
        sections.forEach((section) => {
            section.style.opacity = "0";
            section.style.transform = "translateY(20px)";
            section.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            const cards = Array.from(section.querySelectorAll("[data-reveal-card='true']"));
            cards.forEach((card, index) => {
                card.style.opacity = "0";
                card.style.transform = "translateY(20px)";
                card.style.transition = `opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms`;
            });
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting)
                    return;
                const section = entry.target;
                section.style.opacity = "1";
                section.style.transform = "translateY(0)";
                const cards = Array.from(section.querySelectorAll("[data-reveal-card='true']"));
                cards.forEach((card) => {
                    card.style.opacity = "1";
                    card.style.transform = "translateY(0)";
                });
                observer.unobserve(section);
            });
        }, { threshold: 0.18 });
        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);
    function handleStartSimulation() {
        const opened = onStartSimulation();
        if (!opened) {
            setSimulationNotice("Connect your wallet first to simulate");
            window.setTimeout(() => setSimulationNotice(""), 3000);
        }
    }
    function handleLaunchWithRipple(event) {
        createRipple(event);
        onLaunch();
    }
    function handleMobileAction(action) {
        action();
        setOpenMenu(null);
        setMobileMenuOpen(false);
    }
    function handleJourneyStepClick(index) {
        setActiveStep(index);
        setProgressKey((prev) => prev + 1);
        setIsPaused(true);
        if (pauseTimeoutRef.current) {
            window.clearTimeout(pauseTimeoutRef.current);
        }
        pauseTimeoutRef.current = window.setTimeout(() => {
            setIsPaused(false);
            setProgressKey((prev) => prev + 1);
        }, 8000);
    }
    if (loading) {
        return _jsx(SkeletonLanding, {});
    }
    return (_jsxs("div", { ref: rootRef, className: "min-h-screen bg-black text-white", children: [_jsx("style", { children: `
        @keyframes fintrix-ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        @keyframes tabProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes uploadScan {
          0% { transform: translateY(0); opacity: 0.2; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(96px); opacity: 0.15; }
        }
        @keyframes staggerCheck {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marketProgress {
          from { width: 0%; }
          to { width: 73%; }
        }
        @keyframes walletPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(96,165,250,0.12); }
          50% { box-shadow: 0 0 24px rgba(96,165,250,0.22); }
        }
        @keyframes liveDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,0.35); }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(74,222,128,0); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        .tab-progress-animate {
          animation: tabProgress 3.5s linear forwards;
        }
        .step-content-animate {
          animation: stepFadeIn 0.3s ease-out forwards;
        }
        .upload-scan-animate {
          animation: uploadScan 2s ease-in-out infinite;
        }
        .stagger-check-item {
          opacity: 0;
          animation: staggerCheck 0.4s ease-out forwards;
        }
        .market-progress-animate {
          width: 73%;
          animation: marketProgress 1s ease-out forwards;
        }
        .wallet-confirm-animate {
          animation: walletPulse 1.8s ease-in-out infinite;
        }
        .live-dot-animate {
          animation: liveDot 1.6s ease-in-out infinite;
        }
        .typewriter-line {
          width: 0;
          animation: typewriter 0.9s steps(32, end) forwards;
        }
      ` }), _jsxs("section", { ref: heroSectionRef, className: "relative min-h-screen overflow-hidden bg-black text-white", children: [_jsx("video", { className: "absolute inset-0 h-full w-full object-cover", src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4", autoPlay: true, loop: true, muted: true, playsInline: true, preload: "auto" }), _jsx("div", { className: "absolute inset-0 bg-black/50" }), _jsx("div", { className: "absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-black/10 via-black/0 to-transparent" }), _jsxs("div", { className: "relative z-10 flex min-h-screen flex-col", children: [_jsxs("header", { className: "navbar-shell absolute inset-x-0 top-0 z-20", children: [_jsxs("div", { className: "flex items-center justify-between px-5 py-5 md:px-[120px] md:py-5", children: [_jsxs("div", { className: "flex items-center gap-4 sm:gap-8 md:gap-[30px]", children: [_jsxs("div", { className: "flex items-center gap-3 whitespace-nowrap", children: [_jsx("img", { src: "/fintrix-brand.png", alt: "Fintrix", className: "h-11 w-11 object-contain" }), _jsx("span", { className: "text-[20px] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[24px]", children: "Fintrix" })] }), _jsx("nav", { className: "hidden items-center gap-[30px] md:flex", children: navItems.map((item) => (_jsxs("div", { className: "navbar-dropdown-wrapper relative", children: [_jsxs("button", { type: "button", onClick: () => {
                                                                        if (item.menu) {
                                                                            toggleMenu(item.menuKey);
                                                                            return;
                                                                        }
                                                                        if (item.target) {
                                                                            scrollToSection(item.target);
                                                                        }
                                                                    }, className: "inline-flex items-center gap-[14px] text-[14px] font-medium text-white transition-opacity duration-200 hover:opacity-80", children: [_jsx("span", { children: item.label }), _jsx(ChevronDown, { size: 14, strokeWidth: 2 })] }), item.menu && openMenu === item.menuKey ? (_jsx("div", { className: "absolute left-1/2 top-full z-30 mt-4 w-[360px] -translate-x-1/2 rounded-[24px] border border-white/10 bg-[#05070a]/95 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl", children: item.menu.map((menuItem) => {
                                                                        const Icon = menuItem.icon;
                                                                        return (_jsxs("button", { type: "button", onClick: () => {
                                                                                runMenuAction(menuItem.action);
                                                                            }, className: "flex w-full items-start gap-4 rounded-[18px] px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.05]", children: [_jsx("span", { className: "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-blue-300", children: _jsx(Icon, { size: 18 }) }), _jsxs("span", { className: "min-w-0", children: [_jsxs("span", { className: "flex items-center gap-2 text-[14px] font-medium text-white", children: [menuItem.label, menuItem.external ? _jsx(ExternalLink, { size: 13, className: "text-white/35" }) : null] }), _jsx("span", { className: "mt-1 block text-[12px] leading-5 text-white/50", children: menuItem.description })] })] }, menuItem.label));
                                                                    }) })) : null] }, item.label))) })] }), _jsx("div", { className: "hidden md:block", children: _jsx(PillButton, { tone: "dark", onClick: onLaunch, enableRipple: true, children: "Connect Wallet" }) }), _jsx("button", { type: "button", onClick: () => {
                                                    setMobileMenuOpen((prev) => !prev);
                                                    setOpenMenu(null);
                                                }, className: "flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white md:hidden", "aria-label": mobileMenuOpen ? "Close navigation menu" : "Open navigation menu", children: mobileMenuOpen ? _jsx(X, { size: 18 }) : _jsx(Menu, { size: 18 }) })] }), mobileMenuOpen ? (_jsxs("div", { className: "mx-5 mt-3 rounded-[24px] border border-white/10 bg-[#05070a]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden", children: [_jsx("div", { className: "space-y-3", children: navItems.map((item) => (_jsxs("div", { className: "navbar-dropdown-wrapper rounded-[20px] border border-white/6 bg-white/[0.02] p-2", children: [_jsxs("button", { type: "button", onClick: () => toggleMenu(item.menuKey), className: "flex min-h-[44px] w-full items-center justify-between rounded-[16px] px-3 py-2 text-left text-[14px] font-medium text-white", children: [_jsx("span", { children: item.label }), _jsx(ChevronDown, { size: 14, strokeWidth: 2, className: openMenu === item.menuKey ? "rotate-180 transition-transform" : "transition-transform" })] }), item.menu && openMenu === item.menuKey ? (_jsx("div", { className: "mt-2 space-y-1", children: item.menu.map((menuItem) => {
                                                                const Icon = menuItem.icon;
                                                                return (_jsxs("button", { type: "button", onClick: () => runMenuAction(menuItem.action), className: "flex min-h-[44px] w-full items-start gap-3 rounded-[16px] px-3 py-3 text-left transition-colors duration-200 hover:bg-white/[0.05]", children: [_jsx("span", { className: "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-blue-300", children: _jsx(Icon, { size: 18 }) }), _jsxs("span", { className: "min-w-0", children: [_jsxs("span", { className: "flex items-center gap-2 text-[14px] font-medium text-white", children: [menuItem.label, menuItem.external ? _jsx(ExternalLink, { size: 13, className: "text-white/35" }) : null] }), _jsx("span", { className: "mt-1 block text-[12px] leading-5 text-white/50", children: menuItem.description })] })] }, menuItem.label));
                                                            }) })) : null] }, item.label))) }), _jsx("div", { className: "mt-4", children: _jsx(PillButton, { tone: "dark", onClick: () => handleMobileAction(onLaunch), className: "w-full", children: "Connect Wallet" }) })] })) : null] }), _jsx("div", { className: "flex flex-1 items-center justify-center px-6 pt-[230px] pb-[102px] text-center md:px-[120px] md:pt-[280px]", children: _jsxs("div", { ref: heroTiltRef, className: "flex w-full max-w-[1040px] flex-col items-center gap-10", style: { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" }, children: [_jsx("div", { className: "flex flex-col items-center", children: _jsxs("h1", { className: "max-w-[1040px] text-[clamp(3rem,14vw,5.625rem)] font-black uppercase leading-[0.96] tracking-[-0.07em] text-white", children: [_jsx("span", { className: "block", children: "INVOICE FINANCE" }), _jsx("span", { className: "block", children: "SIMULATION" })] }) }), _jsx("p", { className: "max-w-[760px] text-[15px] font-medium leading-[1.7] text-white/60 sm:text-[18px] md:text-[19px]", children: "Experience how real-world invoice financing works. Upload an invoice, parse it with AI, and fund it using Stellar testnet wallets." }), _jsxs("div", { className: "flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row", children: [_jsx(PillButton, { tone: "light", onClick: handleStartSimulation, className: "w-full sm:w-auto", children: "Start Simulation" }), _jsx(PillButton, { tone: "ghost", onClick: () => scrollToSection("journey"), className: "w-full sm:w-auto", children: "See How It Works" })] }), simulationNotice === "Connect your wallet first to simulate" && (_jsxs("div", { className: "flex items-center gap-2 mt-3 px-4 py-2.5 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 text-sm font-medium animate-pulse w-fit mx-auto", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-green-400 shrink-0" }), "Connect your wallet first to simulate"] })), simulationNotice && simulationNotice !== "Connect your wallet first to simulate" ? (_jsx("p", { className: "text-sm font-medium text-white/70", children: simulationNotice })) : null, walletConnected ? _jsx("p", { className: "text-xs uppercase tracking-[0.18em] text-blue-300/70", children: "Wallet connected" }) : null] }) }), _jsx("div", { className: "pointer-events-none absolute bottom-8 left-1/2 z-20 h-2 w-12 -translate-x-1/2 rounded-full border border-white/30 bg-white/5" })] })] }), _jsxs("section", { id: "what-is-fintrix", ref: (node) => {
                    if (node)
                        revealSectionsRef.current[0] = node;
                }, className: "mx-auto max-w-[1440px] px-6 py-20 md:px-8 md:py-24", children: [_jsx(SectionHeading, { label: "What is Fintrix?", title: "Fintrix bridges the gap between traditional supply chain finance and decentralized liquidity pools." }), _jsxs("div", { className: "mt-12 grid gap-6 lg:grid-cols-2", children: [_jsxs("div", { "data-reveal-card": "true", className: "rounded-[24px] border border-blue-500/20 bg-[#06090d] p-8 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: [_jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400", children: _jsx(Building2, { size: 18 }) }), _jsx("h3", { className: "mt-6 text-2xl font-semibold text-white", children: "For Businesses" }), _jsx("p", { className: "mt-4 max-w-xl text-sm leading-7 text-white/58", children: "Unlock capital trapped in accounts receivable. Sell your invoices to a global network of investors and receive funds in minutes instead of weeks." }), _jsx("div", { className: "mt-6 space-y-3 text-sm text-white/72", children: ["Immediate Working Capital", "No Long-term Debt", "Faster Cash Conversion"].map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-blue-400" }), _jsx("span", { children: item })] }, item))) })] }), _jsxs("div", { "data-reveal-card": "true", className: "rounded-[24px] border border-cyan-500/20 bg-[#06090d] p-8 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: [_jsx("div", { className: "flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300", children: _jsx(TrendingUp, { size: 18 }) }), _jsx("h3", { className: "mt-6 text-2xl font-semibold text-white", children: "For Investors" }), _jsx("p", { className: "mt-4 max-w-xl text-sm leading-7 text-white/58", children: "Access high-yield, short-term investment opportunities secured by institutional-grade invoices. Diversify your portfolio with real-world flow." }), _jsx("div", { className: "mt-6 space-y-3 text-sm text-white/72", children: ["Risk-adjusted APY", "Transparent Escrow Logic", "Deal-level Visibility"].map((item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-cyan-300" }), _jsx("span", { children: item })] }, item))) })] })] })] }), _jsx("section", { id: "journey", ref: (node) => {
                    if (node)
                        revealSectionsRef.current[1] = node;
                }, className: "bg-black px-6 py-20 md:px-8 md:py-24", children: _jsxs("div", { className: "mx-auto max-w-[1440px]", children: [_jsx(SectionHeading, { label: "The Financing Journey", title: "An interactive path from invoice upload to funding." }), _jsx("div", { className: "relative mt-12", children: _jsx("div", { className: "relative z-10 flex flex-col gap-4 lg:flex-row", children: journeySteps.map((step, index) => (_jsx("div", { className: "contents", children: _jsx(JourneyStep, { index: index, title: step.title, active: index === activeStep, completed: index < activeStep, progressKey: progressKey, isPaused: isPaused, onClick: () => handleJourneyStepClick(index) }) }, step.title))) }) }), _jsxs("div", { className: "mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]", children: [_jsx("div", { "data-reveal-card": "true", className: "rounded-[28px] border border-white/10 bg-[#06090d] p-8 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: _jsxs("div", { className: "step-content-animate", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.24em] text-blue-300/80", children: activeJourney.eyebrow }), _jsx("h3", { className: "mt-4 text-3xl font-semibold text-white", children: activeJourney.title }), _jsx("p", { className: "mt-4 max-w-2xl text-sm leading-7 text-white/58", children: activeJourney.body }), _jsx("div", { className: "mt-8 grid gap-3 sm:grid-cols-3", children: activeJourney.bullets.map((bullet, index) => (_jsx("div", { "data-reveal-card": "true", className: [
                                                        "rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-sm text-white/75 transition-all duration-200 ease-out",
                                                        activeStep === 0
                                                            ? "hover:-translate-y-[3px] hover:border-indigo-400/40 hover:shadow-[0_0_18px_rgba(99,102,241,0.18)]"
                                                            : "hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]",
                                                    ].join(" "), children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: "mt-0.5 shrink-0", children: _jsx(JourneyFeatureIcon, { stepIndex: activeStep, bulletIndex: index }) }), _jsx("span", { children: bullet })] }) }, bullet))) })] }, `journey-copy-${activeStep}-${progressKey}`) }), _jsxs("div", { "data-reveal-card": "true", className: "rounded-[28px] border border-blue-500/20 bg-[#05070a] p-6 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-white/10 pb-4 text-xs uppercase tracking-[0.22em] text-white/35", children: [_jsx("span", { children: "Simulation Mode: Active" }), _jsxs("span", { children: ["Step ", activeStep + 1] })] }), _jsx(JourneySimulationPanel, { activeStep: activeStep, progressKey: progressKey }), _jsxs("button", { type: "button", onClick: onLaunch, className: "mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01]", children: ["Try Simulation ", _jsx(ArrowRight, { size: 16 })] })] })] })] }) }), _jsx("section", { id: "features", ref: (node) => {
                    if (node)
                        revealSectionsRef.current[2] = node;
                }, className: "mx-auto max-w-[1440px] px-6 py-20 md:px-8 md:py-24", children: _jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [_jsx(FeatureCard, { icon: Sparkles, title: "AI Invoice Parsing", description: "Proprietary machine learning models extract and validate invoice data instantly, reducing manual review and freeing teams to move faster.", accent: "bg-blue-500/10 text-blue-400" }), _jsx(FeatureCard, { icon: Layers3, title: "Soroban Smart Contracts", description: "Built on Stellar's Soroban, smart contracts govern funding and settlement logic with the transparency and security expected on-chain.", accent: "bg-cyan-500/10 text-cyan-300" }), _jsx(FeatureCard, { icon: Store, title: "Real-time Marketplace", description: "A high-frequency deal board where invoices are priced dynamically and matched against investor appetite in near real-time.", accent: "bg-blue-500/10 text-blue-300" })] }) }), _jsx("section", { id: "trust", ref: (node) => {
                    if (node)
                        revealSectionsRef.current[3] = node;
                }, className: "hidden", children: _jsxs("div", { className: "mx-auto max-w-[1440px] px-6 py-16 md:px-8", children: [_jsxs("div", { className: "flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { className: "max-w-2xl", children: [_jsx("h3", { className: "text-2xl font-semibold text-white", children: "Transparent Simulation by Design" }), _jsx("p", { className: "mt-4 text-sm leading-7 text-white/55", children: "Fintrix leverages the Stellar network for lightning-fast settlement and transparent record-keeping." })] }), _jsxs("div", { className: "flex flex-wrap gap-4 text-xs uppercase tracking-[0.22em] text-white/45", children: [_jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2", children: [_jsx(Globe2, { size: 14, className: "text-blue-300" }), "Stellar"] }), _jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2", children: [_jsx(ShieldCheck, { size: 14, className: "text-white" }), "Secure"] }), _jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2", children: [_jsx(Lock, { size: 14, className: "text-white" }), "Audited"] })] })] }), _jsx("div", { "data-reveal-card": "true", className: "mt-10 rounded-[28px] border border-white/10 bg-[#07090d] p-6 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)] md:p-8", children: _jsxs("div", { "data-reveal-card": "true", className: "rounded-[20px] border border-white/10 bg-black p-5 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)] md:p-7", children: [_jsxs("div", { className: "flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/32", children: [_jsx("span", { children: "SIMULATION DASHBOARD" }), _jsx("span", { children: "Active" })] }), _jsxs("div", { className: "mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-[11px] uppercase tracking-[0.22em] text-blue-300/80", children: ["Step ", _jsx(CountUpText, { value: "2" }), " / Analysis"] }), _jsx("h4", { className: "mt-3 text-2xl font-semibold text-white", children: "Verification in Progress" }), _jsx("div", { className: "mt-5 h-2 overflow-hidden rounded-full bg-white/8", children: _jsx("div", { className: "h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" }) }), _jsx("button", { type: "button", onClick: onLaunch, className: "mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.01]", children: "Try Simulation" })] }), _jsx("div", { "data-reveal-card": "true", className: "grid gap-3 rounded-[18px] border border-white/10 bg-white/[0.02] p-4 text-xs text-blue-300 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: [
                                                    "Upload invoice file accepted...",
                                                    "Counterparty score: 88/100",
                                                    "Soroban contract ready",
                                                    "Market demand: high",
                                                    "Risk profile: low",
                                                ].map((line) => (_jsx("div", { children: line.includes("88/100") ? _jsxs(_Fragment, { children: ["\u2713 Counterparty score: ", _jsx(CountUpText, { value: "88" }), "/100"] }) : `✓ ${line}` }, line))) })] })] }) })] }) }), _jsx("section", { id: "marketplace", ref: (node) => {
                    if (node)
                        revealSectionsRef.current[4] = node;
                }, className: "mx-auto max-w-[1440px] px-6 py-20 md:px-8 md:py-24", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-[0.95fr_1.05fr]", children: [_jsxs("div", { "data-reveal-card": "true", className: "rounded-[28px] border border-white/10 bg-white/[0.02] p-8 transition-all duration-[250ms] ease-[ease] hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300", children: _jsx(Wallet, { size: 18 }) }), _jsx("h3", { className: "mt-6 text-3xl font-semibold text-white", children: "Live Market Place" }), _jsx("p", { className: "mt-4 text-sm leading-7 text-white/58", children: "Browse invoice opportunities, compare yield, and move from analysis to funding with a clean, wallet-ready flow." }), _jsxs("div", { className: "mt-6 space-y-3 text-sm text-white/72", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-blue-400" }), "Real-time invoice pricing"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-blue-400" }), "Transparent deal history"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-blue-400" }), "Wallet-connected execution"] })] })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: [
                                ["Global Logistics #882", "$42,500", "12.4%", "Low Risk"],
                                ["Tech Infra Series B", "$128,000", "14.8%", "Med Risk"],
                                ["Retail Distribution #104", "$64,200", "11.1%", "Low Risk"],
                                ["Healthcare Payables #21", "$94,800", "13.6%", "Med Risk"],
                            ].map(([name, amount, roi, risk]) => (_jsxs("div", { "data-reveal-card": "true", className: "rounded-[22px] border border-white/10 bg-[#06090d] p-6 transition-all duration-[250ms] ease-[ease] hover:border-white/20 hover:scale-[1.015] hover:shadow-[0_0_18px_rgba(99,179,237,0.2)]", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-white/6 text-white", children: _jsx(FileText, { size: 16 }) }), _jsx("span", { className: "rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45", children: risk })] }), _jsx("h4", { className: "mt-6 text-lg font-semibold text-white", children: name }), _jsxs("p", { className: "mt-2 text-xs text-white/42", children: ["Matures in ", _jsx(CountUpText, { value: "14" }), " days"] }), _jsxs("div", { className: "mt-6 flex items-end justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.22em] text-white/30", children: "Amount" }), _jsx("p", { className: "mt-2 text-white", children: _jsx(CountUpText, { value: amount }) })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-[10px] uppercase tracking-[0.22em] text-white/30", children: "ROI" }), _jsx("p", { className: "mt-2 text-blue-300", children: _jsx(CountUpText, { value: roi }) })] })] })] }, name))) })] }) }), _jsxs("section", { ref: (node) => {
                    if (node)
                        revealSectionsRef.current[5] = node;
                }, className: "relative overflow-hidden bg-black px-6 py-20 md:px-8 md:py-28", children: [_jsx("video", { className: "absolute inset-0 z-0 h-full w-full object-cover", src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4", autoPlay: true, loop: true, muted: true, playsInline: true, preload: "auto" }), _jsx("div", { className: "absolute inset-0 z-10 bg-black/50" }), _jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center pointer-events-none", children: _jsx("div", { style: {
                                width: "600px",
                                height: "600px",
                                borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
                                filter: "blur(40px)",
                            } }) }), _jsxs("div", { className: "relative z-20 mx-auto flex min-h-[500px] max-w-4xl flex-col items-center justify-center text-center", children: [_jsx("h2", { className: "text-4xl font-semibold tracking-tight text-white md:text-6xl", children: "Start Your First Invoice Simulation" }), _jsx("p", { className: "mt-5 max-w-2xl text-lg leading-8 text-white/55", children: "Step into the workflow with invoice upload, AI parsing, marketplace listing, and wallet-based funding." }), _jsx("button", { type: "button", onClick: handleLaunchWithRipple, className: "relative mt-10 inline-flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white px-8 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01]", children: "Connect Wallet" })] })] }), _jsx("footer", { className: "bg-black", children: _jsxs("div", { className: "mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-8 text-xs uppercase tracking-[0.24em] text-white/30 md:flex-row md:items-center md:justify-between md:px-8", children: [_jsxs("button", { onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }), className: "flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity", "aria-label": "Scroll to top", children: [_jsx("img", { src: "/fintrix-brand.png", alt: "Fintrix", className: "h-10 w-10 object-contain" }), _jsx("div", { className: "font-semibold text-white", children: "Fintrix" })] }), _jsx("div", { children: "\u00A9 2026 Fintrix." }), _jsxs("div", { className: "flex gap-6", children: [_jsx("a", { className: "hover:text-white/60", href: "mailto:support@fintrix.com", children: "Support" }), _jsx("a", { className: "hover:text-white/60", href: "https://stellar.org", target: "_blank", rel: "noreferrer", children: "Network" }), _jsx("a", { className: "hover:text-white/60", href: "https://www.freighter.app/", target: "_blank", rel: "noreferrer", children: "Wallet" }), _jsx("a", { className: "hover:text-white/60", href: "https://stellar.expert/explorer/testnet", target: "_blank", rel: "noreferrer", children: "Explorer" })] })] }) })] }));
}
