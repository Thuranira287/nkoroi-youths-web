import React from 'react';
import { Cross, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Organization Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Cross className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">St. Bakhita Catholic Youths</h3>
                <p className="text-blue-400 text-sm">Nkoroi Parish</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A vibrant community of young Catholics dedicated to faith, fellowship, 
              and service. Growing together in Christ through prayer, worship, and action.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/readings" className="text-gray-400 hover:text-white transition-colors">Sunday Readings</a></li>
              <li><a href="/announcements" className="text-gray-400 hover:text-white transition-colors">Announcements</a></li>
              <li><a href="/trips" className="text-gray-400 hover:text-white transition-colors">Trips & Albums</a></li>
              <li><a href="/rosary" className="text-gray-400 hover:text-white transition-colors">Holy Rosary</a></li>
              <li><a href="/bible" className="text-gray-400 hover:text-white transition-colors">Catholic Bible</a></li>
            </ul>
          </div>

          {/* Contact & Prayer Requests */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Connected</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p>Join us in prayer and fellowship</p>
              <p>Every Sunday after Mass</p>
              <p>St. Bakhita Church Garden</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-gray-400">Pray for us as we pray for you</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Custom Branding */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} St. Bakhita Catholic Youths - Nkoroi. All rights reserved.
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              Designed by <span className="text-blue-400 font-medium">Almark Tech Solutions</span> for{' '}
              <span className="text-white font-medium">St. Bakhita Youth Groups</span> as a Farewell
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
