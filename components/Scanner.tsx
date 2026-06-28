
import React, { useEffect, useRef, useState } from 'react';

// This is a global variable from the script loaded in index.html
// We provide a minimal type definition to avoid using `any`.
interface Html5QrcodeResult {
  decodedText: string;
}

interface QrCamera {
    id: string;
    label: string;
}

interface Html5QrcodeScanner {
  start(
    // The camera ID can be a string, or a constraints object
    cameraIdOrConfig: string | { facingMode: string },
    scanConfig: { fps: number; qrbox?: { width: number; height: number } },
    successCallback: (decodedText: string, result: Html5QrcodeResult) => void,
    errorCallback: (errorMessage: string) => void
  ): Promise<void>;
  stop(): Promise<void>;
  isScanning: boolean;
}

declare const Html5Qrcode: {
  new (elementId: string): Html5QrcodeScanner;
  getCameras(): Promise<QrCamera[]>;
};


interface ScannerProps {
  onSuccess: (decodedText: string) => void;
  onError: (errorMessage: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onSuccess, onError, onCancel }) => {
  const [isExiting, setIsExiting] = useState(false);
  // Use a ref for the scanner instance to ensure it's stable across renders
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementId = "qr-reader";

  useEffect(() => {
    // Only initialize the scanner once
    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
    }
    const html5QrCode = scannerRef.current;

    const config = { fps: 15 };

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Prefer the back camera
          const backCamera = cameras.find(camera => camera.label.toLowerCase().includes('back'));
          const cameraId = backCamera ? backCamera.id : cameras[0].id;
          
          await html5QrCode.start(
            cameraId,
            config,
            (decodedText: string) => {
              onSuccess(decodedText);
            },
            () => {
              // This is the error callback for individual scan errors, not initialization errors.
              // We can often ignore these as the scanner keeps trying.
            }
          );
        } else {
            // This case is rare if the user has a camera, but good to handle.
            onError("No cameras found on this device. Please ensure you have a camera connected and enabled.");
        }
      } catch (err: unknown) {
        console.error("Failed to start scanner:", err);
        const message = err instanceof Error ? err.message : "Could not start scanner.";
        
        // Provide more user-friendly error messages based on common issues
        if (message.includes('Permission denied') || message.includes('NotAllowedError')) {
            onError("Camera access denied. Please allow camera permission in your browser settings and refresh the page.");
        } else if (message.includes('NotFoundError')) {
            onError("No camera found. Please ensure a camera is connected and not in use by another application.");
        } else {
            onError(`Failed to start camera: ${message}`);
        }
      }
    };
    
    startScanner();

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      // Check if the scanner instance exists and is actively scanning
      if (html5QrCode && html5QrCode.isScanning) {
        // Stop the scanner and handle potential errors during cleanup
        html5QrCode.stop().catch((err: unknown) => {
          console.error("Failed to stop scanner cleanly", err);
        });
      }
    };
    // Dependencies for the useEffect hook
  }, [onSuccess, onError]);

  const handleCancel = () => {
    setIsExiting(true);
    setTimeout(() => {
      onCancel();
    }, 300); // Wait for animation to complete
  };

  return (
    <div className={`fixed inset-0 bg-black z-40 flex flex-col ${isExiting ? 'animate-slide-out-to-bottom' : 'animate-slide-in-from-bottom'}`}>
      <style>{`
        @keyframes scan-laser {
          0% { top: 5%; opacity: 0.3; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 95%; opacity: 0.3; }
        }
        .scanner-laser {
          animation: scan-laser 2s infinite alternate ease-in-out;
        }
      `}</style>

      {/* Camera feed containers covering the entire screen */}
      <div 
        id={elementId} 
        className="absolute inset-0 w-full h-full bg-black [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:block"
      ></div>

      {/* Top Overlay Indicator */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-50 px-6 text-center pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-md py-2.5 px-5 rounded-full shadow-lg">
          <p className="text-sm font-semibold text-amber-400 tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            Memindai QR Code...
          </p>
        </div>
      </div>

      {/* Center scanning target box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="relative w-[70vw] h-[70vw] max-w-[280px] max-h-[280px]">
          {/* Subtle scanning glow inside the box */}
          <div className="absolute inset-0 bg-amber-400/5 rounded-2xl animate-pulse"></div>

          {/* Faint background box as a guide */}
          <div className="w-full h-full border border-white/20 rounded-2xl shadow-2xl"></div>
          
          {/* Prominent glowing corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-2xl"></div>

          {/* Sweeping Laser Line representing scanning activity */}
          <div className="scanner-laser absolute left-2 right-2 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#fbbf24]"></div>
        </div>
      </div>

      {/* Instruction below scanning target */}
      <div className="absolute bottom-28 left-0 right-0 flex justify-center z-10 px-6 text-center pointer-events-none">
        <p className="text-xs text-slate-300 font-medium bg-black/60 backdrop-blur-sm py-1.5 px-4 rounded-full max-w-[280px]">
          Arahkan kamera ke QR Code berkas / bukti
        </p>
      </div>

      {/* Bottom Floating Control Panel */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 px-4">
        <button
          onClick={handleCancel}
          className="px-8 py-3 bg-red-600/95 hover:bg-red-500 text-white font-semibold rounded-full shadow-lg border border-red-500/30 backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Batal Scan
        </button>
      </div>
    </div>
  );
};

export default Scanner;