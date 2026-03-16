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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg sm:mx-4 overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-bg-surface border border-border-default shadow-2xl"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border-default" />
        </div>

        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-border-default bg-bg-surface">
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
        <div className="px-5 py-5 space-y-5 text-sm text-text-secondary leading-relaxed pb-8">

          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <p className="text-text-primary font-medium text-base">
              HireSignal reads a resume and a job description, then tells you in seconds whether this candidate is worth interviewing — and exactly why.
            </p>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">😩</span> The Problem
            </h3>
            <p>Hiring managers spend hours reading resumes that don&apos;t match. By the time you shortlist candidates, you&apos;ve already wasted half a day — and might have missed the best person.</p>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">✅</span> What HireSignal Does
            </h3>
            <p>Paste in a resume and job description. The AI gives you:</p>
            <ul className="mt-3 space-y-2 pl-1">
              {[
                ["🎯", "A match score (0–100%)", "How well the candidate fits"],
                ["🏆", "A hiring recommendation", "Hire, Consider, or Pass — with a reason"],
                ["✅", "Matched skills", "What they already have"],
                ["❌", "Missing skills", "What gaps they need to fill"],
                ["✍️", "Resume improvements", "Specific bullet point rewrites"],
                ["📄", "A full PDF report", "Ready to share with your team"],
              ].map(([icon, title, desc]) => (
                <li key={title as string} className="flex gap-3">
                  <span className="text-base flex-shrink-0">{icon}</span>
                  <span><span className="text-text-primary font-medium">{title}</span> — {desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🚀</span> How to Try It Right Now
            </h3>
            <div className="space-y-3">
              {[
                ["1", "Click <strong class=\"text-text-primary\">Load Sample Data</strong> — it pre-fills a real resume and job description"],
                ["2", "Hit <strong class=\"text-text-primary\">Analyze Match →</strong> and wait about 10 seconds"],
                ["3", "See the score, recommendation, and full skills breakdown"],
                ["4", "Click <strong class=\"text-text-primary\">Download Report</strong> to get a shareable PDF"],
                ["5", "Go to <strong class=\"text-text-primary\">History</strong> to see all past analyses"],
              ].map(([num, step]) => (
                <div key={num as string} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bg-surface2 border border-border-default flex items-center justify-center text-xs font-bold text-accent">{num}</span>
                  <span dangerouslySetInnerHTML={{ __html: step as string }} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
              <span className="text-lg">👥</span> Who Is This For?
            </h3>
            <p>Recruiters, HR teams, and hiring managers. Whether you&apos;re reviewing 5 CVs or 500, HireSignal turns a 30-minute task into a 30-second one.</p>
          </div>

          <div className="p-3 rounded-lg text-xs bg-bg-surface2 border border-border-default">
            <span className="text-accent font-medium">Demo limit:</span> You can run up to 5 analyses in this demo.{" "}
            <span className="text-text-primary font-medium">Reach out to Abrar Tajwar Khan</span> for unlimited access.
          </div>
        </div>
      </div>
    </div>
  );
}
