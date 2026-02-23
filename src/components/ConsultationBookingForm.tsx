import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef } from 'react';

interface ConsultationBookingFormProps {
  selectedDoctor?: any;
  selectedPlan?: any; // ✅ NEW: Get plan details for correct price
  onDoctorChange?: () => void;
}

const ConsultationBookingForm = ({ selectedDoctor, selectedPlan, onDoctorChange }: ConsultationBookingFormProps) => {
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null); // ✅ FIX: Use ref for form reset

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedDoctor) {
      alert("Please select a doctor first from the doctors list.");
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      alert("Please login first to book consultation.");
      window.location.href = '/login';
      return;
    }

    const user = JSON.parse(userStr);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // ✅ FIXED: Use plan price or doctor price
      const consultationPrice = selectedPlan?.price || selectedDoctor.video_price || selectedDoctor.videoPrice;
      const consultationType = selectedPlan?.type || 'video';
      const planName = selectedPlan ? `${selectedPlan.name} ${consultationType}` : 'Standard consultation';
      
      const consultData = {
        name: formData.get('name'),
        age: parseInt(formData.get('age') as string),
        phone: formData.get('phone'),
        email: user.email,
        symptoms: formData.get('symptoms'),
        preferred_date: formData.get('preferred_date'),
        preferred_time: formData.get('preferred_time'),
        doctor_name: selectedDoctor.name,
        doctor_id: selectedDoctor.id,
        // ✅ NEW: Include consultation details
        consultation_type: consultationType,
        plan_name: planName,
        amount: consultationPrice
      };

      console.log('📦 Submitting consultation booking:', consultData);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const res = await fetch(`${API_URL}/api/consulting`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(consultData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Booking failed');
      }
      
      // ✅ SUCCESS!
      alert(`✅ Your consultation has been booked successfully!\n\nDoctor: ${selectedDoctor.name}\nType: ${planName}\nAmount: ₹${consultationPrice}\n\nConfirmation email sent to: ${user.email}`);
      
      // ✅ FIX: Reset form using ref
      if (formRef.current) {
        formRef.current.reset();
      }
      setTime('');
      
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      alert(`Booking failed: ${error.message}\n\nPlease check if you're logged in and try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Get correct price display
  const displayPrice = selectedPlan?.price || selectedDoctor?.video_price || selectedDoctor?.videoPrice || 0;
  const consultationType = selectedPlan?.type || 'video';
  const planDuration = selectedPlan?.duration || '30 minutes';
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Book Your Consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {selectedDoctor ? (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedDoctor.image}</div>
                  <div>
                    <div className="font-semibold text-lg">{selectedDoctor.name}</div>
                    <div className="text-sm text-gray-600">
                      {selectedDoctor.specializations?.[0] || selectedDoctor.specialty}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{selectedDoctor.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {/* ✅ FIXED: Show correct price based on plan */}
                  <div className="text-2xl font-bold text-green-600">
                    ₹{displayPrice}
                  </div>
                  {selectedPlan && (
                    <div className="text-xs text-gray-600 mt-1">
                      {selectedPlan.name} {consultationType} • {planDuration}
                    </div>
                  )}
                  {onDoctorChange && (
                    <button
                      onClick={onDoctorChange}
                      className="text-sm text-blue-600 hover:underline mt-1"
                      type="button"
                    >
                      Change Doctor
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>👈 Please select a doctor from the list first</p>
            </div>
          )}

          {selectedDoctor && (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input 
                    placeholder="Enter your full name" 
                    required 
                    name='name'
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Age *</label>
                  <Input 
                    placeholder="Your age" 
                    type="number" 
                    required 
                    name='age' 
                    min="1" 
                    max="120"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <Input 
                  placeholder="Enter your phone number" 
                  name='phone' 
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit phone number"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <Input 
                  placeholder="Enter your email" 
                  type="email" 
                  name='email' 
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Symptoms / Concerns *</label>
                <Textarea 
                  placeholder="Describe your symptoms or health concerns..." 
                  className="h-24" 
                  name='symptoms' 
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Date *</label>
                  <Input 
                    type="date" 
                    name='preferred_date' 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Time *</label>
                  <select 
                    className="w-full p-2 border rounded-lg" 
                    name='preferred_time' 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">-- Select Time --</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                  </select>
                </div>
              </div>

              <button 
                className="w-full py-3 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Booking...
                  </span>
                ) : (
                  'Book Consultation'
                )}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationBookingForm;