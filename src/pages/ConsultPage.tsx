import ConsultationBooking from '@/components/ConsultationBookingForm';
import ConsultationPricingModal from '@/components/ConsultationPricingModal';
import DoctorDetailModal from '@/components/DoctorDetailModal';
import PaymentModal from '@/components/PaymentModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Phone, Star, Video, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type ConsultationType = 'video' | 'phone' | 'chat';

const ConsultPage = () => {
  // State Management
  const [currentStep, setCurrentStep] = useState(1); // ✅ NEW: Track flow steps
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorDetail, setShowDoctorDetail] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false); // ✅ NEW
  const [doctors, setDoctors] = useState([]);
  const [selectedConsultationType, setSelectedConsultationType] = useState<ConsultationType>('video');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const specialties = [
    { id: 'all', name: 'All Specialties', doctors: 0, icon: '🏥' },
    { id: 'general', name: 'General Medicine', doctors: 15, icon: '🩺' },
    { id: 'cardiology', name: 'Cardiology', doctors: 8, icon: '❤️' },
    { id: 'dermatology', name: 'Dermatology', doctors: 6, icon: '🧴' },
    { id: 'pediatrics', name: 'Pediatrics', doctors: 10, icon: '👶' },
    { id: 'orthopedics', name: 'Orthopedics', doctors: 7, icon: '🦴' },
    { id: 'psychiatry', name: 'Psychiatry', doctors: 5, icon: '🧠' }
  ];

  // Fetch doctors from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const {data: doctors, error: docError} = await supabase
        .from('consult')
        .select('*');

      if (docError)
        console.error('Failed to fetch data', docError.message);
      else
        setDoctors(doctors || []);
    };
    fetchData();
  }, []);

  const consultationTypes = [
    {
      type: 'video' as ConsultationType,
      name: 'Video Consultation',
      description: 'Face-to-face consultation with high-quality video',
      icon: Video,
      duration: '30 minutes',
      features: ['HD Video Call', 'Screen Sharing', 'Digital Prescription', 'Follow-up Notes']
    },
    {
      type: 'chat' as ConsultationType,
      name: 'Chat Consultation', 
      description: 'Text-based consultation with instant responses',
      icon: MessageCircle,
      duration: 'Unlimited',
      features: ['Instant Messaging', 'Photo Sharing', 'Voice Messages', '24/7 Support']
    },
    {
      type: 'phone' as ConsultationType,
      name: 'Phone Consultation',
      description: 'Voice call consultation with medical experts',
      icon: Phone,
      duration: '20 minutes',
      features: ['Clear Audio', 'Call Recording', 'Follow-up SMS', 'Emergency Support']
    }
  ];

  // Filter doctors based on selected specialty
  const filteredDoctors = doctors.filter(doctor => 
    selectedSpecialty === 'all' || 
    doctor.specialty?.toLowerCase().includes(selectedSpecialty) ||
    doctor.specializations?.some(spec => spec.toLowerCase().includes(selectedSpecialty))
  );

  // ✅ NEW: Handle consultation type selection
  const handleConsultationTypeClick = (type: ConsultationType) => {
    setSelectedConsultationType(type);
    setShowPricingModal(true);
  };

  // ✅ NEW: Handle plan selection → Show doctors
  const handlePlanSelect = (plan, type) => {
    setSelectedPlan({ ...plan, type });
    setShowPricingModal(false);
    setCurrentStep(2); // Move to doctors selection
  };

  // ✅ NEW: Handle doctor selection → Show booking form
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(3); // Move to booking form
  };

  const handleKnowMoreClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetail(true);
  };

  // ✅ NEW: Handle booking completion → Payment
  const handleBookingComplete = () => {
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Video className="w-6 h-6 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-800">Online Consultation</h1>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm font-medium hidden md:block">Choose Type</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm font-medium hidden md:block">Select Doctor</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm font-medium hidden md:block">Book & Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        
        {/* STEP 1: Consultation Types */}
        {currentStep === 1 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Choose Your Consultation Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {consultationTypes.map((type, index) => (
                <motion.div
                  key={type.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <type.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">{type.name}</h3>
                      <p className="text-gray-600 mb-4">{type.description}</p>
                      <div className="text-sm text-indigo-600 font-semibold mb-4">
                        Duration: {type.duration}
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 mb-6">
                        {type.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
                        onClick={() => handleConsultationTypeClick(type.type)}
                      >
                        View Pricing
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Doctor Selection */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Select Your Doctor</h2>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Plan
              </Button>
            </div>

            {/* Selected Plan Info */}
            {selectedPlan && (
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedPlan.name} {selectedConsultationType} Consultation</h3>
                    <p className="text-sm text-gray-600">{selectedPlan.duration}</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">₹{selectedPlan.price}</div>
                </div>
              </div>
            )}

            {/* Specialty Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Filter by Specialty</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    onClick={() => setSelectedSpecialty(specialty.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedSpecialty === specialty.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{specialty.icon}</div>
                    <div className="font-semibold text-xs">{specialty.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-3xl">{doctor.image}</div>
                        <div className="flex-1">
                          <h4 className="font-bold">{doctor.name}</h4>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm font-semibold">{doctor.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-xs text-gray-600">{doctor.experience} experience</p>
                        <p className="text-xs text-gray-600">{doctor.consultations}+ consultations</p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
                          onClick={() => handleDoctorSelect(doctor)}
                        >
                          Select
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleKnowMoreClick(doctor)}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Booking Form */}
        {currentStep === 3 && selectedDoctor && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Complete Booking</h2>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Doctor
              </Button>
            </div>

            {/* Selected Doctor & Plan Summary */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{selectedDoctor.image}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedDoctor.name}</h3>
                  <p className="text-gray-600">{selectedDoctor.specialty}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{selectedDoctor.rating}</span>
                  </div>
                </div>
              </div>
              {selectedPlan && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">{selectedPlan.name} {selectedConsultationType} Consultation</p>
                    <p className="text-sm text-gray-600">{selectedPlan.duration}</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">₹{selectedPlan.price}</div>
                </div>
              )}
            </div>

            <ConsultationBooking 
              selectedDoctor={selectedDoctor}
               selectedPlan={selectedPlan} 
              onBookingComplete={handleBookingComplete}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <DoctorDetailModal
        doctor={selectedDoctor}
        isOpen={showDoctorDetail}
        onClose={() => setShowDoctorDetail(false)}
      />

      <ConsultationPricingModal
        type={selectedConsultationType}
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onPlanSelect={handlePlanSelect}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          alert('✅ Consultation booked successfully!');
          setCurrentStep(1); // Reset to start
        }}
      />
    </div>
  );
};

export default ConsultPage;