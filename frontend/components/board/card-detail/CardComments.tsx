"use client";

import { useState } from "react";

export default function CardComments() {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6] text-xs font-bold text-white">
          ME
        </div>

        <div className="flex-1 rounded-lg border border-[#30363d] bg-[#161b22] p-1">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[90px] w-full resize-none bg-transparent p-3 text-sm text-white outline-none placeholder:text-[#8b949e]"
          />

          <div className="border-t border-[#30363d] p-2 flex justify-end">
            <button className="rounded-md bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
              Comment
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-[#30363d] p-6 text-center text-sm text-[#8b949e]">
        No comments yet.
      </div>
    </div>
  );
}
