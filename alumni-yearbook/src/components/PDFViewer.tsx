"use client";

interface PDFViewerProps {
  fileLocation: string;
}

export default function PDFViewer({ fileLocation }: PDFViewerProps) {
  return (
    <div className="w-full h-full border rounded-lg overflow-hidden flex justify-center items-center">
      <iframe 
        src={fileLocation} 
        className="w-[850px] h-[1000px] center"
      />
    </div>
  );
}
