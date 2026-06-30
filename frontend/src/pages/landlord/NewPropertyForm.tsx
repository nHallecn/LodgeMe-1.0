/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { propertiesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormInput } from "@/components/FormInput";
import { FormTextarea } from "@/components/FormTextarea";
import { propertyCreateSchema, type PropertyCreateFormData } from "@/lib/validations";

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 2;
const COMPRESS_WIDTH = 1200; // resize to max this width before encoding

// Compress + convert File to base64 via canvas
const compressToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, COMPRESS_WIDTH / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      // quality 0.75 keeps file size low while preserving appearance
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });

const NewPropertyForm = () => {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images,     setImages]     = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [uploading,  setUploading]  = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyCreateFormData>({
    resolver: zodResolver(propertyCreateSchema),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = "";
      return;
    }

    const toProcess = files.slice(0, remaining);
    const oversized = toProcess.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length) {
      setImageError(`Each image must be under ${MAX_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      // Compress each image before encoding — reduces payload from ~2MB to ~200KB per image
      const compressed = await Promise.all(toProcess.map(compressToBase64));
      setImages((prev) => [...prev, ...compressed].slice(0, MAX_IMAGES));
    } catch {
      setImageError("Failed to process images. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (data: PropertyCreateFormData) => {
    try {
      await propertiesAPI.create({
        name:         data.name,
        city:         data.city,
        neighborhood: data.neighborhood,
        description:  data.description,
        totalRooms:   data.totalRooms,
        amenities:    data.amenities || [],
        images,
      });
      toast({ title: "Property created successfully" });
      navigate("/landlord/properties");
    } catch (err: any) {
      toast({
        title: "Failed to create property",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Add New Property" subtitle="List a new property on LodgeMe">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <FormInput
                  label="Property Name"
                  placeholder="e.g. Modern Apartment in Douala"
                  error={errors.name}
                  required
                  {...register("name")}
                />

                <FormTextarea
                  label="Description"
                  placeholder="Describe your property — location, features, nearby landmarks..."
                  error={errors.description}
                  required
                  {...register("description")}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="City"
                    placeholder="e.g. Douala"
                    error={errors.city}
                    required
                    {...register("city")}
                  />
                  <FormInput
                    label="Neighborhood"
                    placeholder="e.g. Bonaberi"
                    error={errors.neighborhood}
                    required
                    {...register("neighborhood")}
                  />
                </div>

                <FormInput
                  label="Total Rooms"
                  placeholder="e.g. 5"
                  type="number"
                  error={errors.totalRooms}
                  required
                  {...register("totalRooms")}
                />

                <FormInput
                  label="Amenities (comma separated)"
                  placeholder="e.g. WiFi, Parking, Security, Water Tank"
                  error={errors.amenities as any}
                  {...register("amenities")}
                />

                {/* ── Image upload ─────────────────────────────────── */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Property Photos{" "}
                    <span className="text-muted-foreground font-normal">
                      (up to {MAX_IMAGES}, max {MAX_SIZE_MB}MB each)
                    </span>
                  </label>

                  <div className="flex gap-3 flex-wrap">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className="relative h-28 w-28 flex-shrink-0 rounded-lg overflow-hidden border border-border bg-muted"
                      >
                        <img src={src} alt={`preview ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/50 text-white py-0.5">
                          {i === 0 ? "Cover" : `Photo ${i + 1}`}
                        </span>
                      </div>
                    ))}

                    {images.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="h-28 w-28 flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      >
                        {uploading
                          ? <Loader2 className="h-5 w-5 animate-spin" />
                          : <ImagePlus className="h-6 w-6" />}
                        <span className="text-xs">{uploading ? "Processing..." : "Add photo"}</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {imageError && <p className="text-sm text-destructive">{imageError}</p>}
                  {images.length === 0 && !imageError && (
                    <p className="text-xs text-muted-foreground">
                      The first photo will appear as the cover image on listing cards.
                    </p>
                  )}
                </div>
                {/* ────────────────────────────────────────────────── */}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Property
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Tips</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
              <p><strong>Photos:</strong> Upload up to 3 photos. The first one is the cover shown on listing cards.</p>
              <p><strong>Property Name:</strong> Make it descriptive — tenants search by name and location.</p>
              <p><strong>Description:</strong> Mention key features, floor level, and nearby landmarks.</p>
              <p><strong>Amenities:</strong> Separate with commas — e.g. WiFi, Water Tank, Generator.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewPropertyForm;
