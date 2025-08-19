import { SpiritualHero } from '@/components/SpiritualHero';
import { SpiritualChat } from '@/components/SpiritualChat';
import { ParticleField } from '@/components/ParticleField';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated particle background */}
      <ParticleField />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex items-center">
          <div className="w-full">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-wisdom mb-4">
                Spiritual Quest Companion
              </h1>
              <p className="text-lg text-muted-foreground">
                A thoughtful AI guide for your journey of inner discovery
              </p>
            </div>
          </div>
        </section>

        {/* Simple Chat Interface */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <SpiritualChat />
          </div>
        </section>

        {/* Footer with simple geometry */}
        <footer className="py-16 px-6 border-t border-wisdom-amber/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(var(--wisdom-amber))" strokeWidth="1"/>
                <circle cx="50" cy="50" r="6" fill="hsl(var(--wisdom-amber))"/>
              </svg>
            </div>
            
            <p className="text-wisdom-amber text-lg mb-4">
              "The journey of a thousand miles begins with one step."
            </p>
            
            <p className="text-sm text-muted-foreground">
              Built for seekers, guided by wisdom, inspired by truth
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
