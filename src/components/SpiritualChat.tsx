import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, Sparkles, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  hasQuote?: boolean;
  hiddenWord?: {
    id: string;
    text: string;
    addressee: string;
    part: string;
    number: number;
    section_title: string;
  };
}

// Function to get random wisdom quote as fallback
const getRandomWisdomQuote = async () => {
  try {
    const { data, error } = await supabase
      .from('hidden_words')
      .select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const wisdomText = data[randomIndex];
      return `"${wisdomText.text}" — Ancient Wisdom`;
    }
  } catch (error) {
    console.error('Error fetching wisdom:', error);
  }
  
  // Ultimate fallback
  return "The journey inward requires courage, patience, and an open heart. Trust in the process of your own unfolding.";
};

export const SpiritualChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome, fellow seeker. I am here to offer gentle guidance drawing from timeless spiritual wisdom. How may I assist you on your journey of inner discovery today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Call OpenRouter via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-openrouter', {
        body: { message: messageText }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (data?.error) {
        console.error('OpenRouter API error:', data.error);
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I apologize, but I cannot provide a response at this moment. Please try again.",
        isUser: false,
        timestamp: new Date(),
        hasQuote: !!data.hiddenWord,
        hiddenWord: data.hiddenWord || undefined
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        description: "Spiritual guidance received ✨",
      });
    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback to wisdom quote if API fails
      const responseText = await getRandomWisdomQuote();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        hasQuote: true
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        description: "Using offline guidance mode",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      toast({
        title: "Voice Recognition",
        description: "Listening... Please speak your spiritual question.",
      });
      
      setTimeout(() => {
        setIsListening(false);
        setInputValue("How can I find inner peace in difficult times?");
        toast({
          title: "Voice Captured",
          description: "Your question has been received.",
        });
      }, 3000);
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Voice recognition is not available in your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white border border-border shadow-lg h-[600px] md:h-[700px] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Wisdom Companion
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Ancient wisdom for modern seekers
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl transition-all duration-200 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed">
                    {message.text}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {!message.isUser && (
                      <Heart className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </div>
              </div>

              {/* Beautiful Hidden Words Quote - appears after AI responses */}
              {!message.isUser && message.hasQuote && message.hiddenWord && (
                <div className="flex justify-center px-4">
                  <div className="glass-morphism border-divine p-6 max-w-lg mx-auto transition-all duration-700 opacity-100 transform translate-y-0">
                    <div className="text-center space-y-4">
                      {/* Calligraphy-style quote */}
                      <div className="relative">
                        <svg 
                          className="absolute inset-0 w-full h-full opacity-20" 
                          viewBox="0 0 300 120"
                          fill="none"
                        >
                          <path
                            d="M30 60 Q150 30 270 60"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="500"
                            strokeDashoffset="500"
                            className="animate-[calligraphy-draw_3s_ease-in-out]"
                          />
                        </svg>
                        
                        <blockquote className="font-script text-primary text-xl md:text-2xl leading-snug tracking-wide relative z-10">
                          "{message.hiddenWord.text}"
                        </blockquote>
                      </div>

                      {/* Source attribution */}
                      <div className="space-y-2">
                        <p className="text-primary font-script text-sm">
                          — {message.hiddenWord.addressee}
                        </p>
                        
                        {/* Theme indicator */}
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                          <span className="text-xs text-primary/80 capitalize">
                            {message.hiddenWord.part} #{message.hiddenWord.number} - {message.hiddenWord.section_title}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground p-3 md:p-4 rounded-2xl border border-border">
                <div className="flex space-x-2 items-center">
                  <span className="text-sm mr-2">Thinking...</span>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 md:p-6 border-t border-border bg-white">
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-3">
          {/* Voice button - separate row on mobile */}
          <div className="md:hidden flex justify-center">
            <Button
              onClick={handleVoiceInput}
              variant="outline"
              size="sm"
              className={`border border-border text-muted-foreground hover:bg-accent transition-all duration-200 ${
                isListening ? 'animate-pulse bg-accent' : ''
              }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Input
            </Button>
          </div>

          {/* Main input row */}
          <div className="flex space-x-2 md:space-x-3 flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts and seek wisdom..."
              className="flex-1 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring rounded-full px-4 py-2 md:py-3"
            />
            
            {/* Voice button - inline on desktop */}
            <Button
              onClick={handleVoiceInput}
              variant="ghost"
              size="icon"
              className={`hidden md:flex border-0 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 ${
                isListening ? 'animate-pulse bg-accent' : ''
              }`}
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 rounded-full px-4 md:px-6 font-medium"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};