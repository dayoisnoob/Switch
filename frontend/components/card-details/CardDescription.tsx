"use client";

import { useEffect, useRef, useState } from "react";

interface CardDescriptionProps {
  description: string;
  onSave: (value: string) => void;
}

export function CardDescription({ description, onSave }: CardDescriptionProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description || "");
  const [prevDescription, setPrevDescription] = useState(description);

  if (description !== prevDescription) {
    setPrevDescription(description);
    if (!isEditing) {
      setValue(description || "");
    }
  }

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (value !== (description || "")) onSave(value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(description || "");
  };

  return (
    <section>
      <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">
        Description
      </div>
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            placeholder="Add a description..."
            className="w-full min-h-30 bg-[#13131A] border border-[#7C6EF5]/50 focus:ring-1 focus:ring-[#7C6EF5]/30 rounded-xl p-4 text-[14px] text-white/90 placeholder:text-white/25 outline-none resize-none leading-relaxed"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#7C6EF5] hover:bg-[#6B5ED4] text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-white/40 hover:text-white hover:bg-white/5 text-[13px] font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="w-full min-h-25 bg-[#13131A] hover:bg-[#16161F] border border-white/5 hover:border-white/10 rounded-xl p-5 text-[14px] text-white/70 cursor-text transition-all whitespace-pre-wrap leading-relaxed"
        >
          {value || <span className="text-white/25">Add a description...</span>}
        </div>
      )}
    </section>
  );
}
