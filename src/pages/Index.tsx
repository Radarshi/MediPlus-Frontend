import HeroSection from '../components/HeroSection';
import DiscountsSection from '../components/DiscountsSection';
import MedicinesOverview from '../components/MedicinesOverview';
import LabTestsSection from '../components/LabTestsSection';
import BlogPreview from '../components/BlogPreview';
import ConsultationSection from '../components/ConsultationSection';
import AppointmentTeaser from '../components/AppointmentTeaser';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <HeroSection />
      <DiscountsSection />
      <MedicinesOverview />
      <LabTestsSection />
      <ConsultationSection />
      <AppointmentTeaser />
      <BlogPreview />
      <Footer />
    </div>
  );
};

export default Index;
