import { useEffect, useRef } from "react";
import type { Card } from "../shared/types";

const POLL_INTERVAL_MS = 30_000;

function requestPermissionOnce() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

function notify(card: Card) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(`Due: ${card.title}`, {
    body: card.description || "This card is due now.",
  });
}

// Polls for cards with a due date (across all boards, not just the active
// one) and fires a Notification when one comes due. Running the check
// immediately on mount also covers the "app was closed when it was due"
// case — overdue cards notify again the moment the app launches.
export function useDueDateReminders() {
  const timeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    requestPermissionOnce();

    async function sync() {
      const cards = await window.taskApi.cards.listWithDueDates();
      const liveKeys = new Set<string>();

      for (const card of cards) {
        if (!card.due_date) continue;
        const dueTime = new Date(card.due_date).getTime();
        if (Number.isNaN(dueTime)) continue;

        const key = `${card.id}:${card.due_date}`;
        liveKeys.add(key);
        if (timeoutsRef.current.has(key) || notifiedRef.current.has(key)) continue;

        const delay = dueTime - Date.now();
        if (delay <= 0) {
          notifiedRef.current.add(key);
          notify(card);
        } else {
          const timeoutId = setTimeout(() => {
            notifiedRef.current.add(key);
            timeoutsRef.current.delete(key);
            notify(card);
          }, delay);
          timeoutsRef.current.set(key, timeoutId);
        }
      }

      for (const [key, timeoutId] of timeoutsRef.current) {
        if (!liveKeys.has(key)) {
          clearTimeout(timeoutId);
          timeoutsRef.current.delete(key);
        }
      }
    }

    sync();
    const interval = setInterval(sync, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      for (const timeoutId of timeoutsRef.current.values()) clearTimeout(timeoutId);
      timeoutsRef.current.clear();
    };
  }, []);
}
