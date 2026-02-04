import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Video } from 'lucide-react';

const ConsultationSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const consultationTypes = [
    {
      icon: Video,
      title: 'Video Consultation',
      description: 'Face-to-face consultation with doctors',
      price: 'Starting from $25',
      features: ['HD Video Call', 'Instant Connection', 'Digital Prescription'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Chat Consultation',
      description: 'Text-based consultation for quick queries',
      price: 'Starting from $15',
      features: ['Instant Messaging', '24/7 Available', 'Quick Response'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Phone,
      title: 'Phone Consultation',
      description: 'Voice consultation with medical experts',
      price: 'Starting from $20',
      features: ['Clear Audio', 'Call Recording', 'Follow-up Support'],
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl font-bold mb-4"
          >
            Online Consultation Services
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Connect with qualified doctors from the comfort of your home
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {consultationTypes.map((type, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className={`bg-gradient-to-br ${type.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <div className="text-2xl font-bold text-green-600 mb-4">{type.price}</div>
                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full bg-gradient-to-r ${type.color}`}>
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationSection;
