import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface HiddenWord {
  id: string;
  number: number;
  part: string;
  addressee: string;
  text: string;
  section_title: string;
}

export const SpiritualQuote = () => {
  const [currentQuote, setCurrentQuote] = useState<HiddenWord | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [allQuotes, setAllQuotes] = useState<HiddenWord[]>([]);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('hidden_words')
        .select('*')
        .order('part, number');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAllQuotes(data);
        if (!currentQuote) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setCurrentQuote(data[randomIndex]);
        }
      }
    } catch (error) {
      console.error('Error fetching Hidden Words:', error);
    }
  };

  const getRandomQuote = () => {
    if (allQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      return allQuotes[randomIndex];
    }
    return null;
  };

  const handleNewQuote = () => {
    const newQuote = getRandomQuote();
    if (newQuote) {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuote(newQuote);
        setIsVisible(true);
      }, 300);
    }
  };

  useEffect(() => {
    fetchQuotes();
    
    const interval = setInterval(() => {
      handleNewQuote();
    }, 15000); // Change quote every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={`glass-morphism border-divine p-8 max-w-2xl mx-auto transition-all duration-700 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      <div className="text-center space-y-6">
        {/* Calligraphy-style quote */}
        <div className="relative">
          <svg 
            className="absolute inset-0 w-full h-full opacity-20" 
            viewBox="0 0 400 200"
            fill="none"
          >
            <path
              d="M50 100 Q200 50 350 100"
              stroke="hsl(var(--divine-gold))"
              strokeWidth="2"
              fill="none"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              className="animate-[calligraphy-draw_3s_ease-in-out_infinite]"
            />
          </svg>
          
          <blockquote className="font-script text-divine-gold text-3xl md:text-4xl lg:text-5xl leading-snug tracking-wide relative z-10">
            “{currentQuote?.text}”
          </blockquote>
        </div>

        {/* Source attribution */}
        <div className="space-y-2">
          <p className="text-divine-gold font-script text-lg">
            — {currentQuote?.addressee}
          </p>
          
          {/* Theme indicator */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-sacred-blue/30 border border-divine-gold/20">
            <span className="text-sm text-divine-gold/80 capitalize">
              {currentQuote?.part === 'arabic' ? 'Arabic' : 'Persian'} #{currentQuote?.number} - {currentQuote?.section_title}
            </span>
          </div>
        </div>

        {/* Action button */}
        <Button 
          onClick={handleNewQuote}
          variant="outline"
          className="border-divine-gold/30 text-divine-gold hover:bg-divine-gold/10 hover:border-divine-gold/50 transition-all duration-300 animate-divine-pulse"
        >
          Receive New Wisdom
        </Button>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-divine-gold/40 rounded-full animate-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 1.2}s`
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};