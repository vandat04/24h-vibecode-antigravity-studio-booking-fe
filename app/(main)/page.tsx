import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import ConceptsSection from "@/components/home/ConceptsSection";
import StaffSection from "@/components/home/StaffSection";
import BookingSection from "@/components/home/BookingSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogSection from "@/components/home/BlogSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <ConceptsSection />
      <StaffSection />
      <BookingSection />
      <TestimonialsSection />
      <BlogSection />
    </>
  );
}
