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

  useEffect(() => {
    // Trigger the flip shortly after the component mounts
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
    }, 100); // A small delay ensures the initial state is rendered first

    // Set a timer to call the completion callback after the animation duration
    const completeTimer = setTimeout(() => {
      onAnimationComplete();
    }, 1500); // Matches animation duration + a buffer

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 animate-fade-in">
      <div className="scene w-full max-w-sm">
        <div
          className={`card relative w-full aspect-[2.5/3.5] ${
            isFlipped ? "is-flipped" : ""
          }`}
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
