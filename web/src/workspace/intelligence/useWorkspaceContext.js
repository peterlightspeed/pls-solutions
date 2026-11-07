import { useEffect, useSyncExternalStore } from "react";
import { getSnapshot, publishContext, subscribe, unpublishContext } from "./contextStore";

export const useContextSnapshot = () => useSyncExternalStore(subscribe, getSnapshot);

// For modules: contribute context while mounted. `partial` must be plain JSON (labels, ids, counts, flags).
export function usePublishContext(key, partial) {
  const signature = JSON.stringify(partial);
  useEffect(() => {
    publishContext(key, JSON.parse(signature));
    return () => unpublishContext(key);
  }, [key, signature]);
}
