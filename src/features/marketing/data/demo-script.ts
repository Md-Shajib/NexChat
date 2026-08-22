/**
 * Seed data for the interactive hero demo.
 *
 * Deliberately a real conversation with a rhythm to it — a scripted exchange
 * reads as a product, whereas "Lorem ipsum 1..20" reads as a placeholder.
 */
export type DemoMessage = {
  id: string;
  author: "them" | "you";
  name: string;
  text: string;
  /** Minutes before "now", so timestamps stay plausible on every visit. */
  minutesAgo: number;
};

export const SEEDED_MESSAGES: DemoMessage[] = [
  {
    id: "s1",
    author: "them",
    name: "Ada",
    text: "Morning — did the pagination fix land?",
    minutesAgo: 34,
  },
  {
    id: "s2",
    author: "you",
    name: "You",
    text: "It did. Turned out the cursor was inclusive, so every page repeated one message.",
    minutesAgo: 33,
  },
  {
    id: "s3",
    author: "them",
    name: "Ada",
    text: "Ha. Classic off-by-one, just wearing a different hat.",
    minutesAgo: 32,
  },
  {
    id: "s4",
    author: "you",
    name: "You",
    text: "Dedupe by id on merge and it's gone.",
    minutesAgo: 31,
  },
  {
    id: "s5",
    author: "them",
    name: "Ada",
    text: "Nice. Scroll back through this thread while I keep typing —",
    minutesAgo: 30,
  },
  {
    id: "s6",
    author: "them",
    name: "Ada",
    text: "you'll see it doesn't drag you back down.",
    minutesAgo: 29,
  },
];

/** Messages that stream in over time, to exercise the scroll behaviour. */
export const INCOMING_MESSAGES: string[] = [
  "That's the whole trick, really.",
  "Auto-scroll when you're at the bottom.",
  "Never when you're reading something.",
  "Most chat UIs get this wrong.",
  "They yank you down mid-sentence.",
  "Try it: scroll up and watch the pill appear.",
  "Your place is kept until you ask for it back.",
  "Tap the pill and you're at the newest message.",
];
