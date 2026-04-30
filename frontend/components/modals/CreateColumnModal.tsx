"use client";

import { useState } from "react";
import { Columns, X, Check, AlertCircle } from "lucide-react";

// The core statuses matching your Drizzle pgEnum
type StatusEnum = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";

interface StatusOption {
  value: StatusEnum;
  label: string;
  description: string;
  colorVar: string;
  fullWidth?: boolean;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "BACKLOG",
    label: "BACKLOG",
    description: "Not yet started",
    colorVar: "var(--color-status-backlog)",
  },
  {
    value: "TODO",
    label: "TODO",
    description: "Ready to pick up",
    colorVar: "var(--color-status-todo)",
  },
  {
    value: "IN_PROGRESS",
    label: "IN_PROGRESS",
    description: "Actively being worked on",
    colorVar: "var(--color-status-in-progress)",
  },
  {
    value: "DONE",
    label: "DONE",
    description: "Completed work",
    colorVar: "var(--color-status-done)",
  },
  {
    value: "CANCELED",
    label: "CANCELED",
    description:
      "Work that won't be completed — excluded from progress tracking",
    colorVar: "var(--color-status-canceled)",
    fullWidth: true, // Spans the full bottom row
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
  // Defaulting to IN_PROGRESS to match the screenshot state
  const [mappedStatus, setMappedStatus] = useState<StatusEnum>("IN_PROGRESS");

  const handleSubmit = () => {
    if (!name.trim() || !mappedStatus) return;

    // Fire your mutation!
    // createColumn({ boardId, name, mappedStatus });
    console.log("Creating Column:", { name, mappedStatus });
  };

  const { mutateAsync: createColumn, isPending } = useCreateColumn();

  const handleSubmit = async () => {
    if (!name.trim() || !mappedStatus) return;

    try {
      await createColumn({
        boardId,
        name,
        mappedStatus,
      });

      // Reset and close on success!
      setName("");
      setMappedStatus("IN_PROGRESS");
      onClose();
    } catch (err) {
      // Handle error (e.g., toast.error)
    }
  };

  if (!isOpen) return null;

  return (
    // Backdrop overlay
    <div
      className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 transition-opacity"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-[500px] bg-[var(--color-surface)] border border-[var(--color-border-md)] rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-card)] p-1 rounded-[var(--radius-sm)] transition-colors"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Modal Header */}
        <div className="pt-6 px-6 pb-2">
          <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center mb-4 bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-glow)]">
            <Columns size={18} strokeWidth={1.5} />
          </div>
          <h1 className="font-[var(--font-heading)] text-[var(--text-xl)] font-[var(--fw-bold)] text-[var(--color-text-primary)] tracking-[var(--tracking-tighter)] mb-1.5">
            Add a column
          </h1>
          <p className="text-[var(--text-base)] text-[var(--color-text-secondary)] leading-relaxed pr-6">
            Columns organise your board into stages. Give it a name and map it
            to a status.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Column Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[var(--text-sm2)] font-[var(--fw-semibold)] text-[var(--color-text-secondary)] flex gap-1">
              Column name <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. In Progress"
              autoFocus
              className="w-full h-[var(--h-input-lg)] bg-[var(--color-card)] border border-[var(--color-border-md)] focus:border-[var(--color-accent)] focus:ring-[3px] focus:ring-[var(--color-accent-dim)] rounded-[var(--radius-sm)] px-3 text-[var(--text-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none transition-all"
            />
            <span className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-1">
              Shown as the column header on your board.
            </span>
          </div>

          {/* Status Mapping Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[var(--text-sm2)] font-[var(--fw-semibold)] text-[var(--color-text-secondary)] flex gap-1">
              Status <span className="text-[var(--color-accent)]">*</span>
            </label>
            <span className="text-[var(--text-sm)] text-[var(--color-text-muted)] mb-2">
              Maps this column to a standard workflow stage used across reports
              and filters.
            </span>

            {/* The Grid */}
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = mappedStatus === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => setMappedStatus(opt.value)}
                    type="button"
                    className={`flex items-start gap-3 p-3 rounded-[var(--radius-md)] border text-left transition-all duration-200 ${
                      isActive
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)]"
                        : "border-[var(--color-border-md)] bg-[var(--color-card)] hover:border-[var(--color-border-hi)] hover:bg-[var(--color-card-hover)]"
                    } ${opt.fullWidth ? "col-span-2" : "col-span-1"}`}
                  >
                    {/* Colored Status Dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-[5px] shrink-0 transition-transform duration-200"
                      style={{ backgroundColor: opt.colorVar }}
                    />

                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[var(--text-sm2)] font-[var(--fw-bold)] tracking-[var(--tracking-wide)] mb-0.5 ${
                          isActive
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--color-text-primary)]"
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div
                        className={`text-[var(--text-sm)] leading-snug ${
                          isActive
                            ? "text-[var(--color-accent)] opacity-80"
                            : "text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {opt.description}
                      </div>
                    </div>

                    {/* Active Checkmark */}
                    {isActive && (
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className="text-[var(--color-accent)] shrink-0 mt-0.5"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Developer Feedback Snippet */}
            <div className="flex items-center gap-2 p-3 mt-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-card)]">
              <AlertCircle
                size={14}
                className="text-[var(--color-text-muted)] shrink-0"
              />
              <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                Status sent to backend:
              </span>
              <code className="text-[var(--color-accent)] bg-[var(--color-accent-dim)] px-2 py-0.5 rounded text-[var(--text-xs)] font-[var(--font-mono)] font-[var(--fw-bold)]">
                {mappedStatus}
              </code>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-5 flex justify-end gap-3 bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-b-[var(--radius-lg)]">
          <button
            onClick={onClose}
            className="h-[var(--h-btn-md)] px-[var(--space-4)] font-[var(--font-body)] text-[var(--text-md)] font-[var(--fw-semibold)] text-[var(--color-text-primary)] bg-[var(--color-card)] border border-[var(--color-border-md)] hover:border-[var(--color-border-hi)] rounded-[var(--radius-sm)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="h-[var(--h-btn-md)] px-[var(--space-4)] font-[var(--font-body)] text-[var(--text-md)] font-[var(--fw-semibold)] text-white bg-[var(--color-accent)] hover:bg-[#6b5ed6] shadow-[var(--shadow-btn-primary)] hover:shadow-[var(--shadow-btn-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-sm)] transition-all flex items-center gap-2"
          >
            + Create column
          </button>
        </div>
      </div>
    </div>
  );
}
