"use client";

import React, { useState, useRef, useId } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  /** Max width of the tooltip panel in px. */
  maxWidth?: number;
  /** Render the trigger inside a span (default) — pass asChild to merge into a single child element. */
  asChild?: boolean;
}

/**
 * Lightweight, dependency-free tooltip.
 *
 * Shows on hover (desktop) and on tap (mobile). Used across the dashboard to
 * keep the visible text minimal while letting users drill into the *why*
 * behind a metric, a category, or a status chip.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  maxWidth = 280,
  asChild = false,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    // Small delay so moving the pointer from trigger to the panel doesn't
    // flicker the tooltip closed.
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  const positionClass =
    side === "top"
      ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
      : side === "bottom"
        ? "top-full mt-2 left-1/2 -translate-x-1/2"
        : side === "left"
          ? "right-full mr-2 top-1/2 -translate-y-1/2"
          : "left-full ml-2 top-1/2 -translate-y-1/2";

  const TriggerWrapper = asChild
    ? (React.Fragment as unknown as React.ElementType)
    : "span";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(e) => {
        // Mobile: toggle on tap without blocking the child action.
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      <TriggerWrapper aria-describedby={open ? id : undefined}>
        {children}
      </TriggerWrapper>
      {open && (
        <span
          role="tooltip"
          id={id}
          className={`absolute z-50 pointer-events-none ${positionClass}`}
          style={{
            maxWidth,
          }}
        >
          <span
            className="block rounded-lg px-3 py-2 text-xs font-sans leading-relaxed shadow-2xl"
            style={{
              background: "#1E1E2C",
              color: "#F0EDE8",
              border: "1px solid rgba(255,255,255,0.1)",
              whiteSpace: "normal",
            }}
          >
            {content}
          </span>
        </span>
      )}
    </span>
  );
}
