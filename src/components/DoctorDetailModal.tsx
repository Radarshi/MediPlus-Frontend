// src/components/DoctorDetailModal.tsx
// Changed: removed supabase import — doctor data passed via props, no internal fetch needed

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Calendar, Clock, MessageCircle, Phone, Star, Video, X } from 'lucide-react';

interface DoctorDetailModalProps {
  doctor: any;
  isOpen: boolean;
  onClose: () => void;
}

const DoctorDetailModal = ({ doctor, isOpen, onClose }: DoctorDetailModalProps) => {
  if (!doctor) return null;

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
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
                    {doctor.image}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{doctor.name}</h1>
                    <p className="text-blue-100">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <span className="font-semibold">{doctor.rating}</span>
                      <span className="text-blue-100">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About Dr. {doctor.name?.split(' ')[1]}</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Dr. {doctor.name?.split(' ')[1]} is a highly experienced{' '}
                      {doctor.specialty?.toLowerCase()} with over {doctor.experience} of practice.
                      Known for their compassionate care and innovative treatment approaches.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Education & Qualifications</h3>
                    <div className="space-y-2">
                      {['MD from Harvard Medical School', 'Residency at Johns Hopkins Hospital', `Board Certified in ${doctor.specialty}`].map((q) => (
                        <div key={q} className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.specializations?.map((spec, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{spec}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Consultation Details</h3>
                    <div className="space-y-3">
                      {[
                        { icon: Video, label: 'Video Consultation', color: 'text-blue-600',   price: doctor.videoPrice || doctor.video_price },
                        { icon: Phone, label: 'Phone Consultation', color: 'text-green-600',  price: doctor.phonePrice || doctor.phone_price },
                        { icon: MessageCircle, label: 'Chat Consultation', color: 'text-purple-600', price: doctor.chatPrice || doctor.chat_price },
                      ].map(({ icon: Icon, label, color, price }) => (
                        <div key={label} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${color}`} />
                            <span>{label}</span>
                          </div>
                          <span className="font-semibold text-green-600">₹{price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Availability</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-gray-600" /><span>Monday - Friday: 9:00 AM - 6:00 PM</span></div>
                      <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-gray-600" /><span>Saturday: 10:00 AM - 4:00 PM</span></div>
                      <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-600" /><span>Next Available: Today 2:00 PM</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Patient Reviews</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Sarah M.', text: 'Excellent doctor with great bedside manner. Highly recommend!' },
                        { name: 'John D.',  text: 'Very thorough and professional. Great experience overall.' },
                      ].map((r) => (
                        <div key={r.name} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}</div>
                            <span className="text-sm font-medium">{r.name}</span>
                          </div>
                          <p className="text-sm text-gray-700">"{r.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <Button className="flex-1 bg-gradient-to-r from-blue-500 to-green-500">Book Video Consultation</Button>
                <Button variant="outline" className="flex-1">Schedule Later</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DoctorDetailModal;