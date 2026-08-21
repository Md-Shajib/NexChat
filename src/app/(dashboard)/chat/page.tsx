import type { Metadata } from "next";

import { EmptyState } from "@/shared/components/empty-state";

export const metadata: Metadata = {
  title: "Chats",
};

/**
 * The `/chat` index.
 *
 * On desktop this is the placeholder beside the sidebar; on mobile the sidebar
 * fills the screen and this is hidden.
 */
export default function ChatIndexPage() {
  return (
    <div className="hidden flex-1 items-center justify-center md:flex">
      <EmptyState
        title="Pick a conversation"
        description="Choose someone from the list, or search for a new person to talk to."
      />
    </div>
  );
}
