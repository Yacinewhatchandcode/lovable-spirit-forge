import { SpiritualHero } from '@/components/SpiritualHero';
import { SpiritualChat } from '@/components/SpiritualChat';
import { ParticleField } from '@/components/ParticleField';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden mobile-safe-area flex flex-col">
      {/* Animated particle background */}
      <ParticleField />
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Compact Hero Section - Mobile optimized */}
        <section className="flex-shrink-0 flex items-center px-3 sm:px-6 py-6 sm:py-8">
          <div className="w-full">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-wisdom mb-2 sm:mb-3 text-crisp android-text-size">
                Wisdom Companion
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2 leading-relaxed">
                Ancient wisdom for modern seekers
              </p>
            </div>
          </div>
        </section>

        {/* Chat Interface - Takes remaining space */}
        <section className="flex-1 flex flex-col px-3 sm:px-6 pb-4 sm:pb-8 min-h-0">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full min-h-0">
            <SpiritualChat />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
