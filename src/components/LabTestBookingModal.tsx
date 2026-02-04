import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, Mail, MapPin, Phone, User, X } from 'lucide-react';
import { useState } from 'react';

interface LabTestBookingModalProps {
  test: any;
  isOpen: boolean;
  onClose: () => void;
}

const LabTestBookingModal = ({ test, isOpen, onClose }: LabTestBookingModalProps) => {
  const [step, setStep] = useState(1);
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
    venue: test?.labName || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ✅ prevent page reload

    const res = await fetch(`${import.meta.env.BACKEND_URL}/api/lab-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    
    if (!res.ok)
      alert(data.error || 'Something went Wrong');
    else{
      localStorage.setItem('token', data.token);
      alert('Your session is booked.')
    }
    onClose();
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

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Test Details</h2>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-6xl">{test.icon}</div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-teal-600">{test.price}</div>
                        <div className="text-sm text-gray-600">Home collection included</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Results in {test.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Home collection</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">What's Included:</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Free home sample collection</li>
                      <li>• Digital report delivery</li>
                      <li>• Doctor consultation if needed</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-600">
                    Continue to Booking
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name
                      </label>
                      <Input
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        name='name'
                        required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <Input
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        name='phone'
                        required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        name='email'
                        required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Address
                      </label>
                      <Textarea
                        placeholder="Enter your complete address for sample collection"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        name='address'
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600">
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Schedule Collection</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Preferred Date
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        name='date'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Preferred Time
                      </label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                        name='time'>
                        <option value="">Select time</option>
                        <option value="morning">Morning (9 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                        <option value="evening">Evening (4 PM - 7 PM)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Special Instructions</label>
                      <Textarea
                        placeholder="Any special instructions or notes"
                        value={formData.instruction}
                        onChange={(e) => handleInputChange('instruction', e.target.value)}
                        name='instruction'
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Please fast for 12 hours before sample collection if required</li>
                      <li>• Have a valid ID ready during collection</li>
                      <li>• Collection fee is included in the test price</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      type='submit'
                      className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600"
                    >
                      Confirm Booking
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
