import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Globe2,
  Layers3,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";

type Web3HeroLandingProps = {
  onLaunch: () => void;
};

type PillTone = "dark" | "light" | "ghost";

function PillButton({
  children,
  tone,
  onClick,
  className,
}: {
  children: ReactNode;
  tone: PillTone;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative inline-flex overflow-hidden rounded-full border-[0.6px] border-white/80 bg-transparent p-[1px] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]",
        className ?? "",
      ].join(" ")}
    >
      <span className="pointer-events-none absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-full bg-white/25 blur-2xl" />
      <span
        className={[
          "relative z-10 inline-flex items-center justify-center rounded-full px-[20px] py-[10px] text-[14px] font-medium leading-none transition-colors duration-200 sm:px-[29px] sm:py-[11px]",
          tone === "dark" ? "bg-black text-white" : tone === "light" ? "bg-white text-black" : "bg-black/0 text-white",
        ].join(" ")}
      >
        {children}
      </span>
    </button>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {label ? <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">{label}</p> : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
      {description ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/55">{description}</p> : null}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={18} />
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-white/58">{description}</p>
    </div>
  );
}

function JourneyStep({
  index,
  title,
  active,
  onClick,
}: {
  index: number;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-w-0 flex-1 items-center gap-4 rounded-full border px-4 py-3 text-left transition-all duration-200",
        active ? "border-blue-400/60 bg-blue-500/10 text-white" : "border-white/10 bg-white/[0.02] text-white/62 hover:border-white/20",
      ].join(" ")}
    >
      <span className={["flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", active ? "bg-blue-500 text-black" : "bg-white/8 text-white"].join(" ")}>
        {index + 1}
      </span>
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
}

export default function Web3HeroLanding({ onLaunch }: Web3HeroLandingProps) {
  const [activeStep, setActiveStep] = useState(0);

  const navItems = [
    { label: "Product", target: "what-is-fintrix" },
    { label: "How it Works", target: "journey" },
    { label: "Developers", target: "features" },
    { label: "Resources", target: "trust" },
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

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-black/10 via-black/0 to-transparent" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="absolute inset-x-0 top-0 z-20">
            <div className="flex items-center justify-between px-5 py-5 md:px-[120px] md:py-5">
              <div className="flex items-center gap-4 sm:gap-8 md:gap-[30px]">
                <div className="flex items-center gap-3 whitespace-nowrap">
                  <img src="/fintrix-brand.png" alt="Fintrix" className="h-11 w-11 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-[20px] font-semibold leading-none tracking-[-0.05em] text-white sm:text-[24px]">
                      Fintrix
                    </span>
                    <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/42">
                      Invoice Finance Simulation
                    </span>
                  </div>
                </div>
                <nav className="hidden items-center gap-[30px] md:flex">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => scrollToSection(item.target)}
                      className="inline-flex items-center gap-[14px] text-[14px] font-medium text-white transition-opacity duration-200 hover:opacity-80"
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={14} strokeWidth={2} />
                    </button>
                  ))}
                </nav>
              </div>

              <PillButton tone="dark" onClick={onLaunch}>
                Launch App
              </PillButton>
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center px-6 pt-[230px] pb-[102px] text-center md:px-[120px] md:pt-[280px]">
            <div className="flex w-full max-w-[1040px] flex-col items-center gap-10">
              <div className="flex flex-col items-center">
                <h1 className="max-w-[1040px] text-[48px] font-black uppercase leading-[0.96] tracking-[-0.07em] text-white md:text-[90px]">
                  <span className="block">INVOICE FINANCE</span>
                  <span className="block">SIMULATION</span>
                </h1>
              </div>

              <p className="max-w-[760px] text-[18px] font-medium leading-[1.7] text-white/60 md:text-[19px]">
                Experience how real-world invoice financing works. Upload an invoice, parse it with AI, and fund it
                using Stellar testnet wallets.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <PillButton tone="light" onClick={onLaunch}>
                  Start Simulation
                </PillButton>
                <PillButton tone="ghost" onClick={() => scrollToSection("journey")}>
                  See How It Works
                </PillButton>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 left-1/2 z-20 h-2 w-12 -translate-x-1/2 rounded-full border border-white/30 bg-white/5" />
        </div>
      </section>

      <section id="what-is-fintrix" className="mx-auto max-w-[1440px] px-6 py-20 md:px-8 md:py-24">
        <SectionHeading
          label="What is Fintrix?"
          title="Fintrix bridges the gap between traditional supply chain finance and decentralized liquidity pools."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-blue-500/20 bg-[#06090d] p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Building2 size={18} />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-white">For Businesses</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/58">
              Unlock capital trapped in accounts receivable. Sell your invoices to a global network of investors and
              receive funds in minutes instead of weeks.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/72">
              {["Immediate Working Capital", "No Long-term Debt", "Faster Cash Conversion"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-cyan-500/20 bg-[#06090d] p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <TrendingUp size={18} />
            </div>
            <h3 className="mt-6 text-2xl font-semibold text-white">For Investors</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/58">
              Access high-yield, short-term investment opportunities secured by institutional-grade invoices. Diversify
              your portfolio with real-world flow.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/72">
              {["Risk-adjusted APY", "Transparent Escrow Logic", "Deal-level Visibility"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="border-y border-white/6 bg-black px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeading label="The Financing Journey" title="An interactive path from invoice upload to funding." />

          <div className="mt-12 flex flex-col gap-4 lg:flex-row">
            {journeySteps.map((step, index) => (
              <JourneyStep
                key={step.title}
                index={index}
                title={step.title}
                active={index === activeStep}
                onClick={() => setActiveStep(index)}
              />
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-white/10 bg-[#06090d] p-8">
              <p className="text-[11px] uppercase tracking-[0.24em] text-blue-300/80">{activeJourney.eyebrow}</p>
              <h3 className="mt-4 text-3xl font-semibold text-white">{activeJourney.title}</h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">{activeJourney.body}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {activeJourney.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-sm text-white/75">
                    {bullet}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-blue-500/20 bg-[#05070a] p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs uppercase tracking-[0.22em] text-white/35">
                <span>Simulation Mode: Active</span>
                <span>Step {activeStep + 1}</span>
              </div>
              <div className="mt-6 rounded-[22px] border border-white/10 bg-black p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-blue-300/80">System Status</div>
                  <div className="text-2xl font-semibold text-white">Verification in Progress</div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  </div>
                  <div className="grid gap-2 pt-2 text-sm text-white/52">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-300" />
                      Invoice structure parsed
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-300" />
                      Risk checks completed
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-blue-300" />
                      Marketplace ready
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onLaunch}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01]"
              >
                Try Simulation <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1440px] px-6 py-20 md:px-8 md:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={Sparkles}
            title="AI Invoice Parsing"
            description="Proprietary machine learning models extract and validate invoice data instantly, reducing manual review and freeing teams to move faster."
            accent="bg-blue-500/10 text-blue-400"
          />
          <FeatureCard
            icon={Layers3}
            title="Soroban Smart Contracts"
            description="Built on Stellar's Soroban, smart contracts govern funding and settlement logic with the transparency and security expected on-chain."
            accent="bg-cyan-500/10 text-cyan-300"
          />
          <FeatureCard
            icon={Store}
            title="Real-time Marketplace"
            description="A high-frequency deal board where invoices are priced dynamically and matched against investor appetite in near real-time."
            accent="bg-blue-500/10 text-blue-300"
          />
        </div>
      </section>

      <section id="trust" className="border-y border-white/6 bg-[#050505]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-semibold text-white">Transparent Simulation by Design</h3>
              <p className="mt-4 text-sm leading-7 text-white/55">
                Fintrix leverages the Stellar network for lightning-fast settlement and transparent record-keeping.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.22em] text-white/45">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <Globe2 size={14} className="text-blue-300" />
                Stellar
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <ShieldCheck size={14} className="text-white" />
                Secure
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <Lock size={14} className="text-white" />
                Audited
              </span>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-[#07090d] p-6 md:p-8">
            <div className="rounded-[20px] border border-white/10 bg-black p-5 md:p-7">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/32">
                <span>SIMULATION DASHBOARD</span>
                <span>Active</span>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-blue-300/80">Step 2 / Analysis</p>
                  <h4 className="mt-3 text-2xl font-semibold text-white">Verification in Progress</h4>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  </div>
                  <button
                    type="button"
                    onClick={onLaunch}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.01]"
                  >
                    Try Simulation
                  </button>
                </div>
                <div className="grid gap-3 rounded-[18px] border border-white/10 bg-white/[0.02] p-4 text-xs text-blue-300">
                  {[
                    "Upload invoice file accepted...",
                    "Counterparty score: 88/100",
                    "Soroban contract ready",
                    "Market demand: high",
                    "Risk profile: low",
                  ].map((line) => (
                    <div key={line}>✓ {line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="marketplace" className="mx-auto max-w-[1440px] px-6 py-20 md:px-8 md:py-24">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
              <Wallet size={18} />
            </div>
            <h3 className="mt-6 text-3xl font-semibold text-white">Live Market Place</h3>
            <p className="mt-4 text-sm leading-7 text-white/58">
              Browse invoice opportunities, compare yield, and move from analysis to funding with a clean, wallet-ready
              flow.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/72">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Real-time invoice pricing
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Transparent deal history
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Wallet-connected execution
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Global Logistics #882", "$42,500", "12.4%", "Low Risk"],
              ["Tech Infra Series B", "$128,000", "14.8%", "Med Risk"],
              ["Retail Distribution #104", "$64,200", "11.1%", "Low Risk"],
              ["Healthcare Payables #21", "$94,800", "13.6%", "Med Risk"],
            ].map(([name, amount, roi, risk]) => (
              <div key={name} className="rounded-[22px] border border-white/10 bg-[#06090d] p-6 transition-colors hover:border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/6 text-white">
                    <FileText size={16} />
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                    {risk}
                  </span>
                </div>
                <h4 className="mt-6 text-lg font-semibold text-white">{name}</h4>
                <p className="mt-2 text-xs text-white/42">Matures in 14 days</p>
                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Amount</p>
                    <p className="mt-2 text-white">{amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">ROI</p>
                    <p className="mt-2 text-blue-300">{roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/6 bg-black px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">Start Your First Invoice Simulation</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">
            Step into the workflow with invoice upload, AI parsing, marketplace listing, and wallet-based funding.
          </p>
          <button
            type="button"
            onClick={onLaunch}
            className="mt-10 inline-flex items-center justify-center rounded-full border border-white/10 bg-white px-8 py-3 text-sm font-medium text-black transition-transform hover:scale-[1.01]"
          >
            Launch App
          </button>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-black">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-8 text-xs uppercase tracking-[0.24em] text-white/30 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <img src="/fintrix-brand.png" alt="Fintrix" className="h-10 w-10 object-contain" />
            <div className="font-semibold text-white">Fintrix</div>
          </div>
          <div>© 2026 Fintrix Invoice Finance Simulation.</div>
          <div className="flex gap-6">
            <a className="hover:text-white/60" href="mailto:support@fintrix.com">Support</a>
            <a className="hover:text-white/60" href="https://stellar.org" target="_blank" rel="noreferrer">Network</a>
            <a className="hover:text-white/60" href="https://www.freighter.app/" target="_blank" rel="noreferrer">Wallet</a>
            <a className="hover:text-white/60" href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer">Explorer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

