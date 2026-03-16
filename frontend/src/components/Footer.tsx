import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-darkGreen text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">LodgeMe</h3>
            <p className="text-gray-300">Your trusted partner for rentals in Cameroon.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul>
              <li><Link href="/about" className="text-gray-300 hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-primary">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-300 hover:text-primary"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-300 hover:text-primary"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-gray-400">
          &copy; {new Date().getFullYear()} LodgeMe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}