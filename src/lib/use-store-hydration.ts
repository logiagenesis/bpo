import { useEffect } from "react";
import { useApex } from "./store";

/**
 * Loads the operator's saved workspace out of localStorage *after* React has
 * hydrated. The store persists with `skipHydration`, so the first client render
 * matches the server-rendered seed; this swaps in the real data on mount.
 */
export function useStoreHydration() {
  useEffect(() => {
    void useApex.persist.rehydrate();
  }, []);
}
