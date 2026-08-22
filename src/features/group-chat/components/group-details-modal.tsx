"use client";

import { useState } from "react";

import { canManageGroup } from "@/domains/conversation/conversation.utils";
import type { User } from "@/domains/user/user.types";
import { useCurrentUser } from "@/features/auth";
import {
  UserSearchResults,
  useConversation,
  useUserSearch,
} from "@/features/conversation";
import { ErrorState } from "@/shared/components/error-state";
import { getUserFacingMessage } from "@/shared/lib/error-handler";
import { IconSearch } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { Spinner } from "@/shared/ui/spinner";

import { useGroupActions } from "../hooks/use-group-actions";
import { GroupMemberRow } from "./group-member-row";
import { GroupRenameForm } from "./group-rename-form";

type GroupDetailsModalProps = {
  conversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Group administration.
 *
 * The panel renders to the viewer's permissions rather than showing disabled
 * controls: the API grants rename, add, remove and promote to admins only, and
 * leaving to any member. A plain member therefore sees the roster and a leave
 * button, and nothing they would only be refused.
 *
 * Every mutation refetches the conversation list on success, and the server
 * additionally emits `conversation:updated` to the whole group — so other
 * members' clients update through the socket without any extra work here.
 */
export function GroupDetailsModal({
  conversationId,
  isOpen,
  onClose,
}: GroupDetailsModalProps) {
  const { data: currentUser } = useCurrentUser();
  const { conversation, isError, error, refetch } = useConversation(
    conversationId ?? undefined,
  );

  const actions = useGroupActions(conversationId ?? "");

  const [term, setTerm] = useState("");
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const search = useUserSearch(term);

  const canManage = conversation
    ? canManageGroup(conversation, currentUser?.id)
    : false;

  const memberIds = conversation?.members.map((member) => member.id) ?? [];

  const isBusy =
    actions.rename.isPending ||
    actions.addMembers.isPending ||
    actions.removeMember.isPending ||
    actions.promote.isPending ||
    actions.leave.isPending;

  const actionError =
    actions.rename.error ??
    actions.addMembers.error ??
    actions.removeMember.error ??
    actions.promote.error ??
    actions.leave.error;

  const handleAdd = (user: User) => {
    actions.addMembers.mutate([user.id], { onSuccess: () => setTerm("") });
  };

  const handleLeave = () => {
    if (!currentUser) return;
    // The hook navigates away from a conversation we can no longer read.
    actions.leave.mutate(currentUser.id, { onSuccess: onClose });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={conversation?.name ?? "Group"}
      description={
        conversation
          ? `${conversation.members.length} members`
          : "Loading group details"
      }
    >
      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !conversation ? (
        <div className="flex justify-center py-8">
          <Spinner className="size-5 text-muted" />
        </div>
      ) : conversation.type !== "group" ? (
        <p className="py-6 text-center text-sm text-muted">
          This is a direct conversation — there is nothing to manage.
        </p>
      ) : (
        <div className="space-y-6">
          {actionError ? (
            <p role="alert" className="text-sm text-danger">
              {getUserFacingMessage(actionError)}
            </p>
          ) : null}

          {canManage ? (
            <GroupRenameForm
              // Remount when the name changes upstream so the field picks up
              // a rename made by another admin instead of holding a stale draft.
              key={conversation.name}
              currentName={conversation.name}
              isPending={actions.rename.isPending}
              onRename={(name) => actions.rename.mutate(name)}
            />
          ) : null}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Members
            </h3>
            <ul className="mt-1 divide-y divide-border">
              {conversation.members.map((member) => (
                <GroupMemberRow
                  key={member.id}
                  member={member}
                  isAdmin={conversation.admins.includes(member.id)}
                  isSelf={member.id === currentUser?.id}
                  canManage={canManage}
                  isBusy={isBusy}
                  onPromote={(userId) => actions.promote.mutate(userId)}
                  onRemove={(userId) => actions.removeMember.mutate(userId)}
                />
              ))}
            </ul>
          </section>

          {canManage ? (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Add people
              </h3>

              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  type="search"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="Search by name or number"
                  aria-label="Search people to add"
                  className="pl-9"
                />
              </div>

              {term.trim().length > 0 ? (
                <UserSearchResults
                  users={search.data}
                  isLoading={search.isLoading || search.isDebouncing}
                  isError={search.isError}
                  error={search.error}
                  isEnabled={search.isEnabled}
                  onSelect={handleAdd}
                  disabledIds={memberIds}
                  disabledLabel="Already in this group"
                />
              ) : null}
            </section>
          ) : null}

          <section className="border-t border-border pt-4">
            {isConfirmingLeave ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  Leave this group? You&apos;ll need an admin to add you back.
                </p>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={actions.leave.isPending}
                    onClick={handleLeave}
                  >
                    Leave
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsConfirmingLeave(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onClick={() => setIsConfirmingLeave(true)}
                className="text-danger hover:text-danger"
              >
                Leave group
              </Button>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
