"use client";

import { ImagePlus, MoreHorizontal, X } from "lucide-react";

interface CardHeaderProps {
  title: string;
  columnName: string;
  titleValue: string;
  setTitleValue: (value: string) => void;
  onSaveTitle: () => void;
  onClose: () => void;
  onOpenCoverUpload: () => void;
}

function getColumnColor(name: string) {
  const value = name.toLowerCase();

  if (value.includes("progress")) return "bg-blue-600";
  if (value.includes("done")) return "bg-green-600";
  if (value.includes("review")) return "bg-amber-500";
  if (value.includes("todo")) return "bg-slate-600";

  const fallback = [
    "bg-purple-600",
    "bg-pink-600",
    "bg-cyan-600",
    "bg-orange-600",
  ];

  const index = name.length % fallback.length;

  return fallback[index];
}

export default function CardHeader({
  title,
  columnName,
  titleValue,
  setTitleValue,
  onSaveTitle,
  onClose,
  onOpenCoverUpload,
}: CardHeaderProps) {
  const headerColor = getColumnColor(columnName);

  return (
    <div className={`${headerColor} px-6 py-5 border-b border-black/20`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {columnName}
          </div>

          <input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={onSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }

              if (e.key === "Escape") {
                setTitleValue(title);
                e.currentTarget.blur();
              }
            }}
            className="w-full bg-transparent text-2xl font-semibold text-white placeholder:text-white/70 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCoverUpload}
            className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ImagePlus size={18} />
          </button>

          <button className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors">
            <MoreHorizontal size={18} />
          </button>

          <button
            onClick={onClose}
            className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
