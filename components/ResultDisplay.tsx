import React, { useState } from 'react';
import type { ProductType } from '../types';

interface ResultDisplayProps {
  sourceImageUrls: string[];
  designDescription: string | null;
  generatedImage: string | null;
  onExtract: (productType: ProductType) => void;
  onRecreate: () => void;
  onExtractOriginal: (productType: ProductType) => void;
  onReset: () => void;
  error: string | null;
}

const ActionCard: React.FC<{
  step: number;
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}> = ({ step, title, description, buttonText, onClick, disabled, children }) => (
  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full flex flex-col">
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
        {step}
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
    <div className="flex-grow flex flex-col mb-4">{children}</div>
    {buttonText && onClick && (
        <button
        onClick={onClick}
        disabled={disabled}
        className="w-full mt-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
        {buttonText}
        </button>
    )}
  </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  sourceImageUrls,
  designDescription,
  generatedImage,
  onExtract,
  onRecreate,
  onExtractOriginal,
  onReset,
  error,
}) => {
  const [productType, setProductType] = useState<ProductType>('t-shirt');

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    // The extracted original is PNG, the recreated one is JPEG.
    const fileExtension = generatedImage.startsWith('data:image/png') ? 'png' : 'jpeg';
    link.download = `brand-extractor-design.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="w-full space-y-8">
       {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Source Image Column */}
        <div className="lg:col-span-1 bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-4">Your Image(s)</h3>
            <div className={`w-full grid ${sourceImageUrls.length > 1 ? 'grid-cols-2 gap-2' : 'grid-cols-1'} `}>
              {sourceImageUrls.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`Source view ${index + 1}`} 
                  className="rounded-lg shadow-lg w-full object-contain aspect-square bg-slate-700" 
                />
              ))}
            </div>
             <button onClick={onReset} className="mt-6 w-full px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">
              Start Over
            </button>
        </div>

        {/* Actions Column */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ActionCard
            step={1}
            title="Extract Design"
            description="AI will analyze the image(s) and describe the design."
            buttonText="Extract Description"
            onClick={() => onExtract(productType)}
            disabled={!!designDescription}
          >
             <div className="flex-grow flex flex-col justify-center">
                {!designDescription ? (
                    <>
                        <label htmlFor="product-type-select" className="block text-sm font-medium text-slate-300 mb-2">Confirm Product Type:</label>
                        <select
                        id="product-type-select"
                        value={productType}
                        onChange={(e) => setProductType(e.target.value as ProductType)}
                        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        >
                        <option value="t-shirt">T-Shirt</option>
                        <option value="mug">Mug</option>
                        <option value="item">Other Item</option>
                        </select>
                    </>
                ) : (
                    <div className="bg-slate-900/50 p-4 rounded-lg h-full overflow-y-auto max-h-48 border border-slate-700">
                        <p className="text-slate-300 whitespace-pre-wrap">{designDescription}</p>
                    </div>
                )}
            </div>
          </ActionCard>

          <ActionCard
            step={2}
            title="Generate Final Design"
            description={generatedImage ? "Your design is ready!" : "Extract the original or have AI create a new version."}
          >
             <div className="flex-grow flex items-center justify-center bg-slate-900/50 rounded-lg border border-slate-700">
                {generatedImage ? (
                    <img src={generatedImage} alt="Generated Design" className="w-full h-full object-contain p-2"/>
                ) : (
                    <p className="text-slate-500">New design will appear here</p>
                )}
            </div>
            <div className="mt-4">
                {generatedImage ? (
                    <button
                        onClick={handleDownload}
                        className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download Design
                    </button>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => onExtractOriginal(productType)}
                            disabled={!designDescription || !!generatedImage}
                            className="w-full px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            Extract Original
                        </button>
                        <button
                            onClick={onRecreate}
                            disabled={!designDescription || !!generatedImage}
                            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            Recreate with AI
                        </button>
                    </div>
                )}
            </div>
          </ActionCard>
        </div>
      </div>
    </div>
  );
};