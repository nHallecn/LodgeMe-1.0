/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { propertiesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormInput } from "@/components/FormInput";
import { FormTextarea } from "@/components/FormTextarea";
import { propertyCreateSchema, type PropertyCreateFormData } from "@/lib/validations";

const NewPropertyForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyCreateFormData>({
    resolver: zodResolver(propertyCreateSchema),
  });

  const onSubmit = async (data: PropertyCreateFormData) => {
    try {
      await propertiesAPI.create({
        name: data.name,
        city: data.city,
        neighborhood: data.neighborhood,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        description: data.description,
        totalRooms: data.totalRooms,
        amenities: data.amenities || [],
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormInput
                  label="Property Name"
                  placeholder="e.g. Modern Apartment in Douala"
                  error={errors.name}
                  required
                  {...register("name")}
                />
                <FormTextarea
                  label="Description"
                  placeholder="Describe your property..."
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
                  <span className="sr-only">Neighborhood</span>
                  <FormInput
                    label="Neighborhood"
                    placeholder="e.g. Littoral"
                    error={errors.neighborhood}
                    required
                    {...register("neighborhood")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Latitude (Optional)"
                    placeholder="e.g. 4.0511"
                    type="number"
                    error={errors.latitude}
                    {...register("latitude")}
                  />
                  <FormInput
                    label="Longitude (Optional)"
                    placeholder="e.g. 9.7679"
                    type="number"
                    error={errors.longitude}
                    {...register("longitude")}
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
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Property
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
              <p>
                <strong>Property Name:</strong> Make it descriptive and appealing to attract tenants.
              </p>
              <p>
                <strong>Description:</strong> Provide detailed information about your property's features and location.
              </p>
              <p>
                <strong>Amenities:</strong> List all available amenities separated by commas for better visibility.
              </p>
              <p>
                <strong>Location:</strong> Accurate city and neighborhood information helps tenants find your property.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewPropertyForm;