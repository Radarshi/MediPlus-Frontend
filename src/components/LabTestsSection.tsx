import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Clock, Heart, Microscope, Shield } from 'lucide-react';

const LabTestsSection = () => {
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

  const tests = [
    {
      icon: Heart,
      name: 'Complete Blood Count',
      description: 'Comprehensive blood analysis',
      price: '$25',
      duration: '2-4 hours',
      preparation: 'Fasting required'
    },
    {
      icon: Microscope,
      name: 'Diabetes Panel',
      description: 'Blood sugar and HbA1c testing',
      price: '$35',
      duration: '1-2 hours',
      preparation: 'Fasting required'
    },
    {
      icon: Shield,
      name: 'Lipid Profile',
      description: 'Cholesterol and triglycerides',
      price: '$30',
      duration: '2-4 hours',
      preparation: 'Fasting required'
    }
  ];

  const packages = [
    {
      name: 'Basic Health Checkup',
      tests: ['Complete Blood Count', 'Basic Metabolic Panel', 'Urinalysis'],
      price: '$89',
      discount: '15% off',
      popular: false
    },
    {
      name: 'Comprehensive Package',
      tests: ['All Basic Tests', 'Lipid Profile', 'Liver Function', 'Kidney Function'],
      price: '$179',
      discount: '25% off',
      popular: true
    },
    {
      name: 'Executive Package',
      tests: ['All Comprehensive Tests', 'Cardiac Markers', 'Thyroid Panel', 'Vitamin D'],
      price: '$299',
      discount: '30% off',
      popular: false
    }
  ];

  const testimonialVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
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
            Laboratory Tests
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Accurate and reliable lab tests with quick results
          </motion.p>
        </motion.div>

        {/* Individual Tests */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {tests.map((test, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <test.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{test.name}</h3>
                  <p className="text-gray-600 mb-4">{test.description}</p>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {test.duration}
                    </div>
                    <div className="flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {test.preparation}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-4">{test.price}</div>
                  <a href="/lab-tests"><Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600">
                    Book Test
                  </Button></a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="text-center mt-12"
                >
                  <a href="/lab-tests"><Button variant="outline" size="lg">
                    Load More
                  </Button></a>
                </motion.div>
      </div>
    </section>
  );
};

export default LabTestsSection;
