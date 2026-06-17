import { useEffect } from "react";
import { useLocation } from "wouter";

/** Reset scroll on route change; honor hash anchors (e.g. /about#faqs). */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    const hashIndex = location.indexOf("#");

    if (hashIndex !== -1) {
      const hash = location.slice(hashIndex);
      const timer = window.setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, left: 0 });
        }
      }, 100);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0 });
    return undefined;
  }, [location]);

  return null;
}
