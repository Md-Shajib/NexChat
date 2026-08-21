import type { ReactNode } from "react";

import { ChatSocketBoundary } from "@/features/chat";
import { ConversationSidebar } from "@/features/conversation";

/**
 * The chat shell.
 *
 * Pure composition: the socket boundary wraps the segment so one connection
 * serves every conversation, and the sidebar sits alongside whichever
 * conversation is routed into `children`.
 *
 * On mobile the sidebar and the panel are separate screens — the list is the
 * `/chat` index route, and opening a conversation replaces it.
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatSocketBoundary>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <ConversationSidebar />
        {children}
      </div>
    </ChatSocketBoundary>
  );
}
