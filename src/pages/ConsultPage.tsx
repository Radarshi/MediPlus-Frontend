// src/pages/ConsultPage.tsx
// Changed: import supabase → fetchCollection from firebaseClient

import ConsultationBooking from '@/components/ConsultationBookingForm';
import ConsultationPricingModal from '@/components/ConsultationPricingModal';
import DoctorDetailModal from '@/components/DoctorDetailModal';
import PaymentModal from '@/components/PaymentModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchCollection } from '@/lib/firebaseClient';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, MessageCircle, Phone, Star, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type ConsultationType = 'video' | 'phone' | 'chat';

const ConsultPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorDetail, setShowDoctorDetail] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedConsultationType, setSelectedConsultationType] = useState<ConsultationType>('video');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const specialties = [
    { id: 'all',          name: 'All Specialties',   icon: '🏥' },
    { id: 'general',      name: 'General Medicine',   icon: '🩺' },
    { id: 'cardiology',   name: 'Cardiology',         icon: '❤️' },
    { id: 'dermatology',  name: 'Dermatology',        icon: '🧴' },
    { id: 'pediatrics',   name: 'Pediatrics',         icon: '👶' },
    { id: 'orthopedics',  name: 'Orthopedics',        icon: '🦴' },
    { id: 'psychiatry',   name: 'Psychiatry',         icon: '🧠' },
  ];

  const consultationTypes = [
    {
      type: 'video' as ConsultationType,
      name: 'Video Consultation',
      description: 'Face-to-face consultation with high-quality video',
      icon: Video,
      duration: '30 minutes',
      features: ['HD Video Call', 'Screen Sharing', 'Digital Prescription', 'Follow-up Notes'],
    },
    {
      type: 'chat' as ConsultationType,
      name: 'Chat Consultation',
      description: 'Text-based consultation with instant responses',
      icon: MessageCircle,
      duration: 'Unlimited',
      features: ['Instant Messaging', 'Photo Sharing', 'Voice Messages', '24/7 Support'],
    },
    {
      type: 'phone' as ConsultationType,
      name: 'Phone Consultation',
      description: 'Voice call consultation with medical experts',
      icon: Phone,
      duration: '20 minutes',
      features: ['Clear Audio', 'Call Recording', 'Follow-up SMS', 'Emergency Support'],
    },
  ];

  // ✅ Fetch doctors from Firestore 'consult' collection
  useEffect(() => {
    fetchCollection('consult')
      .then((data) => setDoctors(data))
      .catch((err) => console.error('Failed to fetch doctors:', err));
  }, []);

  const filteredDoctors = doctors.filter(
    (doc) =>
      selectedSpecialty === 'all' ||
      doc.specialty?.toLowerCase().includes(selectedSpecialty) ||
      doc.specializations?.some((s) => s.toLowerCase().includes(selectedSpecialty))
  );

  const handleConsultationTypeClick = (type: ConsultationType) => {
    setSelectedConsultationType(type);
    setShowPricingModal(true);
  };

  const handlePlanSelect = (plan, type) => {
    setSelectedPlan({ ...plan, type });
    setShowPricingModal(false);
    setCurrentStep(2);
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(3);
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

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <div className={`flex items-center gap-2 ${currentStep >= step ? 'text-indigo-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                      {step}
                    </div>
                    <span className="text-sm font-medium hidden md:block">
                      {['Choose Type', 'Select Doctor', 'Book & Pay'][i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Choose Your Consultation Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {consultationTypes.map((type, index) => (
                <motion.div key={type.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <type.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">{type.name}</h3>
                      <p className="text-gray-600 mb-4">{type.description}</p>
                      <div className="text-sm text-indigo-600 font-semibold mb-4">Duration: {type.duration}</div>
                      <ul className="text-sm text-gray-600 space-y-1 mb-6">
                        {type.features.map((f, idx) => (
                          <li key={idx} className="flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" onClick={() => handleConsultationTypeClick(type.type)}>
                        View Pricing
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Select Your Doctor</h2>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Change Plan
              </Button>
            </div>

            {selectedPlan && (
              <div className="bg-indigo-50 p-4 rounded-lg mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedPlan.name} {selectedConsultationType} Consultation</h3>
                  <p className="text-sm text-gray-600">{selectedPlan.duration}</p>
                </div>
                <div className="text-2xl font-bold text-green-600">₹{selectedPlan.price}</div>
              </div>
            )}

            {/* Specialty filter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Filter by Specialty</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {specialties.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSpecialty(s.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${selectedSpecialty === s.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="font-semibold text-xs">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doctor) => (
                <motion.div key={doctor.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
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
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600" onClick={() => handleDoctorSelect(doctor)}>
                          Select
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedDoctor(doctor); setShowDoctorDetail(true); }}>
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

        {/* STEP 3 */}
        {currentStep === 3 && selectedDoctor && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Complete Booking</h2>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Change Doctor
              </Button>
            </div>
            <ConsultationBooking
              selectedDoctor={selectedDoctor}
              selectedPlan={selectedPlan}
              onBookingComplete={() => setShowPaymentModal(true)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <DoctorDetailModal doctor={selectedDoctor} isOpen={showDoctorDetail} onClose={() => setShowDoctorDetail(false)} />
      <ConsultationPricingModal type={selectedConsultationType} isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} onPlanSelect={handlePlanSelect} />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
        onPaymentSuccess={() => { setShowPaymentModal(false); alert('✅ Consultation booked!'); setCurrentStep(1); }}
      />
    </div>
  );
};

export default ConsultPage;