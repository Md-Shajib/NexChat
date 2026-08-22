"use client";

import { useState } from "react";

import {
  GROUP_MIN_OTHER_PARTICIPANTS,
  GROUP_NAME_MAX_LENGTH,
} from "@/domains/group/group.schema";
import { getDisplayName } from "@/domains/user";
import type { User } from "@/domains/user/user.types";
import { UserSearchResults, useUserSearch } from "@/features/conversation";
import { getUserFacingMessage } from "@/shared/lib/error-handler";
import { IconClose, IconSearch } from "@/shared/icons";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import { useCreateGroup } from "../hooks/use-create-group";

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Create a group conversation.
 *
 * The API requires **three members minimum** including you, so at least two
 * people must be picked. That rule is surfaced live in the footer rather than
 * only on submit — the button explains why it is disabled instead of just
 * being grey.
 */
export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<User[]>([]);

  const search = useUserSearch(term);
  const createGroup = useCreateGroup();

  const selectedIds = selected.map((user) => user.id);
  const hasEnoughPeople = selected.length >= GROUP_MIN_OTHER_PARTICIPANTS;
  const hasName = name.trim().length > 0;
  const canSubmit = hasName && hasEnoughPeople && !createGroup.isPending;

  const reset = () => {
    setName("");
    setTerm("");
    setSelected([]);
  };

  const toggle = (user: User) => {
    setSelected((current) =>
      current.some((item) => item.id === user.id)
        ? current.filter((item) => item.id !== user.id)
        : [...current, user],
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    createGroup.mutate(
      { name: name.trim(), participantIds: selectedIds },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  const stillNeeded = GROUP_MIN_OTHER_PARTICIPANTS - selected.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New group"
      description="Name it, then add at least two people."
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {!hasEnoughPeople
              ? `Add ${stillNeeded} more ${stillNeeded === 1 ? "person" : "people"}`
              : `${selected.length + 1} members, including you`}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={createGroup.isPending}
          >
            Create group
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          autoFocus
          label="Group name"
          value={name}
          maxLength={GROUP_NAME_MAX_LENGTH}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project Team"
        />

        {selected.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {selected.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => toggle(user)}
                  className="flex items-center gap-1.5 rounded-full bg-surface-hover py-1 pl-1 pr-2 text-xs font-medium transition-colors hover:bg-border"
                >
                  <Avatar id={user.id} name={getDisplayName(user)} size="sm" />
                  <span className="max-w-28 truncate">{getDisplayName(user)}</span>
                  <IconClose className="size-3 text-muted" />
                  <span className="sr-only">Remove {getDisplayName(user)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search people to add"
            aria-label="Search people to add"
            className="pl-9"
          />
        </div>

        {createGroup.isError ? (
          <p role="alert" className="text-sm text-danger">
            {getUserFacingMessage(createGroup.error)}
          </p>
        ) : null}

        <UserSearchResults
          users={search.data}
          isLoading={search.isLoading || search.isDebouncing}
          isError={search.isError}
          error={search.error}
          isEnabled={search.isEnabled}
          onSelect={toggle}
          selectedIds={selectedIds}
        />
      </div>
    </Modal>
  );
}
