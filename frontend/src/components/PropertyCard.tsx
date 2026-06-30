import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  id: string;
  imageUrl?: string;
  title: string;
  location: string;
  price: number;
  type?: string;
  rooms?: number;
}

const PropertyCard = ({ id, imageUrl, title, location, price, type, rooms }: PropertyCardProps) => {
  return (
    <Link to={`/properties/${id}`}>
      <Card className="group overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <span className="font-display text-lg font-bold text-muted-foreground">LodgeMe</span>
            </div>
          )}
          {type && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">{type}</Badge>
          )}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-medium">4.8</span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">{title}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="font-display text-lg font-bold text-primary">XAF {price.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>
            {rooms !== undefined && (
              <span className="text-xs text-muted-foreground">{rooms} room{rooms !== 1 ? 's' : ''}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
