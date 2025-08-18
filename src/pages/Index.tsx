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
        <section className="min-h-screen">
          <SpiritualHero />
        </section>


        {/* Spiritual Chat Interface */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-divine mb-4">
              Spiritual Guidance
            </h2>
            <p className="text-lg text-muted-foreground">
              Engage in meaningful conversation with our AI spiritual guide
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <SpiritualChat />
          </div>
        </section>

        {/* Footer with sacred geometry */}
        <footer className="py-16 px-6 border-t border-divine-gold/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-60" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--divine-gold))" strokeWidth="2"/>
                <path d="M30 30 L70 70 M70 30 L30 70" stroke="hsl(var(--divine-gold))" strokeWidth="1"/>
                <circle cx="50" cy="50" r="8" fill="hsl(var(--divine-gold))"/>
              </svg>
            </div>
            
            <p className="text-divine-gold text-xl mb-4">
              "The earth is but one country, and mankind its citizens."
            </p>
            
            <p className="text-sm text-muted-foreground">
              Built with love, guided by wisdom, inspired by unity
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
