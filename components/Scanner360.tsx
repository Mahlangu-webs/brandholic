
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Scanner360Props {
  onScanComplete: (files: File[]) => void;
  onCancel: () => void;
}

const SCAN_STEPS = [
  { title: 'Front View', instruction: 'Center the front of the item in the frame.' },
  { title: 'Right View', instruction: 'Slowly rotate the item to the right.' },
  { title: 'Back View', instruction: 'Continue rotating to show the back.' },
  { title: 'Left View', instruction: 'Finish by showing the left side.' },
];

type Capture = {
    file: File;
    previewUrl: string;
}

export const Scanner360: React.FC<Scanner360Props> = ({ onScanComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [captures, setCaptures] = useState<Capture[]>([]);

  useEffect(() => {
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
      captures.forEach(capture => URL.revokeObjectURL(capture.previewUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCancel]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && step < SCAN_STEPS.length) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob(blob => {
        if (blob) {
            const file = new File([blob], `capture-${step}.jpg`, { type: "image/jpeg" });
            const previewUrl = URL.createObjectURL(blob);
            setCaptures(prev => [...prev, { file, previewUrl }]);
            setStep(prev => prev + 1);
        }
      }, 'image/jpeg');
    }
  }, [step]);

  const handleDone = () => {
    onScanComplete(captures.map(c => c.file));
  }
  
  const currentStepInfo = SCAN_STEPS[step];

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
        <h2 className="text-3xl font-bold text-white mb-2">360° Item Scan</h2>
        {currentStepInfo && <p className="text-indigo-300 text-xl mb-4">{currentStepInfo.title}</p>}
        
        <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl aspect-video rounded-lg shadow-xl border-2 border-slate-700"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        {currentStepInfo && <p className="text-slate-300 text-lg mt-4 h-6">{currentStepInfo.instruction}</p>}

        <div className="my-6 grid grid-cols-4 gap-4 w-full max-w-2xl">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`aspect-square rounded-lg flex items-center justify-center ${captures[index] ? 'border-2 border-green-500' : 'bg-slate-800 border-2 border-dashed border-slate-600'}`}>
                    {captures[index] ? (
                        <img src={captures[index].previewUrl} alt={`Capture ${index+1}`} className="w-full h-full object-cover rounded-md" />
                    ) : (
                        <span className="text-slate-500 text-sm">{SCAN_STEPS[index].title}</span>
                    )}
                </div>
            ))}
        </div>

        <div className="flex space-x-4">
            {step < SCAN_STEPS.length ? (
                <button onClick={handleCapture} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                    Capture ({step + 1} / 4)
                </button>
            ) : (
                 <button onClick={handleDone} className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Done
                </button>
            )}
            <button onClick={onCancel} className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">Cancel</button>
        </div>
    </div>
  );
};
