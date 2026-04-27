"use client";

import { useRef, useState } from "react";
import { User, Flag, Calendar, Circle, Trash2, Check } from "lucide-react"; // <-- Added Check icon
import {
  BoardAssignee,
  BoardCard,
  BoardColumn,
  BoardLabel,
} from "@/types/board.types";
import { SidebarDropdown } from "./SidebarDropdown";
import { pickLabelColor } from "@/lib/utils";
import { PriorityEnum } from "@/types";
import { SidebarLabelDropdown } from "./SidebarLabels";
import { CardUpdateType } from "@/services/card.service";
import { useClickOutside } from "@/hooks/board/index"; // <-- Imported click outside hook
import Image from "next/image";

interface CardSidebarProps {
  card: BoardCard;
  columns: BoardColumn[];
  currentColumn: BoardColumn | undefined;
  workspaceLabels: BoardLabel[];
  workspaceMembers: any[]; // <-- Added this (Replace 'any' with your member type if available)
  onUpdateCard: (data: CardUpdateType) => void;
  onCreateLabel: (name: string) => Promise<BoardLabel>;
  onAttachLabel: (labelId: string) => void;
  onRemoveLabel: (labelId: string) => void;
  onAddLabelToCard: (cardId: string, label: BoardLabel) => void;
  onRemoveLabelFromCard: (cardId: string, labelId: string) => void;
  onAddWorkspaceLabel: (label: BoardLabel) => void;
  onToggleAssignee: (memberId: string) => void; // <-- Added this handler
}

const PRIORITY_OPTIONS = [
  { label: "No Priority", value: "none", icon: <Flag size={13} /> },
  {
    label: "Low",
    value: "low",
    icon: <Flag size={13} />,
    colorClass: "text-blue-400",
  },
  {
    label: "Medium",
    value: "medium",
    icon: <Flag size={13} />,
    colorClass: "text-yellow-400",
  },
  {
    label: "High",
    value: "high",
    icon: <Flag size={13} />,
    colorClass: "text-orange-400",
  },
  {
    label: "Urgent",
    value: "urgent",
    icon: <Flag size={13} />,
    colorClass: "text-red-400",
  },
];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-blue-400",
  none: "text-white/40",
};

export function CardSidebar({
  card,
  columns,
  currentColumn,
  workspaceLabels,
  workspaceMembers,
  onUpdateCard,
  onCreateLabel,
  onAttachLabel,
  onRemoveLabel,
  onAddLabelToCard,
  onRemoveLabelFromCard,
  onAddWorkspaceLabel,
  onToggleAssignee,
}: CardSidebarProps) {
  const [localPriority, setLocalPriority] = useState<PriorityEnum>(
    card.priority,
  );
  const [dueDate, setDueDate] = useState<string | null>(card.dueDate || null);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false); // <-- Added state

  const dateInputRef = useRef<HTMLInputElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null); // <-- Added ref for click outside

  useClickOutside(assigneeRef, () => setAssigneeDropdownOpen(false));

  const handlePriorityChange = (val: string) => {
    const priority = val as PriorityEnum;
    if (priority === localPriority) return;
    setLocalPriority(priority);
    onUpdateCard({ priority });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setDueDate(val);
    onUpdateCard({ dueDate: new Date(val) });
  };

  const priorityLabel =
    localPriority !== "none"
      ? localPriority.charAt(0).toUpperCase() + localPriority.slice(1)
      : "No Priority";

  return (
    <div className="w-full md:w-[260px] shrink-0 border-l border-white/5 bg-[#0E0E14] p-5 flex flex-col gap-5">
      {/* Priority */}
      <SidebarDropdown
        label="Priority"
        icon={<Flag size={14} />}
        value={priorityLabel}
        valueClass={PRIORITY_COLOR[localPriority]}
        options={PRIORITY_OPTIONS}
        onSelect={handlePriorityChange}
      />

      {/* Assignees */}
      <div ref={assigneeRef} className="relative">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
          Assignees
        </p>
        <div
          onClick={() => setAssigneeDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A28] border border-white/5 min-h-[38px] cursor-pointer hover:bg-[#1E1E2E] transition-colors"
        >
          {card.assignees && card.assignees.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap pointer-events-none">
              {card.assignees.map((assignee: BoardAssignee) =>
                assignee.avatarUrl ? (
                  <Image
                    key={assignee.id}
                    src={assignee.avatarUrl}
                    alt={assignee.firstName || "User avatar"}
                    width={24} // <-- matches w-6
                    height={24} // <-- matches h-6
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div
                    key={assignee.id}
                    className="w-6 h-6 rounded-full bg-[#7C6EF5]/20 flex items-center justify-center text-[9px] font-bold text-[#7C6EF5] border border-white/10"
                  >
                    {assignee.firstName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                ),
              )}
              {card.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[9px] font-bold text-white/50 border border-white/10">
                  +{card.assignees.length - 3}
                </div>
              )}
              <span className="text-xs text-[#7C6EF5] font-semibold">
                + Add
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-white/30 pointer-events-none">
              <User size={13} /> Unassigned
            </div>
          )}
        </div>

        {/* Assignees Dropdown */}
        {assigneeDropdownOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#13131C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="max-h-56 overflow-y-auto p-1">
              {workspaceMembers?.length > 0 ? (
                workspaceMembers.map((member) => {
                  const isAssigned = card.assignees?.some(
                    (a: BoardAssignee) => a.id === member.id,
                  );
                  return (
                    <button
                      key={member.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleAssignee(member.id);
                      }}
                      className="w-full flex items-center justify-between gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {member.avatarUrl ? (
                          <Image
                            src={member.avatarUrl}
                            alt={member.firstName || "User avatar"}
                            width={20} // <-- matches w-5
                            height={20} // <-- matches h-5
                            className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#7C6EF5]/20 flex items-center justify-center text-[8px] font-bold text-[#7C6EF5] border border-white/10 shrink-0">
                            {member.firstName?.[0]?.toUpperCase() ?? "?"}
                          </div>
                        )}
                        <span className="text-white/70 truncate">
                          {member.firstName} {member.lastName}
                        </span>
                      </div>
                      {isAssigned && (
                        <Check size={14} className="text-[#7C6EF5] shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-xs text-white/40">
                  No members found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Labels */}
      <SidebarLabelDropdown
        projectLabels={workspaceLabels}
        selectedLabels={card.labels || []}
        onToggleLabel={(labelId) => {
          const isSelected = card.labels?.some(
            (l: BoardLabel) => l.id === labelId,
          );
          if (isSelected) {
            onRemoveLabelFromCard(card.id, labelId);
            onRemoveLabel(labelId);
          } else {
            const label = workspaceLabels.find((l) => l.id === labelId);
            if (!label) return;
            onAddLabelToCard(card.id, label);
            onAttachLabel(labelId);
          }
        }}
        onCreateLabel={async (name) => {
          const existingColors = workspaceLabels.map((l) => l.color);
          const colour = pickLabelColor(name, existingColors);
          const newLabel = await onCreateLabel(name);
          onAddWorkspaceLabel(newLabel);
          onAddLabelToCard(card.id, newLabel);
          onAttachLabel(newLabel.id);
        }}
      />

      {/* Due Date */}
      <div>
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
          Due Date
        </p>
        <div
          className="relative group cursor-pointer"
          onClick={() => {
            try {
              dateInputRef.current?.showPicker();
            } catch {
              dateInputRef.current?.focus();
            }
          }}
        >
          <input
            ref={dateInputRef}
            type="date"
            value={dueDate ? new Date(dueDate).toISOString().split("T")[0] : ""}
            onChange={handleDueDateChange}
            className="absolute w-0 h-0 opacity-0 pointer-events-none"
          />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A28] group-hover:bg-[#1E1E2E] border border-white/5 text-sm transition-colors">
            <Calendar size={13} className="text-white/40" />
            <span
              className={
                dueDate ? "text-white/80 font-medium" : "text-white/30"
              }
            >
              {dueDate ? new Date(dueDate).toLocaleDateString() : "No date set"}
            </span>
          </div>
        </div>
      </div>

      {/* Move To */}
      <SidebarDropdown
        label="Move To"
        icon={<Circle size={14} />}
        value={currentColumn?.name || "Unknown"}
        placement="top"
        options={columns.map((col) => ({
          label: col.name,
          value: col.id,
          icon: <Circle size={13} />,
        }))}
        onSelect={(colId) => {
          if (colId === currentColumn?.id) return;
          console.log("Move to column:", colId);
        }}
      />

      {/* Delete — always at the bottom */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
          <Trash2 size={14} /> Delete card
        </button>
      </div>
    </div>
  );
}
