/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { propertiesAPI } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormInput } from "@/components/FormInput";
import { FormTextarea } from "@/components/FormTextarea";
import { FormSelect } from "@/components/FormSelect";
import { roomCreateSchema, type RoomCreateFormData } from "@/lib/validations";

const AddRoom = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoomCreateFormData>({
    resolver: zodResolver(roomCreateSchema),
  });

  const onSubmit = async (data: RoomCreateFormData) => {
    if (!propertyId) {
      toast({ title: "Error", description: "Property ID is missing", variant: "destructive" });
      return;
    }

    try {
      await propertiesAPI.createRoom(propertyId, {
        roomNumber: data.roomNumber,
        roomType: data.roomType,
        capacity: data.capacity,
        monthlyRent: data.monthlyRent,
        cautionDeposit: data.cautionDeposit,
        description: data.description,
        images: data.images,
      });
      toast({ title: "Room added successfully" });
      navigate(`/landlord/properties/${propertyId}`);
    } catch (err: any) {
      toast({
        title: "Failed to add room",
        description: err.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const roomTypes = [
    { value: "single", label: "Single Room" },
    { value: "double", label: "Double Room" },
    { value: "studio", label: "Studio" },
    { value: "apartment", label: "Apartment" },
  ];

  return (
    <DashboardLayout title="Add New Room" subtitle={`Add a room to property ${propertyId}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Room Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormInput
                  label="Room Number"
                  placeholder="e.g. 101, A1, Suite 1"
                  error={errors.roomNumber}
                  required
                  {...register("roomNumber")}
                />
                <FormSelect
                  label="Room Type"
                  placeholder="Select room type"
                  error={errors.roomType}
                  required
                  options={roomTypes}
                  {...register("roomType")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Capacity (Number of People)"
                    placeholder="e.g. 2"
                    type="number"
                    error={errors.capacity}
                    required
                    {...register("capacity", { valueAsNumber: true })}
                  />
                  <FormInput
                    label="Monthly Rent (XAF)"
                    placeholder="e.g. 150000"
                    type="number"
                    error={errors.monthlyRent}
                    required
                    {...register("monthlyRent", { valueAsNumber: true })}
                  />
                </div>
                <FormInput
                  label="Caution Deposit (XAF, Optional)"
                  placeholder="e.g. 300000"
                  type="number"
                  error={errors.cautionDeposit}
                  {...register("cautionDeposit", { valueAsNumber: true })}
                />
                <FormTextarea
                  label="Description (Optional)"
                  placeholder="Describe the room features, furniture, etc."
                  error={errors.description}
                  {...register("description")}
                />
                <FormInput
                  label="Image URLs (comma separated, Optional)"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  error={errors.images}
                  {...register("images", {
                    setValueAs: (value) => value.split(",").map((url: string) => url.trim()).filter(Boolean),
                  })}
                />
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Room
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
              <CardTitle className="font-display text-base">Room Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3 text-muted-foreground">
              <p>
                <strong>Room Number:</strong> Use a unique identifier for this room within your property.
              </p>
              <p>
                <strong>Monthly Rent:</strong> The monthly rental price in XAF currency.
              </p>
              <p>
                <strong>Caution Deposit:</strong> Security deposit required from tenants (typically 2x monthly rent).
              </p>
              <p>
                <strong>Images:</strong> Add room photos to attract more tenants. Use full URLs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddRoom;
