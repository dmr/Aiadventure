// Test stub for the `virtual:pwa-register/react` module, which only exists when
// the vite-plugin-pwa plugin runs. Vitest aliases the virtual import here so
// components using useRegisterSW can render in jsdom without a service worker.
export function useRegisterSW() {
  return {
    offlineReady: [false, () => {}] as [boolean, (v: boolean) => void],
    needRefresh: [false, () => {}] as [boolean, (v: boolean) => void],
    updateServiceWorker: async () => {},
  };
}
