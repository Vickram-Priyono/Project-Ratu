import React, { useEffect, useRef } from 'react';

// This is a global variable from the script loaded in index.html
// We provide a minimal type definition to avoid using `any`.
interface Html5QrcodeResult {
  decodedText: string;
}

interface Html5QrcodeScanner {
  start(
    cameraConfig: { facingMode: string },
    scanConfig: { fps: number; qrbox: { width: number; height: number } },
    successCallback: (decodedText: string, result: Html5QrcodeResult) => void,
    errorCallback: (errorMessage: string) => void
  ): Promise<void>;
  stop(): Promise<void>;
  isScanning: boolean;
}

declare const Html5Qrcode: {
  new (elementId: string): Html5QrcodeScanner;
};


interface ScannerProps {
  onSuccess: (decodedText: string) => void;
  onError: (errorMessage: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onSuccess, onError, onCancel }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementId = "qr-reader";

  useEffect(() => {
    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
    }
    const html5QrCode = scannerRef.current;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText: string) => {
            onSuccess(decodedText);
          },
          () => {
            // This is the error callback for scan errors, not initialization errors.
            // We can often ignore these as the scanner keeps trying.
            // console.warn(`QR scan error: ${errorMessage}`);
          }
        );
      } catch (err: unknown) {
        console.error("Failed to start scanner:", err);
        const message = err instanceof Error ? err.message : "Could not start scanner.";
        onError(message);
      }
    };
    
    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((err: unknown) => {
          console.error("Failed to stop scanner cleanly", err);
        });
      }
    };
  }, [onSuccess, onError]);

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col">
      <div id={elementId} className="w-full flex-grow"></div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[250px] h-[250px] border-4 border-amber-400/50 rounded-lg shadow-lg">
          <div className="relative w-full h-full">
            <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-amber-400"></div>
            <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-amber-400"></div>
            <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-amber-400"></div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-amber-400"></div>
          </div>
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