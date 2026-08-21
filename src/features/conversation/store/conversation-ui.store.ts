"use client";

import { create } from "zustand";

type ConversationUiState = {
  /** Sidebar visibility — only meaningful on small screens. */
  isSidebarOpen: boolean;
  /** Which modal, if any, is mounted over the chat shell. */
  activeModal: "new-conversation" | "new-group" | "group-details" | null;
  /** Free-text filter applied to the sidebar list. */
  listFilter: string;
};

type ConversationUiActions = {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  openModal: (modal: NonNullable<ConversationUiState["activeModal"]>) => void;
  closeModal: () => void;
  setListFilter: (filter: string) => void;
};

/** Pure UI state for the chat shell — no server data lives here. */
export const useConversationUiStore = create<
  ConversationUiState & ConversationUiActions
>((set) => ({
  isSidebarOpen: false,
  activeModal: null,
  listFilter: "",

  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),

  setListFilter: (listFilter) => set({ listFilter }),
}));
