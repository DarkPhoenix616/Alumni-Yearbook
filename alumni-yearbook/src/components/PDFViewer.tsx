"use client";

import { useState, useEffect } from 'react';

interface PDFViewerProps {
  fileLocation: string;
}

export default function PDFViewer({ fileLocation }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract the PDF ID from the Cloudinary URL
  const extractPdfId = (url: string): string | null => {
    try {
      // Match Cloudinary URL pattern and extract the ID
      const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\?.*)?$/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (err) {
      console.error('Error parsing Cloudinary URL:', err);
      return null;
    }
  };

  // Check if a string is a Cloudinary URL
  const isCloudinaryUrl = (url: string): boolean => {
    return url.includes('cloudinary.com');
  };

  // Check if a string is a local file path
  const isLocalPath = (path: string): boolean => {
    return path.startsWith('/') || path.startsWith('./') || path.startsWith('../');
  };

  useEffect(() => {
    async function fetchSignedUrl() {
      try {
        setIsLoading(true);
        
        // Extract the PDF ID from the provided URL
        const pdfId = extractPdfId(fileLocation);
        
        if (!pdfId) {
          throw new Error('Could not extract PDF ID from the provided URL');
        }
        
        // Call our API route to get a signed URL
        const response = await fetch(`/api/pdf/view?id=${pdfId}`);
        
        if (!response.ok) {
          throw new Error('Failed to get signed PDF URL');
        }
        
        const data = await response.json();
        setPdfUrl(data.url);
      } catch (err) {
        console.error('Error fetching PDF URL:', err);
        setError('Unable to load the PDF. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    if (fileLocation) {
      // Handle based on type of path
      if (isCloudinaryUrl(fileLocation)) {
        // It's a Cloudinary URL, get a signed URL
        fetchSignedUrl();
      } else {
        // It's either a local path or some other URL, use it directly
        setPdfUrl(fileLocation);
        setIsLoading(false);
      }
    } else {
      setError('No file location provided');
      setIsLoading(false);
    }
  }, [fileLocation]);

  if (isLoading) {
    return (
      <div className="w-full h-full border rounded-lg overflow-hidden flex justify-center items-center">
        <div>Loading PDF...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full border rounded-lg overflow-hidden flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden flex justify-center items-center">
      {pdfUrl ? (
        <iframe 
          src={pdfUrl} 
          className="w-[850px] h-[1000px] center"
        />
      ) : (
        <div>No PDF URL available</div>
      )}
    </div>
  );
}