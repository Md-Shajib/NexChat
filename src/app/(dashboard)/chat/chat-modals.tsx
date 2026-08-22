"use client";

import { useParams } from "next/navigation";

import {
  NewConversationModal,
  useConversationUiStore,
} from "@/features/conversation";
import { CreateGroupModal, GroupDetailsModal } from "@/features/group-chat";

/**
 * Route-level composition of the chat shell's dialogs.
 *
 * This lives at the route rather than inside either feature on purpose: both
 * `conversation` and `group-chat` need to be mounted together, and if either
 * one imported the other their public barrels would form a cycle. Composing
 * them here keeps the dependency graph one-directional
 * (`group-chat → conversation`) and matches the rule that pages compose
 * features. It holds no business logic — only wiring.
 */
export function ChatModals() {
  const params = useParams<{ conversationId?: string }>();
  const activeModal = useConversationUiStore((state) => state.activeModal);
  const closeModal = useConversationUiStore((state) => state.closeModal);

  return (
    <>
      <NewConversationModal
        isOpen={activeModal === "new-conversation"}
        onClose={closeModal}
      />
      <CreateGroupModal
        isOpen={activeModal === "new-group"}
        onClose={closeModal}
      />
      <GroupDetailsModal
        conversationId={params?.conversationId ?? null}
        isOpen={activeModal === "group-details"}
        onClose={closeModal}
      />
    </>
  );
}
