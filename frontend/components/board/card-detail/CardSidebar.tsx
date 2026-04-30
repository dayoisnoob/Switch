"use client";

import { useClickOutside } from "@/hooks/board/index"; // <-- Imported click outside hook
import { useCreateLabel } from "@/hooks/useCreateLabel";
import { useToggleAssignee } from "@/hooks/useToggleAssignee";
import useToggleLabel from "@/hooks/useToggleLabel";
import { useUpdateCard } from "@/hooks/useUpdateCard";
import { useWorkspaceStore } from "@/store/workspace.store";
import { PriorityEnum } from "@/types";
import {
  BoardAssignee,
  BoardCard,
  BoardColumn,
  BoardLabel,
} from "@/types/board.types";
import { Calendar, Check, Circle, Flag, Plus, Trash2 } from "lucide-react"; // <-- Added Check icon
import Image from "next/image";
import { useRef, useState } from "react";
import { SidebarDropdown } from "./SidebarDropdown";
import { SidebarLabelDropdown } from "./SidebarLabels";
import { PRIORITY_COLOR, PRIORITY_OPTIONS } from "@/lib/constants";
import { useMoveCard } from "@/hooks/useCards";
import { useDeleteCard } from "@/hooks/useDeleteCard";
import { useRouter } from "next/navigation";

interface CardSidebarProps {
  card: BoardCard;
  columns: BoardColumn[];
  currentColumn: BoardColumn | undefined;
  workspaceLabels: BoardLabel[];
  workspaceSlug: string;
  projectSlug: string;
}

export function CardSidebar({
  card,
  columns,
  currentColumn,
  workspaceLabels,
  workspaceSlug,
  projectSlug,
}: CardSidebarProps) {
  // TODO: use mutation for remaining api operations and use optimistic ui in zustand store
  const [localPriority, setLocalPriority] = useState<PriorityEnum>(
    card.priority,
  );
  const [dueDate, setDueDate] = useState<string | null>(card.dueDate || null);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false); // <-- Added state

  const dateInputRef = useRef<HTMLInputElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);

  const workspaceMembers = useWorkspaceStore((s) => s.workspaceMembers);
  const membersLoading = useWorkspaceStore((s) => s.membersLoading);
  useClickOutside(assigneeRef, () => setAssigneeDropdownOpen(false));

  const { mutate: moveCard } = useMoveCard();
  const { mutate: deleteCard } = useDeleteCard(card.id, currentColumn!.id);

  const { mutate: createAndAttachLabel } = useCreateLabel(card, workspaceSlug);
  const { mutate: toggleLabel } = useToggleLabel(card);
  const { mutate: toggleAssignee } = useToggleAssignee(card);
  const { mutate: updateCard } = useUpdateCard(card.id);

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

  const router = useRouter();
  const handleDeleteCard = () => {
    if (!card.id) return;
    deleteCard();
    router.replace(`/${workspaceSlug}/${projectSlug}`);
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
          moveCard({ cardId: card.id, toColumnId: colId, order: 0 });
        }}
      />

      <div className="mt-auto pt-4 border-t border-white/5">
        <button
          onClick={handleDeleteCard}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors"
        >
          <Trash2 size={14} /> Delete card
        </button>
      </div>
    </div>
  );
}
