import { createContext, useContext, useMemo, useState } from "react";

const NexaDrawerContext = createContext(null);

export function NexaDrawerProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, openDrawer: () => setOpen(true), closeDrawer: () => setOpen(false) }), [open]);
  return <NexaDrawerContext.Provider value={value}>{children}</NexaDrawerContext.Provider>;
}

export function useNexaDrawer() {
  const ctx = useContext(NexaDrawerContext);
  if (!ctx) throw new Error("useNexaDrawer must be used inside <NexaDrawerProvider>");
  return ctx;
}
