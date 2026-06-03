"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

function toggleOverlayEffect(el: HTMLElement, active: boolean) {
  el.classList.toggle("hidden", !active);
}

function toggleNavLinkAriaActive(el: HTMLElement, active: boolean) {
  const anchor = el.closest("a");
  if (!anchor) return;
  anchor.removeAttribute("aria-current");
  if (active) anchor.setAttribute("aria-current", "page");
}

export default function HeaderClientLogic() {
  const pathname = usePathname();

  useEffect(() => {
    document
      .querySelectorAll<HTMLElement>("[data-nav-link-overlay]")
      .forEach((el) => {
        const hrefFromDatAttributes = el.dataset.navLinkOverlay!;

        const active =
          hrefFromDatAttributes === "/"
            ? pathname === "/"
            : pathname.startsWith(hrefFromDatAttributes);

        toggleOverlayEffect(el, active);
        toggleNavLinkAriaActive(el, active);
      });
  }, [pathname]);

  return null;
}
