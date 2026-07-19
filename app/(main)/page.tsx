import HeroSection from "@/components/home/HeroSection";
import BrandStorySection from "@/components/home/BrandStorySection";
import CoreValuesSection from "@/components/home/CoreValuesSection";
import ServicesSection from "@/components/home/ServicesSection";
import WorkProcessSection from "@/components/home/WorkProcessSection";
import ConceptsSection from "@/components/home/ConceptsSection";
import StaffSection from "@/components/home/StaffSection";
import BookingSection from "@/components/home/BookingSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogSection from "@/components/home/BlogSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandStorySection />
      <CoreValuesSection />
      <ServicesSection />
      <WorkProcessSection />
      <ConceptsSection />
      <StaffSection />
      <BookingSection />
      <TestimonialsSection />
      <BlogSection />
    </>
  );
}
