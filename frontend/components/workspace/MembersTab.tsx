"use client";

import {
  useUpdateMemberRole,
  useWorkspaceRole,
  Workspace,
  WorkspaceMembers,
} from "@/hooks/useWorkspace";
import { formatDate, getConsistentColor } from "@/lib/utils";
import { ChevronDown, Plus, Search, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import InviteMemberModal from "../modals/InviteMemberModal";
import RemoveMemberModal from "../modals/RemoveMemberModal";
import { MembersSkeleton } from "../skeletons/MembersTab";
import { useGetPendingInvites } from "@/hooks/useInvitations";

export const MembersTab = ({
  members,
  membersLoading,
  activeWorkspace,
}: {
  members: WorkspaceMembers[];
  membersLoading: boolean;
  activeWorkspace: Workspace;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [inviteModal, setInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMembers | null>(
    null,
  );

  const { mutate: updateRole } = useUpdateMemberRole(activeWorkspace.slug);

  const { canManageWorkspace, isOwner } = useWorkspaceRole();

  const { data: pendingInvites, isLoading: pendingInvitesLoading } =
    useGetPendingInvites(activeWorkspace.slug);

  const filteredMembers = members?.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName =
      `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();
    const email = (member.email || "").toLowerCase();
    const matchesSearch =
      fullName.includes(searchLower) || email.includes(searchLower);

    const matchesRole = roleFilter === "All" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (
    e: ChangeEvent<HTMLSelectElement>,
    userId: string,
  ) => {
    const role = e.target.value as "Admin" | "Member";
    updateRole({ userId, role });
  };

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#7C6EF5] transition-colors"
            />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-64 lg:w-72 bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 transition-all shadow-sm"
            />
          </div>

          <div className="relative group">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 pl-3 pr-9 appearance-none bg-black/20 border border-white/10 rounded-lg text-[13px] font-medium text-white/70 hover:text-white hover:bg-black/40 transition-all cursor-pointer focus:outline-none focus:border-[#7C6EF5]/50 focus:ring-4 focus:ring-[#7C6EF5]/10 shadow-sm"
            >
              <option value="All" className="bg-[#13131A] text-white">
                All Roles
              </option>
              <option value="Owner" className="bg-[#13131A] text-white">
                Owner
              </option>
              <option value="Admin" className="bg-[#13131A] text-white">
                Admin
              </option>
              <option value="Member" className="bg-[#13131A] text-white">
                Member
              </option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#7C6EF5] pointer-events-none transition-colors"
            />
          </div>
        </div>

        {canManageWorkspace && (
          <button
            onClick={() => setInviteModal(true)}
            className="h-10 px-5 bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white flex items-center justify-center gap-2 rounded-lg text-[13px] font-semibold transition-all shadow-lg shadow-[#7C6EF5]/20 shrink-0"
          >
            <Plus size={16} /> Invite Member
          </button>
        )}
      </div>

      {membersLoading ? (
        <MembersSkeleton />
      ) : (
        <div className="bg-[#13131A] border border-white/5 rounded-xl overflow-hidden shadow-xl">
          {/* Table Header */}
          <div className="grid grid-cols-[2.5fr_1fr_1fr_auto] gap-4 px-6 py-3.5 border-b border-white/5 bg-white/2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <div>Member</div>
            <div>Joined</div>
            <div>Role</div>
            <div className="w-8"></div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {filteredMembers && filteredMembers.length > 0 ? (
              [...filteredMembers]
                .sort((a, b) => {
                  if (a.role === "Owner") return -1;
                  if (b.role === "Owner") return 1;
                  return 0;
                })
                .map((member: WorkspaceMembers, index: number) => {
                  const name =
                    (member.firstName + " " + member.lastName).trim() ||
                    "Unknown User";
                  const email = member.email || "user@switch.io";
                  const role = member.role || "Member";
                  const joinedDate = formatDate(member.joinedAt);

                  return (
                    <div
                      key={member.id || index}
                      className="group grid grid-cols-[2.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {member.avatarUrl ? (
                          <Image
                            src={member.avatarUrl}
                            alt={name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10 shadow-sm"
                            unoptimized
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/10 shadow-sm"
                            style={{
                              backgroundColor: getConsistentColor(
                                member.id || name,
                              ),
                            }}
                          >
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-semibold text-white/90 truncate">
                            {name}
                          </span>
                          <span className="text-[12px] font-medium text-white/40 truncate mt-0.5">
                            {email}
                          </span>
                        </div>
                      </div>

                      {/* Joined Date */}
                      <div className="text-[13px] text-white/50 font-medium">
                        {joinedDate}
                      </div>

                      {/* Role Control */}
                      <div>
                        {role === "Owner" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#7C6EF5]/10 border border-[#7C6EF5]/20 text-[#7C6EF5] text-[11px] font-bold tracking-wide">
                            Owner
                          </span>
                        ) : isOwner ? (
                          <div className="relative inline-block w-28 group/select">
                            <select
                              value={role}
                              onChange={(e) =>
                                handleRoleChange(e, member.userId)
                              }
                              className="w-full h-8 pl-3 pr-8 appearance-none bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 rounded-md text-[13px] font-medium text-white/70 hover:text-white transition-all focus:outline-none focus:border-[#7C6EF5]/50 focus:bg-black/20 cursor-pointer"
                            >
                              <option
                                value="Admin"
                                className="bg-[#13131A] text-white"
                              >
                                Admin
                              </option>
                              <option
                                value="Member"
                                className="bg-[#13131A] text-white"
                              >
                                Member
                              </option>
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 group-hover/select:text-white/60 pointer-events-none transition-colors"
                            />
                          </div>
                        ) : (
                          <span className="text-[13px] font-medium text-white/50 pl-3">
                            {role}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {role !== "Owner" && canManageWorkspace && (
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="text-white/30 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/20">
                  <Users size={24} />
                </div>
                <span className="text-[14px] font-semibold text-white/90 mb-1">
                  No members found
                </span>
                <span className="text-[13px] text-white/40 max-w-62.5">
                  Try adjusting your search query or role filter to find what
                  you&apos;re looking for.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <InviteMemberModal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        workspace={activeWorkspace}
        pendingInvites={pendingInvites ?? []}
        isLoading={pendingInvitesLoading}
      />

      <RemoveMemberModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        workspaceName={activeWorkspace.name}
        workspaceSlug={activeWorkspace.slug}
      />
    </div>
  );
};
