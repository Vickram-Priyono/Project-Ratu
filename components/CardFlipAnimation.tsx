import React, { useState, useEffect, useRef } from "react";
import { QuestionMarkIcon } from "./icons/StaticIcons";

interface CardFlipAnimationProps {
  imageUrl: string;
  onAnimationComplete: () => void;
}

// A Base64 encoded WAV file for a subtle card flip sound to avoid adding extra assets.
const CARD_FLIP_SOUND =
  "data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAAABkYXRhZAEAAADg/38A7//+APr//wD8//4A/f/+APz//gD3//8A4f/9AMv//QDQ//sA0v/zAO/ /4AD//+gA6//uAPf/9gDh//sA6f/2APX//AD6//8A/f//AP3//gD7//8A8f/2AOP/7ADe//IA5v/oAOv/+gD///wABgAAAPz//gD///sA//+5AP//uwD//7oA//+8AP//wQD//8oA// /OAP//2AD//+QA//+RAP//igD//5YA//+iAP//pwD//6sA//+pAP//pQD//6YA//+aAP//lgD//5EA//+CAP//dQD//1sA//9MAP//PAD//zQA//85AP//QgD//1EA//9bAP//YwD//2EA //9bAP//VQD//08A//9MAP//QQD//zsA//82AP//NwD//zwA//8/AP//QwD//0sA//9QAP//VQD//1kA//9dAP//YgD//2MA//9jAP//YQD//1wA//9WAP//UAD//0wA//9IAP//RAD/ /z8A//89AP//PQD//z0A//8+AP//QAD//0MA//9GAP//SgD//04A//9QAP//VAD//1gA//9bAP//XgD//18A//9eAP//WwD//1gA//9WAP//UQD//00A//9JAP//RAD//0AA//8+AP//OQD/ /zkA//85AP//OgD//zsA//8+AP//QAD//0MA//9GAP//SAD//0sA//9OAP//UAD//1MA//9WAP//VwD//1YA//9VAP//UwD//1EA//9OAP//SwD//0gA//9EAP//QAD//z4A//87AP//OgD/ /zcA//82AP//NAD//zMA//8zAP//NAD//zgA//86AP//OQD//z0A//8/AP//QAD//0IA//9EAP//RAD//0UA//9EAP//QwD//0EA//8/AP//PQD//zsA//85AP//NAD//zIA//8wAP//LwD/ /y4A//8uAP//LwD//zEA//8yAP//NAD//zcA//85AP//OQD//zwA//89AP//PQD//zwA//86AP//NwD//zQA//8xAP//LwD//y0A//8qAP//KAD//ycA//8nAP//KAD//yoA//8sAP//LgD/ /y4A//8uAP//LAD//yoA//8oAP//JgD//yQA//8hAP//HgD//xsA//8ZAP//GAD//xcA//8WAP//FgD//xYA//8XAP//GAD//xgA//8ZAP//GwD//x0A//8fAP//IgD//yUA//8nAP//KwD//y4A/ /y8A//8vAP//LwD//y4A//8sAP//KQD//yYA//8hAP//HQD//xoA//8XAP//EwD//xIA//8QAP//DwD//w0A//8LAP//CgD//wkA//8IAP//CAD//wgA//8JAP//CgD//wsA//8NAP//DgD/ /w8A//8QAP//EQD//xMA//8VAP//FwD//xk=";

const CardFlipAnimation: React.FC<CardFlipAnimationProps> = ({
  imageUrl,
  onAnimationComplete,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [isPreFlipping, setIsPreFlipping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio object once on component mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(CARD_FLIP_SOUND);
    }
  }, []);

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

          // Play the flip sound effect
          if (audioRef.current) {
            audioRef.current.currentTime = 0; // Rewind to start
            audioRef.current.play().catch((error) => {
              // Autoplay was prevented by the browser.
              console.error("Audio play failed:", error);
            });
          }
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
