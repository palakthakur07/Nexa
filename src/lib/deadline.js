// Deadline math, computed from today's date — nothing here is hardcoded.

export function daysLeft(deadlineISO) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadlineISO);
  return Math.ceil((d - today) / 86400000);
}

export function deadlineStatus(deadlineISO) {
  const n = daysLeft(deadlineISO);
  if (n < 0) return { label: "Closed", tone: "muted", days: n };
  if (n === 0) return { label: "Closes today", tone: "accent", days: n };
  if (n <= 7) return { label: `Closing soon · ${n} day${n === 1 ? "" : "s"} left`, tone: "accent", days: n };
  if (n <= 30) return { label: `${n} days left`, tone: "warning", days: n };
  return { label: `${n} days left`, tone: "neutral", days: n };
}

export function deadlineBucket(deadlineISO) {
  const n = daysLeft(deadlineISO);
  if (n < 0) return "closed";
  if (n <= 7) return "this-week";
  if (n <= 30) return "this-month";
  if (n <= 90) return "next-3-months";
  return "later";
}

export function formatDeadline(deadlineISO) {
  return new Date(deadlineISO).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}
