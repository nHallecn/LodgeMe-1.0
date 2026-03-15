import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import GoogleMap from "../components/GoogleMap";

export default function Home() {
  // Example property data (replace with actual data from API)
  const featuredProperties = [
    { id: 1, imageUrl: "/property1.jpg", title: "Modern Apartment in Douala", location: "Bonaberi, Douala", price: 150000 },
    { id: 2, imageUrl: "/property2.jpg", title: "Cozy Studio in Yaounde", location: "Bastos, Yaounde", price: 80000 },
    { id: 3, imageUrl: "/property3.jpg", title: "Spacious Minicité Unit", location: "Molyko, Buea", price: 60000 },
    { id: 4, imageUrl: "/property4.jpg", title: "Luxury Villa in Limbe", location: "Mile 4, Limbe", price: 300000 },
    { id: 5, imageUrl: "/property5.jpg", title: "Student Room in Buea", location: "Great Soppo, Buea", price: 45000 },
    { id: 6, imageUrl: "/property6.jpg", title: "Family House in Kribi", location: "Grand Batanga, Kribi", price: 200000 },
  ];

  const testimonials = [
    { id: 1, name: "Alice M. (Tenant)", quote: "LodgeMe made finding my new apartment incredibly easy and stress-free. The listings were accurate, and connecting with landlords was seamless!" },
    { id: 2, name: "John K. (Landlord)", quote: "Managing my properties has never been simpler. LodgeMe's tools for invoicing and tracking payments are a game-changer for landlords in Cameroon." },
    { id: 3, name: "Sophie L. (Tenant)", quote: "No more fake agents! LodgeMe is a trustworthy platform that truly helps you find genuine rentals. Highly recommended!" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[85vh] bg-cover bg-center flex items-center justify-center text-white overflow-hidden" style={{ backgroundImage: "url(\"/hero-bg.jpg\")" }}>
          <div className="absolute inset-0 bg-darkGreen opacity-70"></div>
          <div className="relative z-10 text-center px-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg">Your Next Home Awaits in Cameroon</h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto drop-shadow-md">Discover trusted apartments, rooms, and minicités. Seamlessly connect with landlords.</p>
            <div className="glassmorphism p-6 rounded-xl shadow-lg inline-block animate-slide-up">
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <input
                  type="text"
                  placeholder="Search by City, Neighborhood..."
                  className="p-3 rounded-lg w-full md:w-96 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary bg-white bg-opacity-80 placeholder-gray-600"
                />
                <button className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By / Statistics Section */}
        <section className="py-16 bg-lightGreen text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-section-heading">Trusted by Thousands Across Cameroon</h2>
            <p className="section-subheading">Join a growing community of happy tenants and efficient landlords.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="p-6 bg-white rounded-lg shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h3 className="text-5xl font-extrabold text-primary mb-2">500+</h3>
                <p className="text-gray-700 text-xl">Properties Listed</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="text-5xl font-extrabold text-primary mb-2">2000+</h3>
                <p className="text-gray-700 text-xl">Happy Tenants</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="text-5xl font-extrabold text-primary mb-2">100+</h3>
                <p className="text-gray-700 text-xl">Verified Landlords</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Properties Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="section-heading">Discover Our Featured Listings</h2>
            <p className="section-subheading">Hand-picked properties offering the best value and comfort.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
              {featuredProperties.map((property, index) => (
                <div key={property.id} className="animate-slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                  <PropertyCard {...property} />
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link href="/properties" className="bg-accent hover:bg-darkGreen text-white font-bold py-4 px-10 rounded-lg text-lg transition duration-300 shadow-lg">
                View All Properties
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us - Bento Grid Section */}
        <section className="py-20 bg-lightGreen">
          <div className="container mx-auto px-4">
            <h2 className="section-heading">Why Choose LodgeMe?</h2>
            <p className="section-subheading">Experience a new standard in property rental and management.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              <div className="p-8 bg-white rounded-xl shadow-lg flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <Image src="/icon-verified.png" alt="Verified Listings" width={60} height={60} className="mb-4" />
                <h3 className="text-2xl font-bold text-darkGreen mb-3">Verified Listings</h3>
                <p className="text-gray-700">Every property and landlord is thoroughly vetted for your peace of mind.</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Image src="/icon-support.png" alt="24/7 Support" width={60} height={60} className="mb-4" />
                <h3 className="text-2xl font-bold text-darkGreen mb-3">Dedicated Support</h3>
                <p className="text-gray-700">Our team is always ready to assist you, from search to move-in.</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <Image src="/icon-transparent.png" alt="Transparent Pricing" width={60} height={60} className="mb-4" />
                <h3 className="text-2xl font-bold text-darkGreen mb-3">Transparent Pricing</h3>
                <p className="text-gray-700">No hidden fees, no surprises. What you see is what you pay.</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg flex flex-col items-center text-center md:col-span-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <Image src="/icon-digital.png" alt="Digital Management" width={60} height={60} className="mb-4" />
                <h3 className="text-2xl font-bold text-darkGreen mb-3">Effortless Digital Management</h3>
                <p className="text-gray-700">Landlords can manage invoices, payments, and maintenance tickets all in one place.</p>
              </div>
              <div className="p-8 bg-white rounded-xl shadow-lg flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: "0.5s" }}>
                <Image src="/icon-community.png" alt="Community Focus" width={60} height={60} className="mb-4" />
                <h3 className="text-2xl font-bold text-darkGreen mb-3">Community Focused</h3>
                <p className="text-gray-700">Building a trusted community for renters and property owners in Cameroon.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="section-heading">What Our Users Say</h2>
            <p className="section-subheading">Hear from our satisfied tenants and landlords.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="bg-lightGreen p-8 rounded-xl shadow-lg text-center animate-slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                  <p className="text-gray-800 text-lg italic mb-4">
  &ldquo;{testimonial.quote}&rdquo;
</p>
                  <p className="font-semibold text-darkGreen">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Google Maps Integration Section */}
        <section className="py-20 bg-lightGreen">
          <div className="container mx-auto px-4 text-center">
            <h2 className="section-heading">Explore Rentals on the Map</h2>
            <p className="section-subheading">Visualize available properties and their locations across Cameroon.</p>
            <div className="bg-white rounded-xl shadow-lg h-[500px] mt-10 overflow-hidden animate-fade-in">
              <GoogleMap
                center={{ lat: 5.0, lng: 12.5 }} // Centered around Cameroon
                zoom={7}
                markers={[
                  { lat: 4.05, lng: 9.7, title: "Douala Property" },
                  { lat: 3.86, lng: 11.52, title: "Yaounde Property" },
                  { lat: 4.15, lng: 9.23, title: "Limbe Property" },
                  { lat: 4.05, lng: 9.32, title: "Buea Property" },
                ]} // Example markers
              />
            </div>
          </div>
        </section>

        {/* Call to Action / Newsletter Section */}
        <section className="py-20 bg-primary text-white text-center">
          <div className="container mx-auto px-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Find Your Perfect Place?</h2>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">Join LodgeMe today and experience the future of property rental in Cameroon. Subscribe to our newsletter for the latest listings and updates!</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email address"
                className="p-3 rounded-lg w-full md:w-80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white bg-white bg-opacity-90 placeholder-gray-600"
              />
              <button className="bg-darkGreen hover:bg-accent text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md">
                Subscribe Now
              </button>
            </div>
            <div className="mt-12">
              <h3 className="text-3xl font-bold mb-4">Are You a Landlord?</h3>
              <p className="text-lg mb-8">List your properties on LodgeMe and reach thousands of potential tenants.</p>
              <Link href="/landlord/register" className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition duration-300 shadow-md">
                List Your Property Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}