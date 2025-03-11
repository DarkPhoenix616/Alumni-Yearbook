// File: app/api/get-pdf-url/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET(request: Request) {
  try {
    // Get the PDF ID from the query parameter
    const { searchParams } = new URL(request.url);
    const pdfId = searchParams.get('id');
    
    if (!pdfId) {
      return NextResponse.json({ error: 'PDF ID is required' }, { status: 400 });
    }
    
    // Generate a signed URL for the PDF
    const url = cloudinary.url(pdfId, {
      resource_type: 'raw',
      type: 'private',
      sign_url: true,
      // Optional: Set expiration time (e.g., 1 hour)
      expires_at: Math.floor(Date.now() / 1000) + 3600
    });
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating PDF URL:', error);
    return NextResponse.json({ error: 'Failed to generate PDF URL' }, { status: 500 });
  }
}