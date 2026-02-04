import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Video, Phone, MessageCircle, Clock, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConsultationPricingModalProps {
  type: 'video' | 'phone' | 'chat';
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect?: (plan: any, type: string) => void;
}

const ConsultationPricingModal = ({ type, isOpen, onClose, onPlanSelect }: ConsultationPricingModalProps) => {
  const consultationData = {
    video: {
      icon: Video,
      title: 'Video Consultation',
      description: 'Face-to-face consultation with doctors',
      color: 'from-blue-500 to-blue-600',
      tiers: [
        {
          name: 'Basic',
          price: 299,
          duration: '15 minutes',
          features: ['HD Video Call', 'Basic Health Assessment', 'Prescription if needed', 'Chat support'],
          popular: false
        },
        {
          name: 'Standard',
          price: 399,
          duration: '30 minutes',
          features: ['HD Video Call', 'Comprehensive Assessment', 'Detailed Prescription', 'Follow-up Chat', 'Health Tips'],
          popular: true
        },
        {
          name: 'Premium',
          price: 499,
          duration: '45 minutes',
          features: ['HD Video Call', 'Detailed Consultation', 'Comprehensive Prescription', '24/7 Chat Support', 'Health Plan', 'Priority Booking'],
          popular: false
        }
      ]
    },
    phone: {
      icon: Phone,
      title: 'Phone Consultation',
      description: 'Voice consultation with medical professionals',
      color: 'from-green-500 to-green-600',
      tiers: [
        {
          name: 'Quick',
          price: 199,
          duration: '10 minutes',
          features: ['Voice Call', 'Quick Assessment', 'Basic Prescription', 'SMS Summary'],
          popular: false
        },
        {
          name: 'Standard',
          price: 299,
          duration: '20 minutes',
          features: ['Voice Call', 'Detailed Assessment', 'Prescription', 'Follow-up SMS', 'Health Advice'],
          popular: true
        },
        {
          name: 'Extended',
          price: 399,
          duration: '35 minutes',
          features: ['Voice Call', 'Comprehensive Assessment', 'Detailed Prescription', 'Follow-up Care', 'Health Plan', 'Priority Support'],
          popular: false
        }
      ]
    },
    chat: {
      icon: MessageCircle,
      title: 'Chat Consultation',
      description: 'Text-based consultation for non-urgent queries',
      color: 'from-purple-500 to-purple-600',
      tiers: [
        {
          name: 'Basic',
          price: 49,
          duration: '24 hours',
          features: ['Text Chat', 'Basic Questions', 'Simple Prescription', 'Health Tips'],
          popular: false
        },
        {
          name: 'Standard',
          price: 99,
          duration: '48 hours',
          features: ['Text + Voice Messages', 'Detailed Discussion', 'Prescription', 'Follow-up Chat', 'Image Sharing'],
          popular: true
        },
        {
          name: 'Premium',
          price: 199,
          duration: '1 week',
          features: ['Unlimited Chat', 'Comprehensive Support', 'Detailed Prescription', 'Ongoing Support', 'Priority Response', 'Health Monitoring'],
          popular: false
        }
      ]
    }
  };

  const data = consultationData[type];
  if (!data) return null;

  const handlePlanSelect = (plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan, type);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${data.color} p-6 text-white`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <data.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{data.title}</h1>
                    <p className="text-white/90 mt-1">{data.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Select the consultation package that best fits your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.tiers.map((tier, index) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative border-2 rounded-2xl p-6 ${
                      tier.popular 
                        ? 'border-blue-500 bg-blue-50 transform scale-105' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{tier.name}</h3>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-gray-800">{tier.price} Rs.</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{tier.duration}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${
                        tier.popular 
                          ? `bg-gradient-to-r ${data.color} text-white` 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handlePlanSelect(tier)}
                    >
                      Select {tier.name}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Expert Doctors</h3>
                  <p className="text-sm text-gray-600">Qualified and experienced medical professionals</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">24/7 Support</h3>
                  <p className="text-sm text-gray-600">Round-the-clock medical assistance</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">10,000+ Patients</h3>
                  <p className="text-sm text-gray-600">Trusted by thousands of satisfied patients</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsultationPricingModal;
