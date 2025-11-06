import React, { useState, useEffect } from "react";
import { QuestionMarkIcon } from "./icons/StaticIcons";

interface CardFlipAnimationProps {
  imageUrl: string;
  onAnimationComplete: () => void;
}

const CardFlipAnimation: React.FC<CardFlipAnimationProps> = ({
  imageUrl,
  onAnimationComplete,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [isPreFlipping, setIsPreFlipping] = useState(false);

  useEffect(() => {
    let glowTimer: number;
    let flipTimer: number;
    let completeTimer: number;

    const img = new Image();
    img.onload = () => {
      setImageAspectRatio(img.naturalWidth / img.naturalHeight);

      // 1. Start the "glow" animation.
      setIsPreFlipping(true);

      // 2. After the glow animation finishes, remove its class and start the flip.
      glowTimer = window.setTimeout(() => {
        setIsPreFlipping(false); // Stop the glow animation

        // Use a minimal timeout to ensure the DOM updates before adding the flip class
        flipTimer = window.setTimeout(() => {
          setIsFlipped(true); // Start the flip animation
        }, 10);
      }, 800); // Duration of glow animation (0.8s)

      // 3. Schedule the completion callback after all animations are finished.
      completeTimer = window.setTimeout(() => {
        onAnimationComplete();
      }, 2010); // 800ms glow + 10ms buffer + 1200ms flip
    };
    img.src = imageUrl;

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(flipTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete, imageUrl]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 animate-fade-in">
      <div className="scene w-full max-w-sm">
        <div
          className={`card relative w-full ${isPreFlipping ? "pre-flip" : ""} ${
            isFlipped ? "is-flipped" : ""
          }`}
          style={{
            // Use the calculated aspect ratio, with a fallback for initial render
            aspectRatio: imageAspectRatio ? `${imageAspectRatio}` : "2.5 / 3.5",
            // Hide the card until the aspect ratio is known to prevent a "pop"
            visibility: imageAspectRatio ? "visible" : "hidden",
          }}
        >
          {/* Card Back */}
          <div className="card-face card-face--back absolute w-full h-full bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
            <div className="w-4/5 h-4/5 border-2 border-amber-400/50 rounded-md flex items-center justify-center">
              <QuestionMarkIcon className="w-24 h-24 text-amber-400/60" />
            </div>
          </div>
          {/* Card Front */}
          <div className="card-face card-face--front absolute w-full h-full bg-gray-700 rounded-lg">
            <img
              src={imageUrl}
              alt="Scanned Clue"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardFlipAnimation;
