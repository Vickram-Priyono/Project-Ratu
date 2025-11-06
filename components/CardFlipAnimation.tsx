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
    let flipTimer: number;
    let completeTimer: number;

    const img = new Image();
    img.onload = () => {
      setImageAspectRatio(img.naturalWidth / img.naturalHeight);

      // Mengurutkan animasi untuk keandalan
      // 1. Mulai animasi "glow" pra-balik segera
      setIsPreFlipping(true);

      // 2. Jadwalkan flip untuk dimulai setelah animasi "glow" selesai
      flipTimer = window.setTimeout(() => {
        setIsFlipped(true);
      }, 800); // Sesuai dengan animasi "glow" 0.8 detik

      // 3. Jadwalkan panggilan kembali penyelesaian setelah total waktu animasi
      completeTimer = window.setTimeout(() => {
        onAnimationComplete();
      }, 2100); // 800ms glow + 1200ms flip + 100ms buffer
    };
    img.src = imageUrl;

    return () => {
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
            // Gunakan rasio aspek yang dihitung, dengan fallback untuk render awal
            aspectRatio: imageAspectRatio ? `${imageAspectRatio}` : "2.5 / 3.5",
            // Sembunyikan kartu sampai rasio aspek diketahui untuk mencegah "pop"
            visibility: imageAspectRatio ? "visible" : "hidden",
          }}
        >
          {/* Bagian Belakang Kartu */}
          <div className="card-face card-face--back absolute w-full h-full bg-gray-800 border-2 border-gray-600 rounded-lg flex items-center justify-center">
            <div className="w-4/5 h-4/5 border-2 border-amber-400/50 rounded-md flex items-center justify-center">
              <QuestionMarkIcon className="w-24 h-24 text-amber-400/60" />
            </div>
          </div>
          {/* Bagian Depan Kartu */}
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
