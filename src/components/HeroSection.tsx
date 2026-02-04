import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Shield, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const floatingAnimation1 = {
    floating: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
      },
    },
  };

  const floatingAnimation2 = {
    floating: {
      y: [0, 20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          variants={floatingAnimation1}
          animate="floating"
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingAnimation2}
          animate="floating"
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative container mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
              >
                <Star className="w-4 h-4 mr-2" />
                Trusted by 50,000+ patients
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight"
              >
                Your Health,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Our Priority
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl text-gray-600 leading-relaxed max-w-lg"
              >
                Access world-class healthcare from the comfort of your home.
                Consult with certified doctors, order medicines, and book lab tests - all in one place.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/consult">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg group">
                  Start Consultation
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="grid grid-cols-3 gap-8 pt-8"
            >
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Patients</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Secure</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative p-20">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                }}
                className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3"
              >
                <div className="text-6xl mb-4">🏥</div>
                <h3 className="text-xl font-bold mb-2">Online Consultation</h3>
                <p className="text-gray-600">Connect with doctors instantly</p>
              </motion.div>

              <motion.div
                animate={{ 
                  rotate: [0, -3, 3, 0],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                }}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl p-6 transform -rotate-6"
              >
                <div className="text-3xl mb-2">💊</div>
                <div className="text-sm font-semibold">Fast Delivery</div>
              </motion.div>

              <motion.div
                animate={{ 
                  rotate: [0, 4, -4, 0],
                }}
                transition={{ 
                  duration: 7,
                  repeat: Infinity,
                }}
                className="absolute -bottom-6 -left-6 bg-green-500 text-white rounded-2xl shadow-xl p-6 transform rotate-12"
              >
                <div className="text-3xl mb-2">🔬</div>
                <div className="text-sm font-semibold">Lab Tests</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
