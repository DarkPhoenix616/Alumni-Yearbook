'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ImageType {
  _id: string;
  cloudinaryUrl: string;
  caption?: string;
  description?: string;
}

export default function PhotosDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/error");
    }
    if (status === "authenticated") {
      fetchImages();
    }
  }, [status, router]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      if (response.ok) {
        setImages(data.images || []);
      } else {
        toast("Error", { description: data.message || "Failed to load images" });
      }
    } catch (error) {
      toast("Error", { description: "Failed to fetch images" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    setSelectedImages(fileArray);
    setPreviewUrls(fileArray.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      toast("Missing Information", { description: "Please select images and add details" });
      return;
    }

    setIsUploading(true);
    
    try {
      const imagePromises = selectedImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => resolve(reader.result as string);
        });
      });

      const base64Images = await Promise.all(imagePromises);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images, description, caption }),
      });

      const data = await response.json();

      if (response.ok) {
        toast("Success", { description: "Images uploaded successfully!" });
        setSelectedImages([]);
        setPreviewUrls([]);
        setDescription('');
        setCaption('');
        fetchImages();
      } else {
        toast("Upload Failed", { description: data.message || "Failed to upload images" });
      }
    } catch (error) {
      toast("Error", { description: "An error occurred while uploading images." });
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Yearbook</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Photos</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-4">
          <Card>
            <CardHeader><CardTitle>Upload Yearbook Photos</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a title..." />
                <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                <Textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." />
                
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {previewUrls.map((url, index) => (
                      <img key={index} src={url} alt="Preview" className="w-24 h-24 object-cover rounded-md" />
                    ))}
                  </div>
                )}

                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload Photos"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mt-4">Yearbook Photos</h2>

          {isLoading ? (
            <div className="p-8 text-center">Loading images...</div>
          ) : images.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {images.map(image => (
                <div key={String(image._id)} className="overflow-hidden rounded-xl">
                  <img src={image.cloudinaryUrl} alt={image.caption || "Uploaded Image"} className="w-full h-48 object-cover" />
                  <div className="p-2 text-sm"><p>{image.caption || "No caption provided"}</p></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">No photos uploaded yet.</div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
