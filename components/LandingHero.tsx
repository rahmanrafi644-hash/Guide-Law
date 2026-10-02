"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ScenarioExample } from "@/lib/types";

interface LandingHeroProps {
  onStart: () => void;
  onSelectScenario: (scenario: ScenarioExample) => void;
}

export const SCENARIOS: ScenarioExample[] = [
  {
    title: "Dishonoured Cheque & 30-Day Notice",
    subtitle: "Section 138 • The Negotiable Instruments Act, 1881",
    actName: "Negotiable Instruments Act",
    icon: "credit-card",
    query: "A client issued a cheque of 5,00,000 BDT for business services. Upon bank presentation, the cheque bounced due to 'insufficiency of funds'. What specific statutory steps, timeline, and written notice are required before filing a criminal complaint?"
  },
  {
    title: "Delayed Delivery & Defective Goods",
    subtitle: "Sections 16 & 59 • Sale of Goods Act & Contract Act",
    actName: "Sale of Goods Act",
    icon: "package",
    query: "A business ordered 1,000 industrial machine motors under 30-day delivery terms. The supplier delivered 60 days late, and 150 motors were defective. The buyer paid 50% advance. What remedies and damages are available under Bangladeshi law?"
  },
  {
    title: "Secret Competing Business by a Partner",
    subtitle: "Section 16 • The Partnership Act, 1932",
    actName: "Partnership Act",
    icon: "users",
    query: "A partner in an architectural firm secretly accepted private design contracts using the firm's brand reputation and earned 12 lakh taka in personal profit. Can the other partners compel him to surrender these profits to the firm?"
  },
  {
    title: "Director Unauthorized Loan & Self-Dealing",
    subtitle: "Sections 103 & 105 • The Companies Act, 1994",
    actName: "Companies Act",
    icon: "building",
    query: "Can the board of directors of a private garment manufacturing company advance an unsecured loan of 40 lakh BDT to one of its directors without general meeting approval? What are the liabilities and penalties?"
  },
  {
    title: "Penalty Clause vs Liquidated Damages",
    subtitle: "Sections 73 & 74 • The Contract Act, 1872",
    actName: "Contract Act",
    icon: "file-text",
    query: "A commercial construction agreement stipulated that any delay of even a single day requires paying a flat penalty of 50 lakh BDT. Can the employer enforce this full amount in court if their actual loss was only 5 lakh BDT?"
  }
];

const ACTS = [
  "Contract Act, 1872",
  "Sale of Goods Act, 1930",
  "Negotiable Instruments Act, 1881",
  "Partnership Act, 1932",
  "Companies Act, 1994",
];

export const LandingHero: React.FC<LandingHeroProps> = ({ onSelectScenario }) => {
  return (
    <div className="w-full pt-10 sm:pt-20 pb-6 animate-rise">
      <img src="/logo.png" alt="Guide Law" className="w-24 h-24 sm:w-28 sm:h-28 mb-8 drop-shadow-sm" />

      <p className="text-[12px] tracking-[0.14em] uppercase text-brass font-medium mb-5">
        Bangladeshi Business Law
      </p>

      <h1 className="font-serif text-[40px] sm:text-[56px] leading-[1.05] tracking-tight font-medium text-ink">
        Describe the dispute.
        <br />
        <span className="text-muted">Get the legal position.</span>
      </h1>

      <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted">
        Reasoned the way a counsel would — issue, rule, application, conclusion — and tied to
        the exact sections of the five Acts it is built on.
      </p>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-faint">
        {ACTS.map((a) => (
          <span key={a}>{a}</span>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="text-[12px] tracking-[0.14em] uppercase text-faint font-medium mb-3">
          Try a scenario
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          {SCENARIOS.map((sc, i) => (
            <li key={i}>
              <button
                onClick={() => onSelectScenario(sc)}
                className="group w-full text-left py-4 flex items-start justify-between gap-6 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-[15px] text-ink">{sc.title}</span>
                  <span className="block mt-0.5 text-[13px] text-muted truncate">{sc.subtitle}</span>
                </span>
                <ArrowUpRight
                  className="w-4 h-4 mt-1 shrink-0 text-faint group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  strokeWidth={1.75}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
