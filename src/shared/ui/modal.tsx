"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/shared/utils/cn";

import { IconClose } from "@/shared/icons";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Accessible dialog built on the native `<dialog>` element.
 *
 * Using the platform primitive rather than a hand-rolled portal means focus
 * trapping, focus restore, Escape-to-close, inertness of the background and
 * the top-layer stacking context all come from the browser and are correct by
 * construction — none of which is true of a `position: fixed` div.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Escape fires `cancel`; route it through our handler so state stays in sync.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      // Clicking the backdrop (the dialog element itself, outside the panel)
      // closes; clicks inside the panel stop propagating.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-border bg-surface p-0 text-foreground shadow-2xl",
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        "open:animate-in",
        className,
      )}
    >
      <div className="flex max-h-[min(36rem,80vh)] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="space-y-1">
            <h2 id="modal-title" className="text-base font-semibold">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="text-sm text-muted">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <IconClose className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <footer className="border-t border-border px-5 py-3">{footer}</footer>
        ) : null}
      </div>
    </dialog>
  );
}
