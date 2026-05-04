"use client";

import { useMe } from "@/hooks/useAuth";
import {
  useCreateComment,
  useDeleteComment,
  useEditComment,
  useGetComments,
} from "@/hooks/useComments";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500/20 text-blue-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-rose-500/20 text-rose-400",
    "bg-amber-500/20 text-amber-400",
  ];
  return colors[name.length % colors.length];
};

export function CardComments({ cardId }: { cardId: string }) {
  const { data: currentUser, isLoading: userLoading } = useMe();

  const [commentValue, setCommentValue] = useState("");
  const { data: comments = [], isLoading } = useGetComments(cardId);
  const { mutate: createComment, isPending } = useCreateComment(cardId);
  const { mutate: editComment } = useEditComment(cardId);
  const { mutate: deleteComment } = useDeleteComment(cardId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleSubmit = () => {
    if (!commentValue.trim()) return;
    createComment(commentValue);
    setCommentValue(""); // Instantly clear input
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editValue.trim()) return;
    editComment({ commentId, content: editValue });
    setEditingId(null);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!commentId) return;
    deleteComment(commentId);
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="w-5 h-5 border-2 border-[#7C6EF5]/30 border-t-[#7C6EF5] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      {/* ── CREATE COMMENT ── */}
      <div className="flex gap-4">
        <div className="shrink-0 mt-1">
          {currentUser?.avatarUrl ? (
            <Image
              src={currentUser.avatarUrl}
              alt="You"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-white/10"
              unoptimized
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={cn(
                "w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-[11px] font-bold",
                getAvatarColor(currentUser?.firstName as string),
              )}
            >
              {currentUser?.firstName?.charAt(0)?.toUpperCase()}
              {currentUser?.lastName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col rounded-xl border border-white/10 bg-[#13131A] focus-within:border-[#7C6EF5]/50 focus-within:ring-1 focus-within:ring-[#7C6EF5]/20 transition-all overflow-hidden shadow-sm">
          <textarea
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
            placeholder="Write a comment..."
            className="w-full bg-transparent p-3 text-[13px] text-white/90 placeholder:text-white/30 outline-none resize-none min-h-[80px] custom-scrollbar"
          />
          <div className="bg-white/[0.02] border-t border-white/5 p-2 flex justify-between items-center">
            <span className="text-[10px] text-white/20 font-medium px-2 hidden sm:block tracking-wide">
              Pro tip: Cmd/Ctrl + Enter to send
            </span>
            <button
              onClick={handleSubmit}
              disabled={!commentValue.trim() || isPending}
              className="px-4 py-1.5 ml-auto bg-[#7C6EF5] hover:bg-[#6B5ED4] disabled:bg-[#7C6EF5]/30 disabled:text-white/30 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors"
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {/* ── COMMENTS LIST ── */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => {
            const initials =
              `${comment.author.firstName?.[0] || ""}${comment.author.lastName?.[0] || ""}`.toUpperCase();
            const isOptimistic = comment.id.startsWith("temp-");
            const isEditing = editingId === comment.id;
            const isOwner = currentUser?.id === comment.author.id;

            return (
              <div
                key={comment.id}
                className={cn(
                  "flex gap-4 group transition-opacity",
                  isOptimistic && "opacity-50 pointer-events-none",
                )}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {comment.author.avatarUrl ? (
                    <Image
                      src={comment.author.avatarUrl}
                      alt={comment.author.firstName}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                      unoptimized
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-[11px] font-bold",
                        getAvatarColor(comment.author.firstName),
                      )}
                    >
                      {initials || "?"}
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[14px] font-bold text-white/90">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-[11px] font-medium text-white/40">
                        {isOptimistic
                          ? "Posting..."
                          : formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                      </span>
                      {comment.isEdited && !isOptimistic && (
                        <span className="text-[10px] text-white/30 font-medium">
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Hover Actions */}
                    {isOwner && !isOptimistic && !isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditValue(comment.content);
                          }}
                          className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-md transition-all"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Row */}
                  {isEditing ? (
                    <div className="flex flex-col rounded-xl border border-[#7C6EF5]/50 bg-[#13131A] ring-1 ring-[#7C6EF5]/20 overflow-hidden mt-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            handleSaveEdit(comment.id);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full bg-transparent p-3 text-[13px] text-white/90 placeholder:text-white/30 outline-none resize-none min-h-[70px] custom-scrollbar"
                        autoFocus
                      />
                      <div className="bg-white/[0.02] border-t border-white/5 p-2 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-white/40 hover:text-white hover:bg-white/5 text-[12px] font-semibold rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={
                            !editValue.trim() || editValue === comment.content
                          }
                          className="px-3 py-1.5 bg-[#7C6EF5] hover:bg-[#6B5ED4] disabled:bg-[#7C6EF5]/30 disabled:text-white/30 text-white text-[12px] font-semibold rounded-lg transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#13131A] border border-white/5 rounded-xl rounded-tl-none p-4 text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center border-2 border-white/5 border-dashed rounded-xl bg-white/[0.01]">
            <p className="text-[13px] text-white/40 font-medium">
              No comments yet. Start the conversation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
