import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      
      console.log('🔍 AuthSuccess: Checking for token');
      
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        navigate("/login");
        return;
      }

      try {
        console.log('✅ Token found:', token.substring(0, 20) + '...');
        
        // Store token
        localStorage.setItem("token", token);
        console.log('💾 Token stored in localStorage');

        // ✅ CRITICAL: Fetch user data from backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        console.log('📡 Fetching user data from:', `${API_URL}/api/me`);

        console.log("Fetching user data from:", `${API_URL}/api/me`);
        console.log("Token being sent:", token);

        
        const response = await fetch(`${API_URL}/api/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        console.log('✅ User data received:', userData);

        // Store user data
        localStorage.setItem("user", JSON.stringify(userData));
        console.log('💾 User data stored in localStorage');

        // Small delay to ensure storage
        await new Promise(resolve => setTimeout(resolve, 100));

        // Navigate based on role
        if (userData.role === 'admin') {
          console.log('🔀 Redirecting to admin dashboard');
          navigate("/admin/dashboard", { replace: true });
        } else {
          console.log('🔀 Redirecting to user dashboard');
          navigate("/dashboard", { replace: true });
        }
        
      } catch (error) {
        console.error("❌ Error in AuthSuccess:", error);
        alert('Login failed. Please try again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/login");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Completing Login</h2>
        <p className="text-gray-600">Please wait while we set up your account...</p>
      </div>
    </div>
  );
}