import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ConsultationBookingForm = () => {
    const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
    const [doctors,setDoctors] = useState<any[]>([]);
    const [selectedSpecialization,setSelectedSpecialization] = useState(null);
    const [time,setTime] = useState("");

  useEffect(()=>{
    const fetchData = async ()=>{
      const {data: doctors, error: docError} = await supabase
      .from('consult')
      .select('*')

      if(docError)
          console.error('Failed to fetch data',docError.message);
      else
        setDoctors(doctors);
    }
    fetchData();
  },[])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = Object.fromEntries(formData.entries());

    if (selectedDoctor) {
    form.doctor_id = selectedDoctor.id;
    form.doctor_name = selectedDoctor.name;
  } else
      await alert("Please select a doctor.");
    
    const res = await fetch(`${import.meta.env.BACKEND_URL}/api/consulting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok)
      alert(data.error || 'Something went Wrong');
    else{
      localStorage.setItem('token', data.token);
      alert('Your session is booked.')
    }
  };
  
    return(
         <div>
            <Card>
              <CardHeader>
                <CardTitle>Book Your Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDoctor && (
                  <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{selectedDoctor.image}</div>
                      <div>
                        <div className="font-semibold">{selectedDoctor.name}</div>
                        <div className="text-sm text-gray-600">{selectedDoctor.specializations[0]}</div>
                        <div className="text-lg font-bold text-green-600">${selectedDoctor.videoPrice}</div>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input placeholder="Enter your full name" required name='name'/>
                  </div>
                  <div></div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Age</label>
                    <Input placeholder="Your age" type="number" required name='age'/>
                  </div>
                </div>

             {/* Specialization Filter */}
              <div className='p-2'>
               <label className="block text-sm font-medium mb-2">Select Specialization</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}>

                <option value="">-- All Specializations --</option>
                {[...new Set(doctors.flatMap((doc) => doc.specializations || []))].map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
                </select>
              </div>

            <div className='p-2'>
              <label className="block text-sm font-medium mb-2">Select Doctor</label>
              <select
              className="w-full p-2 border rounded-lg"
              name="doctor_id"
              value={selectedDoctor?.id || ""}
              onChange={(e) => {
              const doc = doctors.find((d) => String(d.id) === e.target.value);
              setSelectedDoctor(doc || null); }}
              required >

          <option value="">-- Choose a Doctor --</option>
          {doctors
          .filter((doc) =>
          selectedSpecialization
          ? doc.specializations?.includes(selectedSpecialization)
          : true
          )
          .map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name} ({doc.specializations?.[0]})
          </option>
         ))}
          </select>
          </div>

            {selectedDoctor && (
              <>
              <input type="hidden" name="doctor_name" value={selectedDoctor.name}/>
              <input type="hidden" name="doctor_id" value={selectedDoctor.id}/>
              </> )}

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input placeholder="Enter your phone number" name='phone' />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input placeholder="Enter your email" type="email" name='email'/>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Symptoms / Concerns</label>
                  <Textarea placeholder="Describe your symptoms or health concerns..." className="h-24" name='symptoms' required/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred Date</label>
                    <Input type="date" name='preferred_date'/>
                  </div>

                  <div className='p-2'>
                    <label className="block text-sm font-medium mb-2">Preferred Time</label>
                    <select className="w-full p-2 border rounded-lg" name='preferred_time' value={time}>
                      <option value={9}>9:00 AM</option>
                      <option value={10}>10:00 AM</option>
                      <option value={11}>11:00 AM</option>
                      <option value={12} >12:00 PM</option>
                      <option value={1} >1:00 PM</option>
                      <option value={2}>2:00 PM</option>
                      <option value={3}>3:00 PM</option>
                      <option value={4}>4:00 PM</option>
                    </select>
                  </div>
                </div>

                  <button className="w-full py-3 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                  type="submit">Book Consultation</button>
                </form>
              </CardContent>
            </Card>
          </div>
    )
}
export default ConsultationBookingForm