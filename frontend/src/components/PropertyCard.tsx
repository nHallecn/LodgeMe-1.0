import Image from "next/image";
import Link from "next/link";

interface PropertyCardProps {
  id: number;
  imageUrl: string;
  title: string;
  location: string;
  price: number;
}

export default function PropertyCard({ id, imageUrl, title, location, price }: PropertyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Image src={imageUrl} alt={title} width={500} height={300} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{location}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-primary">XAF {price.toLocaleString()}/month</span>
          <Link href={`/properties/${id}`} className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition duration-300">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}