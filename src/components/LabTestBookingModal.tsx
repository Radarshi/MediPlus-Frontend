import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, Mail, MapPin, Phone, User, X } from 'lucide-react';
import { useState } from 'react';
import PaymentModal from './PaymentModal';

interface LabTestBookingModalProps {
  test: any;
  isOpen: boolean;
  onClose: () => void;
}

const LabTestBookingModal = ({ test, isOpen, onClose }: LabTestBookingModalProps) => {

  const [step, setStep] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

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

  // Instead of calling backend directly — open payment modal
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPaymentOpen(true);
  };

  // Called AFTER payment success
  const finalizeLabBooking = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Something went wrong');
        return;
      }

      alert('Your lab test is booked successfully.');

      setIsPaymentOpen(false);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (!test) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40"
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

                  {/* STEP 1 */}
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

                      <Button
                        onClick={() => setStep(2)}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-600">
                        Continue to Booking
                      </Button>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Personal Information</h2>

                      <Input
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />

                      <Input
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />

                      <Input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />

                      <Textarea
                        placeholder="Address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />

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

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="space-y-6">

                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />

                      <select
                        className="w-full p-2 border rounded-lg"
                        value={formData.time}
                        onChange={(e) => handleInputChange('time', e.target.value)}
                      >
                        <option value="">Select time</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                      </select>
                      <Textarea
                        placeholder="Special instructions"
                        value={formData.instruction}
                        onChange={(e) => handleInputChange('instruction', e.target.value)}
                      />
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(2)}>
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600">
                          Confirm & Pay
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

      {/* PAYMENT MODAL */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={finalizeLabBooking}
        plan={{
          name: test.name,
          type: "Lab Test",
          duration: test.duration,
          price: typeof test.price === "string"
          ? parseInt(test.price.replace(/[^\d]/g, ""))
          : test.price
        }}
      />
    </>
  );
};

export default LabTestBookingModal;
