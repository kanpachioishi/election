(function registerPwa() {
  const context = {
    isStandalone: isStandalone(),
    canInstall: false,
    deferredPrompt: null,
  };

  window.PWA_CONTEXT = context;
  document.documentElement.dataset.appMode = context.isStandalone ? "standalone" : "browser";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Service worker registration failed", error);
      });
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    context.canInstall = true;
    context.deferredPrompt = event;
    window.dispatchEvent(new CustomEvent("pwa:install-available"));
  });

  window.addEventListener("appinstalled", () => {
    context.canInstall = false;
    context.deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa:installed"));
  });

  function isStandalone() {
    return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }
})();
