"use client";

import { useClickOutside } from "@/hooks/board/index"; // <-- Imported click outside hook
import { useToggleAssignee } from "@/hooks/useToggleAssignee";
import { useUpdateCard } from "@/hooks/useUpdateCard";
import { pickLabelColor } from "@/lib/utils";
import { LabelService } from "@/services/labels.service";
import { useBoardStore } from "@/store/board.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { PriorityEnum } from "@/types";
import {
  BoardAssignee,
  BoardCard,
  BoardColumn,
  BoardLabel,
} from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Circle, Flag, Plus, Trash2 } from "lucide-react"; // <-- Added Check icon
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { SidebarDropdown } from "./SidebarDropdown";
import { SidebarLabelDropdown } from "./SidebarLabels";

interface CardSidebarProps {
  card: BoardCard;
  columns: BoardColumn[];
  currentColumn: BoardColumn | undefined;
  workspaceLabels: BoardLabel[];
  workspaceSlug: string;
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
  workspaceSlug,
}: CardSidebarProps) {
  const queryClient = useQueryClient();
  const [localPriority, setLocalPriority] = useState<PriorityEnum>(
    card.priority,
  );
  const [dueDate, setDueDate] = useState<string | null>(card.dueDate || null);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false); // <-- Added state

  const dateInputRef = useRef<HTMLInputElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  const workspaceMembers = useWorkspaceStore((s) => s.workspaceMembers);
  const membersLoading = useWorkspaceStore((s) => s.membersLoading);
  const removeLabelFromCard = useBoardStore((s) => s.removeLabelFromCard);
  const addLabelToCard = useBoardStore((s) => s.addLabelToCard);
  const { mutate: toggleAssignee } = useToggleAssignee(card);

  const { mutate: updateCard } = useUpdateCard(card.id);

  const { mutate: toggleLabel } = useMutation({
    mutationFn: async ({
      labelId,
      isAttached,
    }: {
      labelId: string;
      isAttached: boolean;
    }) => {
      if (isAttached) {
        return await LabelService.removeFromCard(card.id, labelId);
      } else {
        return await LabelService.attachToCard(card.id, labelId);
      }
    },

    onMutate: async ({ labelId, isAttached }) => {
      await queryClient.cancelQueries({ queryKey: ["card", card.id] });

      if (isAttached) {
        removeLabelFromCard(card.id, labelId);
      } else {
        const label = workspaceLabels.find((l) => l.id === labelId);
        if (label) addLabelToCard(card.id, label);
      }

      return { previousIsAttached: isAttached, labelId };
    },

    onError: (error, variables, context) => {
      if (context) {
        if (context.previousIsAttached) {
          const label = workspaceLabels.find((l) => l.id === context.labelId);
          if (label) addLabelToCard(card.id, label);
        } else {
          removeLabelFromCard(card.id, context.labelId);
        }
      }

      toast.error("Failed to update label. Reverting...");
      console.error(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", card.id] });
    },
  });

  const { mutate: createAndAttachLabel } = useMutation({
    mutationFn: async (name: string) => {
      const existingColors = workspaceLabels.map((l) => l.color);
      const colour = pickLabelColor(name, existingColors);
      const newLabel = await LabelService.create(workspaceSlug, {
        name,
        colour,
      });

      await LabelService.attachToCard(card.id, newLabel.id);
      return newLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaceLabels", workspaceSlug],
      });
      queryClient.invalidateQueries({ queryKey: ["card", card.id] });
      toast.success("Label created and attached");
    },
  });

  useClickOutside(assigneeRef, () => setAssigneeDropdownOpen(false));

  const handlePriorityChange = (val: string) => {
    const priority = val as PriorityEnum;
    if (priority === localPriority) return;
    setLocalPriority(priority);
    updateCard({ priority });
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setDueDate(val);
    updateCard({ dueDate: new Date(val) });
  };

  const priorityLabel =
    localPriority !== "none"
      ? localPriority.charAt(0).toUpperCase() + localPriority.slice(1)
      : "No Priority";

  return (
    <div className="w-full md:w-[260px] shrink-0 border-l border-white/5 bg-[#0E0E14] p-5 flex flex-col gap-5">
      <SidebarDropdown
        label="Priority"
        icon={<Flag size={14} />}
        value={priorityLabel}
        valueClass={PRIORITY_COLOR[localPriority]}
        options={PRIORITY_OPTIONS}
        onSelect={handlePriorityChange}
      />

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
                    width={24}
                    height={24}
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
              <Plus size={13} /> Add assignee
            </div>
          )}
        </div>

        {assigneeDropdownOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-[#13131C] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="max-h-56 overflow-y-auto p-1">
              {membersLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-4 h-4 border-2 border-[#7C6EF5]/30 border-t-[#7C6EF5] rounded-full animate-spin" />
                </div>
              ) : workspaceMembers?.length > 0 ? (
                workspaceMembers.map((member) => {
                  const isAssigned = card.assignees?.some(
                    (a: BoardAssignee) => a.userId === member.userId,
                  );
                  return (
                    <button
                      key={member.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAssignee({ member, isAssigned });
                      }}
                      className="w-full flex items-center justify-between gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        {member.avatarUrl ? (
                          <Image
                            src={member.avatarUrl}
                            alt={member.firstName || "User avatar"}
                            width={20}
                            height={20}
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

      <SidebarLabelDropdown
        projectLabels={workspaceLabels}
        selectedLabels={card.labels || []}
        onToggleLabel={(labelId) => {
          const isAttached = card.labels?.some((l) => l.id === labelId);
          toggleLabel({ labelId, isAttached });
        }}
        onCreateLabel={(name) => {
          createAndAttachLabel(name);
        }}
      />

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

      <div className="mt-auto pt-4 border-t border-white/5">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
          <Trash2 size={14} /> Delete card
        </button>
      </div>
    </div>
  );
}
