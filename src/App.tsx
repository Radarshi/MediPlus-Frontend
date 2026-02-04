import PostBlog from '@/components/BlogFormPopup';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { CartProvider } from "./components/cartcontext.tsx";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import ConsultPage from "./pages/ConsultPage";
import HealthBlogPage from "./pages/HealthBlogPage";
import Index from "./pages/Index";
import LabTestPage from "./pages/LabTestPage";
import Login from './pages/Login';
import NotFound from "./pages/NotFound";
import Signup from './pages/Signup.jsx';
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage";
import UserDashboard from "./pages/UserDashboard";
import AuthSuccess from "./components/AuthSuccess";
import Orders from './pages/Orders';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

// Component to handle OAuth token in URL
const OAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      alert('Login successful via Google!');
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return null;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
        future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }}
        >
          <CartProvider>
            <OAuthHandler />
            <AnimatePresence mode="wait">
              {isLoading ? (
                <LoadingScreen key="loading" />
              ) : (
                <div key="app" className="min-h-screen">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/store" element={<StorePage />} />
                    <Route path="/post" element={<PostBlog isOpen={true} blogTitle={""} />} />
                    <Route path="/consult" element={<ConsultPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/lab-tests" element={<LabTestPage />} />
                    <Route path="/health-blog" element={<HealthBlogPage />} />
                    <Route path="*" element={<NotFound />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/auth/success" element={<AuthSuccess />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                  </Routes>
                </div>
              )}
            </AnimatePresence>
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;