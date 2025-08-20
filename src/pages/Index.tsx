import { SpiritualHero } from '@/components/SpiritualHero';
import { SpiritualChat } from '@/components/SpiritualChat';
import { ParticleField } from '@/components/ParticleField';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden mobile-safe-area">
      {/* Animated particle background */}
      <ParticleField />
      
      <div className="relative z-10">
        {/* Hero Section - Mobile optimized */}
        <section className="min-h-[60vh] sm:min-h-[70vh] flex items-center px-4 sm:px-6">
          <div className="w-full">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-wisdom mb-3 sm:mb-4 text-crisp android-text-size">
                Spiritual Quest Companion
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground px-2 leading-relaxed">
                A thoughtful AI guide for your journey of inner discovery
              </p>
            </div>
          </div>
        </section>

        {/* Chat Interface - Mobile first */}
        <section className="py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <SpiritualChat />
          </div>
        </section>

        {/* Footer - Mobile optimized */}
        <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-wisdom-amber/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 sm:mb-8">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(var(--wisdom-amber))" strokeWidth="1"/>
                <circle cx="50" cy="50" r="6" fill="hsl(var(--wisdom-amber))"/>
              </svg>
            </div>
            
            <p className="text-wisdom-amber text-base sm:text-lg mb-3 sm:mb-4 px-2">
              "The journey of a thousand miles begins with one step."
            </p>
            
            <p className="text-xs sm:text-sm text-muted-foreground px-2">
              Built for seekers, guided by wisdom, inspired by truth
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
