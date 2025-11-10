
import React, { useState, useRef } from 'react';
import type { ProductType } from '../types';
import { Scanner360 } from './Scanner360';

interface ImageSelectorProps {
  onImagesSelect: (files: File[]) => void;
}

const CameraCapture: React.FC<{
  onCapture: (file: File) => void;
  onCancel: () => void;
}> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Could not access camera. Please ensure permissions are granted.");
        onCancel();
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onCancel]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob(blob => {
        if (blob) {
          onCapture(new File([blob], "capture.jpg", { type: "image/jpeg" }));
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
        <video ref={videoRef} autoPlay playsInline className="w-full max-w-3xl rounded-lg shadow-xl"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="mt-6 flex space-x-4">
            <button onClick={handleCapture} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                Capture
            </button>
            <button onClick={onCancel} className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">Cancel</button>
        </div>
    </div>
  );
};


export const ImageSelector: React.FC<ImageSelectorProps> = ({ onImagesSelect }) => {
  const [productType, setProductType] = useState<ProductType>('t-shirt');
  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImagesSelect([event.target.files[0]]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = (file: File) => {
    onImagesSelect([file]);
    setShowCamera(false);
  };
  
  const handleScanComplete = (files: File[]) => {
    onImagesSelect(files);
    setShowScanner(false);
  }

  return (
    <div className="w-full max-w-4xl bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
      {showCamera && <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />}
      {showScanner && <Scanner360 onScanComplete={handleScanComplete} onCancel={() => setShowScanner(false)} />}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Step 1: Choose Product Type</h2>
        <p className="text-slate-400 mb-6">This helps the AI focus on the right area.</p>
        <div className="flex justify-center space-x-4 mb-8">
          {(['t-shirt', 'mug', 'item'] as ProductType[]).map((type) => (
            <button
              key={type}
              onClick={() => setProductType(type)}
              className={`px-6 py-2 rounded-full font-semibold capitalize transition-all duration-200 ${
                productType === type
                  ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-offset-slate-800 ring-indigo-500'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Step 2: Provide an Image</h2>
        <p className="text-slate-400 mb-6">Upload a photo, use your camera, or do a 360° scan for best results.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={handleUploadClick} className="group flex flex-col items-center justify-center p-6 bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-600 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 mb-3 transition-colors">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-lg font-semibold text-white">Upload Image</span>
            <span className="text-sm text-slate-400">Browse your files</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

          <button onClick={() => setShowCamera(true)} className="group flex flex-col items-center justify-center p-6 bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-600 transition-all duration-200">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 mb-3 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
             </svg>
            <span className="text-lg font-semibold text-white">Use Camera</span>
            <span className="text-sm text-slate-400">Take a single photo</span>
          </button>

           <button onClick={() => setShowScanner(true)} className="group flex flex-col items-center justify-center p-6 bg-slate-700 rounded-lg border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-600 transition-all duration-200">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 mb-3 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991 0-3.182-3.182a8.25 8.25 0 0 0-11.667 0l-3.181 3.182M12 5.25v-.008" />
             </svg>
            <span className="text-lg font-semibold text-white">360° Scan</span>
            <span className="text-sm text-slate-400">Capture all angles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
