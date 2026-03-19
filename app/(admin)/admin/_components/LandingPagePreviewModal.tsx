"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export interface LandingPagePreviewOverrides {
  offerBar?: {
    text: string;
    isActive: boolean;
  };
  heroBanner?: {
    heading: string;
    text: string;
    image?: string | null;
  };
  features?: Array<{
    title: string;
    description: string;
    enabled: boolean;
    icon?: string;
  }>;
  categories?: Array<{
    categoryId: string;
    name: string;
    isActive: boolean;
    imageUrl?: string;
    productCount?: number;
  }>;
}

interface LandingPagePreviewModalProps {
  onClose: () => void;
  overrides?: LandingPagePreviewOverrides;
}

export default function LandingPagePreviewModal({ onClose, overrides }: LandingPagePreviewModalProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [showReadonlyHint, setShowReadonlyHint] = useState(false);

  const applyPreviewOverrides = (doc: Document) => {
    if (!overrides) return;

    if (overrides.offerBar) {
      const offerBar = doc.querySelector("div.bg-pink-500.text-white.text-sm") as HTMLElement | null;
      if (offerBar) {
        offerBar.style.display = overrides.offerBar.isActive ? "flex" : "none";
        const textNode = offerBar.querySelector("p");
        if (textNode) {
          textNode.textContent = overrides.offerBar.text || "";
        }
      }
    }

    if (overrides.heroBanner) {
      const heroSection = doc.querySelector("section.w-full");
      const heroContainer = heroSection?.querySelector("div.relative") as HTMLElement | null;

      if (heroContainer) {
        const headingEl = heroContainer.querySelector("h1") as HTMLElement | null;
        if (headingEl && overrides.heroBanner.heading?.trim()) {
          const words = overrides.heroBanner.heading.trim().split(/\s+/);
          const pinkWord = words[words.length - 1];
          headingEl.innerHTML = words
            .map((word) =>
              word === pinkWord
                ? `<span class=\"text-pink-400\">${word} </span>`
                : `<span>${word} </span>`
            )
            .join("");
        }

        const subtitleEl = heroContainer.querySelector("p") as HTMLElement | null;
        if (subtitleEl && overrides.heroBanner.text?.trim()) {
          subtitleEl.textContent = overrides.heroBanner.text;
        }

        if (overrides.heroBanner.image) {
          const activeHeroImage = heroContainer.querySelector("img.opacity-100") as HTMLImageElement | null;
          const firstHeroImage = heroContainer.querySelector("img") as HTMLImageElement | null;
          const imageTarget = activeHeroImage || firstHeroImage;
          if (imageTarget) {
            imageTarget.src = overrides.heroBanner.image;
          }
        }
      }
    }

    if (overrides.features) {
      const explicitFeaturesSection = doc.querySelector(
        "section[data-cms-features-section='true'], section#try-before-you-buy-section"
      ) as HTMLElement | null;

      const featuresHeading = Array.from(doc.querySelectorAll("h2")).find((heading) =>
        heading.textContent?.toLowerCase().includes("try before you buy")
      ) as HTMLElement | undefined;

      const featuresSection = explicitFeaturesSection ?? (featuresHeading?.closest("section") as HTMLElement | null);
      const cardsGrid = featuresSection?.querySelector("div.grid") as HTMLElement | null;

      if (featuresSection && cardsGrid) {
        const enabledFeatures = overrides.features.filter((feature) => feature.enabled);
        if (enabledFeatures.length > 0) {
          const existingCards = Array.from(cardsGrid.children) as HTMLElement[];

          existingCards.forEach((card, idx) => {
            const feature = enabledFeatures[idx];
            if (!feature) {
              card.style.display = "none";
              return;
            }

            card.style.display = "block";

            const iconContainer = card.querySelector(".w-16.h-16") as HTMLElement | null;
            if (iconContainer) {
              const iconSpan = iconContainer.querySelector("span");
              if (iconSpan) {
                iconSpan.textContent = feature.icon || "✨";
              }
            }

            const titleEl = card.querySelector("h3") as HTMLElement | null;
            if (titleEl) titleEl.textContent = feature.title;

            const descEl = card.querySelector("p") as HTMLElement | null;
            if (descEl) descEl.textContent = feature.description;
          });
        }
      }
    }

    if (overrides.categories) {
      const categoryHeading = Array.from(doc.querySelectorAll("h2")).find((heading) =>
        heading.textContent?.toLowerCase().includes("shop by category")
      ) as HTMLElement | undefined;

      const categorySection = categoryHeading?.closest("section") as HTMLElement | null;
      const categoryGrid = categorySection?.querySelector("div.grid") as HTMLElement | null;

      if (categorySection && categoryGrid) {
        const activeCategories = overrides.categories.filter((category) => category.isActive);
        const existingCards = Array.from(categoryGrid.children) as HTMLElement[];

        existingCards.forEach((card, idx) => {
          const category = activeCategories[idx];
          if (!category) {
            card.style.display = "none";
            return;
          }

          card.style.display = "flex";

          const img = card.querySelector("img") as HTMLImageElement | null;
          const fallbackEmoji = card.querySelector("span") as HTMLElement | null;

          if (category.imageUrl) {
            if (img) {
              img.src = category.imageUrl;
              img.alt = category.name;
              img.style.display = "block";
            }
            if (fallbackEmoji && fallbackEmoji.textContent?.includes("📦")) {
              fallbackEmoji.style.display = "none";
            }
          } else {
            if (img) {
              img.style.display = "none";
            }
            if (fallbackEmoji && fallbackEmoji.textContent?.includes("📦")) {
              fallbackEmoji.style.display = "block";
            }
          }

          const nameEl = card.querySelector("p, span.text-[11px], span.text-sm") as HTMLElement | null;
          if (nameEl) nameEl.textContent = category.name;

          const countEl = card.querySelector("span.text-[9px], span.text-[10px]") as HTMLElement | null;
          if (countEl) {
            if (typeof category.productCount === "number") {
              countEl.textContent = `${category.productCount} items`;
              countEl.style.display = "inline";
            } else {
              countEl.style.display = "none";
            }
          }
        });
      }
    }
  };

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

      window.setTimeout(() => applyPreviewOverrides(doc), 2200);
      window.setTimeout(() => applyPreviewOverrides(doc), 3500);

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

    return () => {
      iframeEl.removeEventListener("load", attachReadonlyGuards);
      cleanup?.();
    };
  }, [overrides]);

  return (
    <div className="fixed inset-0 z-120 bg-black/70">
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
