import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Users, Globe } from 'lucide-react';

export const SpiritualHero = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  
  const phrases = [
    "Begin Your Quest",
    "Discover Wisdom", 
    "Inner Journey",
    "Timeless Truth"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % phrases.length);
    }, 8000); // Much slower rotation

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "Ancient Wisdom",
      description: "Access timeless teachings and gentle guidance for your spiritual journey"
    },
    {
      icon: Heart, 
      title: "Personal Guidance",
      description: "Receive thoughtful responses tailored to your unique spiritual path"
    },
    {
      icon: Users,
      title: "Universal Principles",
      description: "Explore fundamental truths that unite humanity across all traditions"
    },
    {
      icon: Globe,
      title: "Seeking Community",
      description: "Connect with fellow seekers on the path of inner discovery"
    }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-starfield opacity-30"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Main title */}
        <div className="mb-8">
          <div className="h-16 flex items-center justify-center">
            <h2 className="text-2xl md:text-4xl font-semibold text-wisdom-amber animate-subtle-glow">
              {phrases[currentPhrase]}
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
            A thoughtful AI companion that draws from spiritual wisdom traditions, 
            offering gentle guidance and insights for seekers on their personal journey 
            of inner discovery and growth.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg"
            className="bg-wisdom-amber text-quest-slate hover:bg-wisdom-amber/90 transition-all duration-300 text-lg px-8 py-6"
          >
            Begin Your Quest
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-wisdom-amber/30 text-wisdom-amber hover:bg-wisdom-amber/10 transition-all duration-300 text-lg px-8 py-6"
          >
            Explore Wisdom
          </Button>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-morphism border-wisdom p-6 rounded-lg hover:scale-102 transition-all duration-300 animate-gentle-float"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-wisdom flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-quest-slate" />
              </div>
              
              <h3 className="text-lg font-semibold text-wisdom-amber mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Minimal geometric accents */}
        <div className="absolute top-1/3 left-1/6 w-16 h-16 opacity-15 animate-gentle-float">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--wisdom-amber))" strokeWidth="1" opacity="0.4"/>
            <circle cx="50" cy="50" r="20" fill="none" stroke="hsl(var(--wisdom-amber))" strokeWidth="1" opacity="0.6"/>
          </svg>
        </div>

        <div className="absolute top-2/3 right-1/6 w-12 h-12 opacity-15 animate-gentle-float" style={{ animationDelay: '3s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="25" y="25" width="50" height="50" fill="none" stroke="hsl(var(--wisdom-amber))" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
};