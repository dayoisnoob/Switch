"use client";

import { cn } from "@/lib/utils";
import { Portal } from "@/components/ui/Portal";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";

// Mock Data for Assignees to match your screenshot
const MOCK_ASSIGNEES = [
  {
    id: "1",
    name: "James Dalton",
    email: "james@acme.io",
    initials: "JD",
    color: "bg-purple-500",
  },
  {
    id: "2",
    name: "Aisha Mensah",
    email: "aisha@acme.io",
    initials: "AM",
    color: "bg-emerald-500",
  },
  {
    id: "3",
    name: "Marcus Reid",
    email: "marcus@acme.io",
    initials: "MR",
    color: "bg-amber-500",
  },
];

export default function AddCardModal({
  isOpen,
  onClose,
  columnName = "In Progress",
  projectName = "Design System",
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  columnName?: string;
  projectName?: string;
  onAdd: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignees: [] as string[],
    column: columnName,
  });

  if (!isOpen) return null;

  const toggleAssignee = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(id)
        ? prev.assignees.filter((a) => a !== id)
        : [...prev.assignees, id],
    }));
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[500px] bg-[#0D0D12] border border-white/[0.08] rounded-[20px] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Header - Tighter Padding */}
          <div className="p-5 pb-0 flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="w-9 h-9 bg-[#7C6EF5]/10 border border-[#7C6EF5]/20 rounded-lg flex items-center justify-center mb-2">
                <Plus size={18} className="text-[#7C6EF5]" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Add a card
              </h2>
              <div className="text-[11px] font-medium text-white/30">
                Adding to: <span className="text-white/60">{columnName}</span> ·{" "}
                <span className="text-white/60">{projectName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/20 hover:text-white transition-colors mt-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content - Reduced space-y and max-h */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                autoFocus
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#7C6EF5]/50 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-white/10 outline-none transition-all"
              />
            </div>

            {/* Description - Reduced to 2 rows */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Description
              </label>
              <textarea
                placeholder="Add more context (optional)"
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-[#7C6EF5]/50 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-white/10 outline-none transition-all resize-none"
              />
            </div>

            {/* Grid: Priority & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Priority
                </label>
                <div className="relative">
                  {/* FIX: Added [color-scheme:dark] and styled options */}
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-white appearance-none outline-none focus:border-[#7C6EF5]/50 [color-scheme:dark] [&>option]:bg-[#0D0D12]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Due date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#7C6EF5]/50 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Assignees
              </label>
              <div className="space-y-0.5">
                {MOCK_ASSIGNEES.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => toggleAssignee(user.id)}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.03] cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white",
                          user.color,
                        )}
                      >
                        {user.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-white/90">
                          {user.name}
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-4 h-4 rounded border transition-all flex items-center justify-center mr-1",
                        formData.assignees.includes(user.id)
                          ? "bg-[#7C6EF5] border-[#7C6EF5]"
                          : "border-white/10 bg-transparent group-hover:border-white/20",
                      )}
                    >
                      {formData.assignees.includes(user.id) && <CheckIcon />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Column
              </label>
              <div className="relative">
                {/* FIX: Added [color-scheme:dark] and styled options */}
                <select
                  value={formData.column}
                  onChange={(e) =>
                    setFormData({ ...formData, column: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[13px] text-white appearance-none outline-none focus:border-[#7C6EF5]/50 [color-scheme:dark] [&>option]:bg-[#0D0D12]"
                >
                  <option value="Backlog">Backlog</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Footer - Tighter Padding */}
          <div className="p-4 bg-[#09090D] border-t border-white/[0.05] flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onAdd(formData)}
              disabled={!formData.title.trim()}
              className="px-5 py-2 bg-[#7C6EF5] hover:bg-[#6b5ee6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[13px] font-bold text-white flex items-center gap-2 shadow-[0_0_15px_rgba(124,110,245,0.2)] transition-all"
            >
              <Plus size={14} strokeWidth={3} />
              Add card
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// Small Check Helper
function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 3L4.5 8.5L2 6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
