import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, MapPin, X } from 'lucide-react';
import { useState } from 'react';

interface LabTestBookingModalProps {
  test: any;
  isOpen: boolean;
  onClose: () => void;
}

const LabTestBookingModal = ({ test, isOpen, onClose }: LabTestBookingModalProps) => {
  const [step, setStep] = useState(1);
  const [collectionType, setCollectionType] = useState<'home' | 'centre'>('home');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    date: '',
    time: '',
    instruction: '',
    labtest_id: test?.id || '',
    labtest_name: test?.name || '',
    venue: test?.labName || '',
    collection_type: 'home',
    payment_method: 'COD',
    payment_status: 'Pending',
    amount: test?.price || 0
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ DIRECT BOOKING - NO PAYMENT MODAL!
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get logged-in user
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      alert("Please login first to book lab test.");
      window.location.href = '/login';
      return;
    }

    const user = JSON.parse(userStr);
    setIsSubmitting(true);

    try {
      // Update form data with collection type
      const bookingData = {
        ...formData,
        email: user.email,
        collection_type: collectionType,
        payment_method: collectionType === 'home' ? 'COD (Cash on Collection)' : 'Pay at Centre',
        payment_status: 'Pending'
      };

      console.log('📦 Submitting lab test booking:', bookingData);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const res = await fetch(`${API_URL}/api/lab-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      // ✅ SUCCESS - Show detailed message
      const paymentInfo = collectionType === 'home'
        ? 'Pay cash when our technician collects your sample'
        : 'Pay directly at the test centre';

      alert(`✅ Lab test booked successfully!

Test: ${test.name}
Date: ${formData.date}
Time: ${formData.time}
Collection: ${collectionType === 'home' ? 'At Home' : 'At Centre'}
Amount: ₹${test.price}

💵 Payment: ${paymentInfo}

Confirmation email sent to: ${user.email}`);

      // Reset and close
      onClose();
      
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      alert(`Booking failed: ${error.message}\n\nPlease try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!test) return null;

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
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Book {test.name}</h1>
                  <p className="text-teal-100">{test.description}</p>
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={handleSubmit}>

                {/* STEP 1: Test Details & Collection Type */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Test Details</h2>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-6xl">{test.icon}</div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-teal-600">₹{test.price}</div>
                          <div className="text-sm text-gray-600">Report in {test.reportTime}</div>
                        </div>
                      </div>

                      {/* ✅ Collection Type Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-3">Collection Type:</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setCollectionType('home');
                              handleInputChange('collection_type', 'home');
                            }}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              collectionType === 'home'
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">🏠</div>
                            <div className="font-semibold">At Home</div>
                            <div className="text-xs text-gray-600">Sample collection at your doorstep</div>
                            <div className="text-sm font-bold text-green-600 mt-2">
                              Pay on Collection (COD)
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCollectionType('centre');
                              handleInputChange('collection_type', 'centre');
                            }}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              collectionType === 'centre'
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">🏥</div>
                            <div className="font-semibold">At Centre</div>
                            <div className="text-xs text-gray-600">Visit {test.labName}</div>
                            <div className="text-sm font-bold text-green-600 mt-2">
                              Pay at Centre
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Results in {test.reportTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{test.labName}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-600"
                    >
                      Continue to Booking
                    </Button>
                  </div>
                )}

                {/* STEP 2: Personal Information */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Personal Information</h2>

                    <Input
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />

                    <Input
                      placeholder="Phone (10 digits)"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      pattern="[0-9]{10}"
                      title="Please enter a 10-digit phone number"
                      required
                      disabled={isSubmitting}
                    />

                    <Input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />

                    {collectionType === 'home' && (
                      <Textarea
                        placeholder="Complete Address (Required for home collection)"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    )}

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(1)}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600"
                        disabled={isSubmitting}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Schedule & Confirm */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Schedule Collection</h2>

                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      disabled={isSubmitting}
                    />

                    <select
                      className="w-full p-2 border rounded-lg"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      <option value="">Select time slot</option>
                      <option value="Morning (6 AM - 10 AM)">Morning (6 AM - 10 AM)</option>
                      <option value="Late Morning (10 AM - 12 PM)">Late Morning (10 AM - 12 PM)</option>
                      <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                      <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                    </select>

                    <Textarea
                      placeholder="Special instructions (optional)"
                      value={formData.instruction}
                      onChange={(e) => handleInputChange('instruction', e.target.value)}
                      disabled={isSubmitting}
                    />

                    {/* ✅ Payment Summary */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">💵 Payment Details</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Test Amount:</span>
                          <span className="font-bold">₹{test.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="font-bold text-green-600">
                            {collectionType === 'home' ? 'Cash on Collection (COD)' : 'Pay at Centre'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          {collectionType === 'home'
                            ? '💵 Pay cash when our technician collects your sample'
                            : '💵 Pay directly at the test centre when you visit'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(2)}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Booking...
                          </span>
                        ) : (
                          'Confirm Booking'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LabTestBookingModal;