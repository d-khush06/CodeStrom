"use client";

import { useEffect } from "react";

const TARGET_TEXTS = ["secured by clerk", "development mode"];

function hideClerkNoise() {
  const nodes = Array.from(document.querySelectorAll("div, p, span, a"));

  for (const node of nodes) {
    const text = node.textContent?.trim().toLowerCase();
    if (!text) continue;

    const isExactLabel = TARGET_TEXTS.some((target) => text === target);
    if (!isExactLabel) continue;

    const nodeEl = node as HTMLElement;
    const nearestRow = nodeEl.closest("[class*='footer'], [class*='Footer'], [class*='secured'], [class*='development']") as HTMLElement | null;

    if (nearestRow) {
      nearestRow.style.display = "none";
      continue;
    }

    const parent = nodeEl.parentElement;
    if (!parent) continue;

    // Hide only compact label rows; do not touch large modal containers.
    const isSmallRow =
      parent.childElementCount <= 3 &&
      parent.getBoundingClientRect().height < 120;

    if (isSmallRow) {
      parent.style.display = "none";
    }
  }
}

export function ClerkCleanup() {
  useEffect(() => {
    hideClerkNoise();

    const observer = new MutationObserver(() => {
      hideClerkNoise();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
