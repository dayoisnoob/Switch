"use client";

import { CheckCircle2 } from "lucide-react";

export default function CardActivity() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#161b22]">
          <CheckCircle2 size={14} className="text-[#8b949e]" />
        </div>

        <div>
          <p className="text-sm text-[#c9d1d9]">
            <span className="font-semibold text-white">Dayo</span> created this
            card
          </p>

          <p className="mt-1 text-xs text-[#8b949e]">2 hours ago</p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-[#30363d] p-6 text-center text-sm text-[#8b949e]">
        More activity will appear here.
      </div>
    </div>
  );
}
