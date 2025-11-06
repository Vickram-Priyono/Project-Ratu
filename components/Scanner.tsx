
import React, { useEffect, useRef } from 'react';

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
    scanConfig: { fps: number; qrbox: { width: number; height: number } },
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
  // Use a ref for the scanner instance to ensure it's stable across renders
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementId = "qr-reader";

  useEffect(() => {
    // Only initialize the scanner once
    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
    }
    const html5QrCode = scannerRef.current;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

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

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col">
      <div id={elementId} className="w-full flex-grow"></div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[250px] h-[250px]">
            {/* Faint background box as a guide */}
            <div className="w-full h-full border-2 border-white/20 rounded-lg shadow-lg"></div>
            
            {/* Prominent corners that align perfectly with the box */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-amber-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-amber-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-amber-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-amber-400 rounded-br-lg"></div>
        </div>
      </div>
      <div className="w-full p-4 bg-gray-900/80 backdrop-blur-sm flex justify-center sticky bottom-0">
        <button
          onClick={onCancel}
          className="px-8 py-3 bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Scanner;
