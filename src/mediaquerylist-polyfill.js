// Safari 13: MediaQueryList has addListener/removeListener but no addEventListener/removeEventListener
(function () {
  if (typeof window === "undefined" || !window.matchMedia) return;

  const nativeMatchMedia = window.matchMedia.bind(window);

  window.matchMedia = (query) => {
    const mql = nativeMatchMedia(query);

    if (!mql.addEventListener) {
      mql.addEventListener = (type, listener) => {
        if (type === "change") mql.addListener(listener);
      };
      mql.removeEventListener = (type, listener) => {
        if (type === "change") mql.removeListener(listener);
      };
    }

    return mql;
  };
})();
