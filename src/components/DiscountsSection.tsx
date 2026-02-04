import { motion } from 'framer-motion';
import { Percent, Tag, Clock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent} from '@/components/ui/card';

const DiscountsSection = () => {
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

  const discounts = [
    {
      icon: Percent,
      title: '50% OFF',
      subtitle: 'First Consultation',
      description: 'Get 50% discount on your first online consultation',
      code: 'FIRST50',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50'
    },
    {
      icon: Tag,
      title: '30% OFF',
      subtitle: 'Medicine Orders',
      description: 'Save 30% on all medicine orders above $50',
      code: 'MED30',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Clock,
      title: '25% OFF',
      subtitle: 'Lab Tests',
      description: 'Special discount on home lab test services',
      code: 'LAB25',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Gift,
      title: 'FREE',
      subtitle: 'Health Checkup',
      description: 'Complimentary basic health checkup with premium plan',
      code: 'HEALTH',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <section className="py-16 bg-white">
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
            Special Offers & Discounts
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Save more on your healthcare needs with our exclusive offers
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {discounts.map((discount, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className={`h-full ${discount.bgColor} border-2 border-transparent hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1`}>
                <CardContent className="p-6 text-center">
                  <div className={`bg-gradient-to-br ${discount.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <discount.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-1">{discount.title}</h3>
                  <h4 className="font-semibold text-lg text-gray-700 mb-3">{discount.subtitle}</h4>
                  <p className="text-gray-600 mb-4 text-sm">{discount.description}</p>
                  <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-500 mb-1">Use Code:</div>
                    <div className="font-mono font-bold text-lg">{discount.code}</div>
                  </div>
                  <Button 
                    className={`w-full bg-gradient-to-r ${discount.color} text-white border-0`}
                  >
                    Claim Offer
                  </Button>
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
          <p className="text-gray-500 text-sm mb-4">Terms and conditions apply. Offers valid till stocks last.</p>
          <Button variant="outline" size="lg">
            View All Offers
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default DiscountsSection;
