// src/components/ConsultationSection.tsx
// Changed: import supabase → fetchCollection from firebaseClient

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { fetchCollection } from '@/lib/firebaseClient';
import { useEffect, useState } from 'react';

const ConsultationBookingForm = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Fetch from Firestore 'consult' collection
  useEffect(() => {
    fetchCollection('consult')
      .then((data) => setDoctors(data))
      .catch((err) => console.error('Failed to fetch doctors:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDoctor) {
      alert('Please select a doctor first.');
      return;
    }

    const token   = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      alert('Please login first to book consultation.');
      window.location.href = '/login';
      return;
    }

    const user = JSON.parse(userStr);
    setIsSubmitting(true);

    try {
      const formData  = new FormData(e.currentTarget);
      const consultData = {
        name:           formData.get('name'),
        age:            parseInt(formData.get('age') as string),
        phone:          formData.get('phone'),
        email:          user.email,
        symptoms:       formData.get('symptoms'),
        preferred_date: formData.get('preferred_date'),
        preferred_time: formData.get('preferred_time'),
        doctor_name:    selectedDoctor.name,
        doctor_id:      selectedDoctor.id,
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/consulting`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(consultData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Booking failed');

      alert('✅ Your consultation has been booked successfully!\n\nConfirmation email sent to: ' + user.email);
      e.currentTarget.reset();
      setSelectedDoctor(null);
      setSelectedSpecialization('');
      setTime('');
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      alert(`Booking failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Book Your Consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Specialization */}
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="block text-sm font-medium mb-2">1. Select Specialization</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={selectedSpecialization}
                onChange={(e) => { setSelectedSpecialization(e.target.value); setSelectedDoctor(null); }}
                disabled={isSubmitting}
              >
                <option value="">-- All Specializations --</option>
                {[...new Set(doctors.flatMap((doc) => doc.specializations || [doc.specialty]))].map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium mb-2">2. Select Doctor *</label>
              <select
                className="w-full p-3 border-2 rounded-lg"
                value={selectedDoctor?.id || ''}
                onChange={(e) => {
                  const doc = doctors.find((d) => String(d.id) === e.target.value);
                  setSelectedDoctor(doc || null);
                }}
                required
                disabled={isSubmitting}
              >
                <option value="">-- Choose a Doctor --</option>
                {doctors
                  .filter((doc) =>
                    selectedSpecialization
                      ? doc.specializations?.includes(selectedSpecialization) || doc.specialty === selectedSpecialization
                      : true
                  )
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specializations?.[0] || doc.specialty}) — ₹{doc.video_price || doc.videoPrice}
                    </option>
                  ))}
              </select>
            </div>

            {selectedDoctor && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedDoctor.image}</div>
                  <div>
                    <div className="font-semibold text-lg">{selectedDoctor.name}</div>
                    <div className="text-sm text-gray-600">{selectedDoctor.specializations?.[0] || selectedDoctor.specialty}</div>
                    <div className="text-lg font-bold text-green-600">₹{selectedDoctor.video_price || selectedDoctor.videoPrice}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedDoctor && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <Input placeholder="Enter your full name" required name="name" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Age *</label>
                    <Input placeholder="Your age" type="number" required name="age" min="1" max="120" disabled={isSubmitting} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input placeholder="Enter your phone number" name="phone" required pattern="[0-9]{10}" disabled={isSubmitting} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Symptoms / Concerns *</label>
                  <Textarea placeholder="Describe your symptoms..." className="h-24" name="symptoms" required disabled={isSubmitting} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Date *</label>
                    <Input type="date" name="preferred_date" required min={new Date().toISOString().split('T')[0]} disabled={isSubmitting} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Time *</label>
                    <select className="w-full p-2 border rounded-lg" name="preferred_time" value={time} onChange={(e) => setTime(e.target.value)} required disabled={isSubmitting}>
                      <option value="">-- Select Time --</option>
                      {['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="w-full py-3 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Booking...' : 'Book Consultation'}
                </button>
              </>
            )}

            {!selectedDoctor && (
              <div className="text-center py-8 text-gray-500">
                <p>👆 Please select a doctor first to continue</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationBookingForm;