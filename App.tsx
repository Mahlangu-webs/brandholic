import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageSelector } from './components/ImageSelector';
import { ResultDisplay } from './components/ResultDisplay';
import { Loader } from './components/Loader';
import { extractDescription, recreateDesign, extractOriginalDesign } from './services/geminiService';
import type { ProductType } from './types';

const App: React.FC = () => {
  const [sourceImages, setSourceImages] = useState<File[] | null>(null);
  const [sourceImageUrls, setSourceImageUrls] = useState<string[] | null>(null);
  const [designDescription, setDesignDescription] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [isLoadingDescription, setIsLoadingDescription] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isLoadingExtraction, setIsLoadingExtraction] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImagesSelect = (files: File[]) => {
    handleReset();
    setSourceImages(files);
    setSourceImageUrls(files.map(file => URL.createObjectURL(file)));
  };

  const fileToGenerativePart = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (base64data) {
          resolve({ base64: base64data, mimeType: file.type });
        } else {
          reject(new Error("Failed to read image file."));
        }
      };
      reader.onerror = () => {
        reject(new Error("Error reading file."));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleExtractDescription = useCallback(async (productType: ProductType) => {
    if (!sourceImages || sourceImages.length === 0) return;

    setError(null);
    setIsLoadingDescription(true);
    setDesignDescription(null);
    setGeneratedImage(null);

    try {
      const imageParts = await Promise.all(sourceImages.map(fileToGenerativePart));
      const description = await extractDescription(imageParts, productType);
      setDesignDescription(description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during description extraction.');
      console.error(err);
    } finally {
      setIsLoadingDescription(false);
    }
  }, [sourceImages]);

  const handleRecreateDesign = useCallback(async () => {
    if (!designDescription) return;

    setError(null);
    setIsLoadingImage(true);
    setGeneratedImage(null);

    try {
      const imageB64 = await recreateDesign(designDescription);
      setGeneratedImage(`data:image/jpeg;base64,${imageB64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during design recreation.');
      console.error(err);
    } finally {
      setIsLoadingImage(false);
    }
  }, [designDescription]);

  const handleExtractOriginal = useCallback(async (productType: ProductType) => {
    if (!sourceImages || sourceImages.length === 0) return;

    setError(null);
    setIsLoadingExtraction(true);
    setGeneratedImage(null);

    try {
      const imageParts = await Promise.all(sourceImages.map(fileToGenerativePart));
      const imageB64 = await extractOriginalDesign(imageParts, productType);
      // The model returns a PNG with transparency
      setGeneratedImage(`data:image/png;base64,${imageB64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during design extraction.');
      console.error(err);
    } finally {
      setIsLoadingExtraction(false);
    }
  }, [sourceImages]);

  const handleReset = () => {
    if(sourceImageUrls) {
      sourceImageUrls.forEach(url => URL.revokeObjectURL(url));
    }
    setSourceImages(null);
    setSourceImageUrls(null);
    setDesignDescription(null);
    setGeneratedImage(null);
    setIsLoadingDescription(false);
    setIsLoadingImage(false);
    setIsLoadingExtraction(false);
    setError(null);
  };

  const getLoadingText = () => {
    if (isLoadingDescription) return "AI is analyzing your image(s)...";
    if (isLoadingImage) return "AI is recreating the design...";
    if (isLoadingExtraction) return "AI is extracting the original design...";
    return "";
  };

  const isLoading = isLoadingDescription || isLoadingImage || isLoadingExtraction;

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {isLoading && <Loader loadingText={getLoadingText()} />}
      <Header />
      <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center">
        {!sourceImageUrls ? (
          <ImageSelector onImagesSelect={handleImagesSelect} />
        ) : (
          <ResultDisplay
            sourceImageUrls={sourceImageUrls}
            designDescription={designDescription}
            generatedImage={generatedImage}
            onExtract={handleExtractDescription}
            onRecreate={handleRecreateDesign}
            onExtractOriginal={handleExtractOriginal}
            onReset={handleReset}
            error={error}
          />
        )}
      </main>
    </div>
  );
};

export default App;