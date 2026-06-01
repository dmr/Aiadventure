import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// How often to ask the browser to check for a freshly deployed version.
const UPDATE_CHECK_MS = 60_000;

/**
 * PWA lifecycle:
 *  - polls for a new deploy so users never sit on a stale cached bundle,
 *  - auto-applies a new version the moment it's found (one reload), so the app
 *    is always fresh — important because there's no client-side routing, so the
 *    SW would otherwise only update on a manual hard refresh,
 *  - shows a small "offline ready" confirmation once the shell is cached.
 */
export function PwaReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {});
        }, UPDATE_CHECK_MS);
      }
    },
  });

  // Apply a detected update immediately (skipWaiting + one reload). Progress is
  // persisted and the player resumes where they were, so this is unobtrusive.
  useEffect(() => {
    if (needRefresh) updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);

  if (!offlineReady) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-xl border border-border bg-card/95 px-4 py-3 text-sm text-card-foreground shadow-lg backdrop-blur"
    >
      <span>✓ Offline spielbereit.</span>
      <button
        className="ml-auto text-muted-foreground"
        onClick={() => setOfflineReady(false)}
        aria-label="Schließen"
      >
        ✕
      </button>
    </div>
  );
}
