import { useRegisterSW } from 'virtual:pwa-register/react';

// Small, unobtrusive PWA status surface:
//  - confirms "offline ready" once the service worker has cached the shell
//  - offers a reload when a new version is waiting
// Styled to match the warm café palette; sits bottom-right, above game UI.
export function PwaReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] max-w-xs rounded-xl border border-border bg-card/95 px-4 py-3 text-sm text-card-foreground shadow-lg backdrop-blur"
    >
      {needRefresh ? (
        <div className="flex flex-col gap-2">
          <span>Eine neue Version ist verfügbar.</span>
          <div className="flex gap-2">
            <button
              className="rounded-md bg-primary px-3 py-1 text-primary-foreground"
              onClick={() => updateServiceWorker(true)}
            >
              Neu laden
            </button>
            <button className="rounded-md px-3 py-1 text-muted-foreground" onClick={close}>
              Später
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>☕ Offline spielbereit.</span>
          <button className="ml-auto text-muted-foreground" onClick={close} aria-label="Schließen">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
