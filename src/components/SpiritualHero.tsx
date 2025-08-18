import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Users, Globe } from 'lucide-react';

export const SpiritualHero = () => {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  
  const phrases = [
    "Wisdom of the Ages",
    "Unity in Diversity", 
    "Spiritual Guidance",
    "Universal Love"
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
      title: "Spiritual Wisdom",
      description: "Access to sacred texts and gentle guidance from Bahá'í teachings"
    },
    {
      icon: Heart, 
      title: "Voice Interaction",
      description: "Speak naturally and receive compassionate responses in real-time"
    },
    {
      icon: Users,
      title: "Universal Unity",
      description: "Embrace the oneness of humanity through inclusive spiritual practice"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with seekers worldwide on the path of spiritual growth"
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
            <h2 className="text-2xl md:text-4xl font-script text-divine-gold animate-shimmer">
              {phrases[currentPhrase]}
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6">
            An advanced AI system that bridges spiritual wisdom with cutting-edge technology, 
            offering guidance through the sacred teachings of the Bahá'í Faith with 
            real-time voice interaction and beautiful spiritual experiences.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg"
            className="bg-divine-gold text-sacred-blue hover:bg-divine-gold/90 transition-all duration-300 text-lg px-8 py-6"
          >
            Begin Spiritual Journey
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-divine-gold/30 text-divine-gold hover:bg-divine-gold/10 transition-all duration-300 text-lg px-8 py-6"
          >
            Explore Wisdom
          </Button>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-morphism border-divine p-6 rounded-xl hover:scale-105 transition-all duration-500 animate-float"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-divine flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-sacred-blue" />
              </div>
              
              <h3 className="text-lg font-semibold text-divine-gold mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sacred geometry decoration */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 opacity-20 animate-float">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--divine-gold))" strokeWidth="1" opacity="0.6"/>
            <circle cx="50" cy="50" r="30" fill="none" stroke="hsl(var(--divine-gold))" strokeWidth="1" opacity="0.4"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="hsl(var(--divine-gold))" strokeWidth="1" opacity="0.8"/>
            <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="hsl(var(--divine-gold))" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>

        <div className="absolute top-3/4 right-1/4 w-24 h-24 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon points="50,10 90,90 10,90" fill="none" stroke="hsl(var(--divine-gold))" strokeWidth="1" opacity="0.5"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="hsl(var(--divine-gold))" strokeWidth="1" opacity="0.7"/>
          </svg>
        </div>
      </div>
    </div>
  );
};