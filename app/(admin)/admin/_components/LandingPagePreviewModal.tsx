"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface LandingPagePreviewModalProps {
  onClose: () => void;
}

export default function LandingPagePreviewModal({ onClose }: LandingPagePreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [showReadonlyHint, setShowReadonlyHint] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const iframeEl = iframeRef.current;
    if (!iframeEl) return;

    let cleanup: (() => void) | undefined;

    const attachReadonlyGuards = () => {
      const doc = iframeEl.contentDocument;
      if (!doc) return;

      const showHint = () => {
        setShowReadonlyHint(true);
        window.setTimeout(() => setShowReadonlyHint(false), 1400);
      };

      const onClickCapture = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        const clickable = target.closest(
          "a, button, [role='button'], [data-clickable='true'], [onclick]"
        );

        if (clickable) {
          event.preventDefault();
          event.stopPropagation();
          showHint();
        }
      };

      const onSubmitCapture = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        showHint();
      };

      doc.addEventListener("click", onClickCapture, true);
      doc.addEventListener("submit", onSubmitCapture, true);

      cleanup = () => {
        doc.removeEventListener("click", onClickCapture, true);
        doc.removeEventListener("submit", onSubmitCapture, true);
      };
    };

    iframeEl.addEventListener("load", attachReadonlyGuards);
    attachReadonlyGuards();

    return () => {
      iframeEl.removeEventListener("load", attachReadonlyGuards);
      cleanup?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[120] bg-black/70">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white text-gray-700 hover:text-black shadow-md flex items-center justify-center"
        aria-label="Close preview"
      >
        <X size={18} />
      </button>

      <div className="absolute inset-0 p-2 sm:p-4">
        <div className="w-full h-full rounded-lg overflow-hidden bg-white shadow-2xl">
          {showReadonlyHint && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-medium">
              Preview mode: interactions are disabled
            </div>
          )}
          <iframe
            ref={iframeRef}
            src="/"
            title="Landing Page Preview"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
