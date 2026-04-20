import { useCart } from "@/components/cartcontext.tsx";
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, User, LogOut, ChevronDown, Package, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assests/med_logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPicture, setUserPicture] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();

  // Check authentication status
const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    setIsAuthenticated(true);
    try {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'User');
      setUserPicture(user.picture || '');
    } catch (err) {
      console.error('User parse error:', err);
      setUserName('User');
      setUserPicture('');
    }
  } else {
    setIsAuthenticated(false);
    setUserName('');
    setUserPicture('');
  }
};

  useEffect(() => {
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab or updates profile)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserName('');
    setUserPicture('');
    setShowUserMenu(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Consultation', href: '/consult' },
    { name: 'Lab Tests', href: '/lab-tests' },
    { name: 'Store', href: '/store' },
    { name: 'Health Blog', href: '/health-blog' },
  ];

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className='w-14 h-14' />
            <span className="text-xl font-bold text-gray-800 hidden sm:block">Mediplus</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-4">

            {/* Cart */}
            <button onClick={() => navigate('/cart')} className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-indigo-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Auth Section */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {userPicture ? (
                    <img 
                      src={userPicture} 
                      alt={userName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-indigo-700 max-w-[120px] truncate">
                    {userName || "User"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg py-2 overflow-hidden"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                        <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">Manage your account</p>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/dashboard');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm flex items-center gap-3 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">My Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/orders');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 text-sm flex items-center gap-3 transition-colors"
                      >
                        <Package className="w-4 h-4 text-indigo-600" />
                        <span className="font-medium">My Orders</span>
                      </button>

                      <div className="border-t my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm flex items-center gap-3 text-red-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => setAuthDialogOpen(true)}
              >
                Sign Up
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Mobile Section - Icons */}
          <div className="lg:hidden flex items-center space-x-3">
            <button onClick={() => navigate('/cart')} className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                {userPicture ? (
                  <img 
                    src={userPicture} 
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={() => setAuthDialogOpen(true)}
                className="bg-indigo-600 px-3 py-2 text-white rounded-lg text-sm"
              >
                Sign Up
              </button>
            )}
          </div>

        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Dialog */}
      {authDialogOpen && !isAuthenticated && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg w-80 text-center"
          >
            <h2 className="text-lg font-semibold mb-4">Do you already have an account?</h2>

            <div className="flex justify-around">
              <Button onClick={() => { setAuthDialogOpen(false); navigate("/login"); }}>
                Yes, Login
              </Button>

              <Button onClick={() => { setAuthDialogOpen(false); navigate("/signup"); }}>
                No, Signup
              </Button>
            </div>

            <button
              onClick={() => setAuthDialogOpen(false)}
              className="mt-4 text-sm text-gray-500 underline"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;