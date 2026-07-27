import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ToolsToolbar } from "@/components/landing/tools-toolbar"
import { FeaturesSection } from "@/components/landing/features-section"
import { CTASection } from "@/components/landing/cta-section"
import { DataLeakDemo } from "@/components/landing/data-leak-demo"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ToolsToolbar />
        <DataLeakDemo />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
