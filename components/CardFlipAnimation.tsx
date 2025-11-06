import React from "react";

interface CardFlipAnimationProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  className?: string;
}

/**
 * A wrapper component for a 3D card flip animation.
 * It's a controlled component; the parent must provide the `isFlipped` state.
 * Relies on TailwindCSS utility classes for 3D transforms.
 * The parent element should have a `perspective` style for the 3D effect to be visible.
 * e.g., <div style={{ perspective: '1000px' }}> or a `perspective` utility class.
 */
const CardFlipAnimation: React.FC<CardFlipAnimationProps> = ({
  frontContent,
  backContent,
  isFlipped,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${
        isFlipped ? "[transform:rotateY(180deg)]" : ""
      } ${className}`}
    >
      {/* Front Face */}
      <div className="absolute w-full h-full [backface-visibility:hidden]">
        {frontContent}
      </div>

      {/* Back Face */}
      <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
        {backContent}
      </div>
    </div>
  );
};

export default CardFlipAnimation;
