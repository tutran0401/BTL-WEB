import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-8 h-8 text-primary-500" fill="currentColor" />
              <span className="text-xl font-bold text-white">VolunteerHub</span>
            </div>
            <p className="text-sm text-gray-400">
              Nền tảng kết nối tình nguyện viên với các hoạt động ý nghĩa.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="hover:text-primary-500 transition">
                  Sự kiện
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-500 transition">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-500 transition">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">contact@volunteerhub.vn</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">024 1234 5678</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Theo dõi chúng tôi</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61584649298288" className="hover:text-primary-500 transition">
                Facebook
              </a>
              <a href="#" className="hover:text-primary-500 transition">
                Instagram
              </a>
              <a href="#" className="hover:text-primary-500 transition">
                Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} VolunteerHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

