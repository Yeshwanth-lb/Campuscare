import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  FileText,
  Search,
  BarChart2,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    const baseLinks = [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
    ];

    if (user?.role === 'user') {
      return [
        ...baseLinks,
        { to: '/complaints', icon: FileText, label: 'Complaints' },
        { to: '/lost-found', icon: Search, label: 'Lost & Found' },
        { to: '/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/profile', icon: User, label: 'Profile' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseLinks,
        { to: '/admin/complaints', icon: FileText, label: 'All Complaints' },
        { to: '/admin/lost-found', icon: Search, label: 'Lost & Found' },
        { to: '/analytics', icon: BarChart2, label: 'Analytics' },
        { to: '/profile', icon: User, label: 'Profile' },
      ];
    }

    if (user?.role === 'staff') {
      return [
        ...baseLinks,
        { to: '/staff/complaints', icon: FileText, label: 'Assigned Tasks' },
        { to: '/profile', icon: User, label: 'Profile' },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">CampusCare</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <link.icon className={`w-4 h-4 ${location.pathname === link.to ? 'text-blue-600' : ''}`} />
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
              text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                ${
                  location.pathname === link.to
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
              text-red-600 hover:bg-red-50 w-full text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
