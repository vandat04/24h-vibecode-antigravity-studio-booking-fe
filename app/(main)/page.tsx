import HeroSection from "@/components/home/HeroSection";
import BrandStorySection from "@/components/home/BrandStorySection";
import ServicesSection from "@/components/home/ServicesSection";
import ConceptsSection from "@/components/home/ConceptsSection";
import StaffSection from "@/components/home/StaffSection";
import BehindScenesSection from "@/components/home/BehindScenesSection";
import BookingSection from "@/components/home/BookingSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogSection from "@/components/home/BlogSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandStorySection />
      <ServicesSection />
      <ConceptsSection />
      <StaffSection />
      <BehindScenesSection />
      <BookingSection />
      <TestimonialsSection />
      <BlogSection />
    </>
  );
}
