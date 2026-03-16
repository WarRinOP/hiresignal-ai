"use client";

import { useEffect } from "react";

export function HowItWorksModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-bg-surface border border-border-default shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border-default bg-bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-text-primary">What is HireSignal?</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6 text-sm text-text-secondary leading-relaxed">

          {/* Hero */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <p className="text-text-primary font-medium text-base">
              HireSignal reads a resume and a job description, then tells you in seconds whether this candidate is worth interviewing — and exactly why.
            </p>
          </div>

          {/* Problem */}
          <div>
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">😩</span> The Problem
            </h3>
            <p>
              Hiring managers and recruiters spend hours reading resumes. Most of them don&apos;t match the role. By the time you shortlist candidates, you&apos;ve already wasted half a day — and you might have still missed the best person.
            </p>
          </div>

          {/* What it does */}
          <div>
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">✅</span> What HireSignal Does
            </h3>
            <p>You paste in a resume and a job description. The AI reads both and gives you:</p>
            <ul className="mt-3 space-y-2 pl-1">
              {[
                ["🎯", "A match score (0–100%)", "How well the candidate fits the role"],
                ["🏆", "A hiring recommendation", "Hire, Consider, or Pass — with a reason"],
                ["✅", "Matched skills", "What the candidate already has"],
                ["❌", "Missing skills", "What gaps they need to fill"],
                ["✍️", "Resume improvements", "Specific rewrites to strengthen their bullet points"],
                ["📄", "A full PDF report", "Ready to share with your team"],
              ].map(([icon, title, desc]) => (
                <li key={title as string} className="flex gap-3">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <span><span className="text-text-primary font-medium">{title}</span> — {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to test */}
          <div>
            <h3 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🚀</span> How to Try It Right Now
            </h3>
            <div className="space-y-3">
              {[
                ["1", "Click <strong class=\"text-text-primary\">Load Sample Data</strong> — it pre-fills a real resume and job description for you"],
                ["2", "Hit <strong class=\"text-text-primary\">Analyze Match →</strong> and wait about 10 seconds"],
                ["3", "See the score, the recommendation, and the full skills breakdown"],
                ["4", "Click <strong class=\"text-text-primary\">Download Report</strong> to get a shareable PDF"],
                ["5", "Go to <strong class=\"text-text-primary\">History</strong> to see all your past analyses"],
              ].map(([num, step]) => (
                <div key={num as string} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bg-surface2 border border-border-default flex items-center justify-center text-xs font-bold text-accent">{num}</span>
                  <span dangerouslySetInnerHTML={{ __html: step as string }} />
                </div>
              ))}
            </div>
          </div>

          {/* Who it's for */}
          <div>
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">👥</span> Who Is This For?
            </h3>
            <p>
              Recruiters, HR teams, and hiring managers at any company. Whether you&apos;re reviewing 5 CVs or 500, HireSignal turns a 30-minute task into a 30-second one — without losing quality.
            </p>
          </div>

          {/* Demo note */}
          <div className="p-3 rounded-lg text-xs bg-bg-surface2 border border-border-default">
            <span className="text-accent font-medium">Demo limit:</span> You can run up to 5 analyses in this demo. Need unlimited access for your hiring pipeline?{" "}
            <span className="text-text-primary font-medium">Reach out to Abrar Tajwar Khan</span> to get a custom build.
          </div>
        </div>
      </div>
    </div>
  );
}
