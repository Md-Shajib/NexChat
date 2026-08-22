"use client";

import { useState } from "react";

import type { User } from "@/domains/user/user.types";
import { getUserFacingMessage } from "@/shared/lib/error-handler";
import { IconSearch } from "@/shared/icons";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

import { useStartConversation } from "../hooks/use-start-conversation";
import { useUserSearch } from "../hooks/use-user-search";
import { UserSearchResults } from "./user-search-results";

type NewConversationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * "Search by number or name, then start the conversation" — the PDF's flow for
 * Part 1, in one step: pick a person and you land in the chat.
 *
 * The mutation is idempotent server-side, so re-selecting someone you already
 * talk to simply reopens that conversation rather than creating a duplicate.
 */
export function NewConversationModal({
  isOpen,
  onClose,
}: NewConversationModalProps) {
  const [term, setTerm] = useState("");
  const search = useUserSearch(term);
  const startConversation = useStartConversation();

  const handleSelect = (user: User) => {
    startConversation.mutate(
      { userId: user.id },
      {
        onSuccess: () => {
          setTerm("");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New conversation"
      description="Find someone by name or phone number."
    >
      <div className="space-y-4">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            autoFocus
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Name or +8801700000000"
            aria-label="Search people"
            className="pl-9"
          />
        </div>

        {startConversation.isError ? (
          <p role="alert" className="text-sm text-danger">
            {getUserFacingMessage(startConversation.error)}
          </p>
        ) : null}

        <UserSearchResults
          users={search.data}
          // Treat the debounce gap as loading, so the list never flashes
          // "No one found" between keystrokes.
          isLoading={search.isLoading || search.isDebouncing}
          isError={search.isError}
          error={search.error}
          isEnabled={search.isEnabled}
          onSelect={handleSelect}
        />
      </div>
    </Modal>
  );
}
