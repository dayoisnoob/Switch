"use client";

import { useState } from "react";
import { Columns, X, Check, AlertCircle } from "lucide-react";
import { useCreateColumn } from "@/hooks/useColumns";

type StatusEnum = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";

interface StatusOption {
  value: StatusEnum;
  label: string;
  description: string;
  colorHex: string;
  fullWidth?: boolean;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "BACKLOG",
    label: "BACKLOG",
    description: "Not yet started",
    colorHex: "#8585a0",
  },
  {
    value: "TODO",
    label: "TODO",
    description: "Ready to pick up",
    colorHex: "#5ba4cf",
  },
  {
    value: "IN_PROGRESS",
    label: "IN_PROGRESS",
    description: "Actively being worked on",
    colorHex: "#7c6ef5",
  },
  {
    value: "DONE",
    label: "DONE",
    description: "Completed work",
    colorHex: "#4aba85",
  },
  {
    value: "CANCELED",
    label: "CANCELED",
    description: "Work that won't be completed — excluded from tracking",
    colorHex: "#ff7070",
    fullWidth: true,
  },
];

export default function CreateColumnModal({
  isOpen,
  onClose,
  boardId,
}: {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}) {
  const [name, setName] = useState("");
  const [mappedStatus, setMappedStatus] = useState<StatusEnum>("IN_PROGRESS");

  const { mutate: createCol, isPending } = useCreateColumn(boardId);

  const handleSubmit = async () => {
    if (!name.trim() || !mappedStatus || !boardId) return;
    createCol({ name, mappedStatus });
    onClose();
    setName("");
    setMappedStatus("IN_PROGRESS");
  };

  if (!isOpen) return null;

  // Grab the currently active option so we can style the feedback snippet at the bottom
  const activeOption = STATUS_OPTIONS.find(
    (opt) => opt.value === mappedStatus,
  )!;

  return (
    // Backdrop overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-lg bg-surface border border-md rounded-xl shadow-soft relative flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-primary transition-colors p-1 focus-ring rounded-sm"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Modal Header */}
        <div className="pt-6 px-6 pb-2 flex flex-col items-start">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-accent-dim text-accent border border-md">
            <Columns size={18} strokeWidth={1.5} />
          </div>
          <h1 className="heading-md text-primary mb-1.5">Add a column</h1>
          <p className="text-sm text-secondary leading-relaxed pr-6">
            Columns organise your board into stages. Give it a name and map it
            to a status.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Column Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary flex gap-1">
              Column name <span className="text-[#9436f6]">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. In Progress"
              autoFocus
              className="input-premium w-full h-10 px-3 text-sm focus-ring"
            />
            <span className="text-xs text-muted mt-0.5">
              Shown as the column header on your board.
            </span>
          </div>

          {/* Status Mapping Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary flex gap-1">
              Status <span className="text-[#9436f6]">*</span>
            </label>
            <span className="text-xs text-muted mb-2">
              Maps this column to a standard workflow stage used across reports
              and filters.
            </span>

            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = mappedStatus === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => setMappedStatus(opt.value)}
                    type="button"
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200 focus-ring ${
                      !isActive && "border-md bg-card hover:bg-overlay"
                    } ${opt.fullWidth ? "col-span-2" : "col-span-1"}`}
                    style={
                      isActive
                        ? {
                            borderColor: opt.colorHex,
                            backgroundColor: `${opt.colorHex}24`,
                          }
                        : {}
                    }
                  >
                    {/* Colored Status Dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: opt.colorHex }}
                    />

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-bold tracking-wide mb-0.5 ${
                          !isActive ? "text-primary" : ""
                        }`}
                        style={isActive ? { color: opt.colorHex } : {}}
                      >
                        {opt.label}
                      </div>
                      <div
                        className={`text-xs leading-snug ${
                          !isActive ? "text-secondary" : ""
                        }`}
                        style={
                          isActive ? { color: opt.colorHex, opacity: 0.8 } : {}
                        }
                      >
                        {opt.description}
                      </div>
                    </div>

                    {/* Active Checkmark */}
                    {isActive && (
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className="shrink-0 mt-0.5"
                        style={{ color: opt.colorHex }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 bg-surface border-t border-md rounded-b-xl">
          <button
            onClick={onClose}
            className="btn-ghost h-9 px-4 text-sm font-medium focus-ring"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isPending}
            className="btn-primary h-9 px-4 text-sm font-semibold flex items-center gap-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Create column
          </button>
        </div>
      </div>
    </div>
  );
}
