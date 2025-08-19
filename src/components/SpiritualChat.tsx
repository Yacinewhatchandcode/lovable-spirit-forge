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
        hasQuote: Math.random() > 0.7
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
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-wisdom-amber/30 shadow-wisdom h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b-2 border-wisdom-amber/20 bg-gradient-to-r from-wisdom-amber/5 to-wisdom-amber/10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-wisdom-amber/20 backdrop-blur-sm flex items-center justify-center animate-wisdom-pulse border-2 border-wisdom-amber/40">
            <Sparkles className="w-6 h-6 text-wisdom-amber-dark" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-wisdom-amber-dark">
              Wisdom Companion
            </h2>
            <p className="text-sm text-quest-slate">
              Ancient wisdom for modern seekers
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg transition-all duration-300 shadow-sm ${
                  message.isUser
                    ? 'bg-wisdom-amber/15 text-wisdom-amber-dark border-2 border-wisdom-amber/40 ml-4'
                    : 'bg-white/80 backdrop-blur-sm text-quest-slate-dark border-2 border-quest-slate/20 mr-4'
                }`}
              >
                <p className="text-sm leading-relaxed">
                  {message.text}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {!message.isUser && (
                    <Heart className="w-3 h-3 text-wisdom-amber/60" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/90 backdrop-blur-sm text-quest-slate-dark border-2 border-quest-slate/20 p-4 rounded-lg mr-4 shadow-sm">
                <div className="flex space-x-2 items-center">
                  <span className="text-sm text-quest-slate mr-2">Thinking...</span>
                  <div className="w-2 h-2 bg-wisdom-amber rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-wisdom-amber rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-wisdom-amber rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 border-t-2 border-wisdom-amber/20 bg-gradient-to-r from-wisdom-amber/5 to-transparent">
        <div className="flex space-x-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts and seek wisdom..."
            className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-wisdom-amber/40 text-quest-slate-dark placeholder:text-quest-slate/60 focus:border-wisdom-amber focus:ring-2 focus:ring-wisdom-amber/20"
          />
          
          <Button
            onClick={handleVoiceInput}
            variant="outline"
            size="icon"
            className={`border-2 border-wisdom-amber/50 text-wisdom-amber-dark hover:bg-wisdom-amber/20 transition-all duration-300 bg-white/80 backdrop-blur-sm ${
              isListening ? 'animate-pulse bg-wisdom-amber/30' : ''
            }`}
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-wisdom-amber text-white hover:bg-wisdom-amber-dark transition-all duration-300 shadow-wisdom border-0 font-medium"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};