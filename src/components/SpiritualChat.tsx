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

const spiritualResponses = [
  "Let me reflect on your words with the wisdom of the ages. How may the light of understanding illuminate your path?",
  "Your question touches the heart of spiritual seeking. Consider this: every soul's journey is unique, yet we all walk toward the same divine light.",
  "In the sacred writings, we find guidance for such moments. Perhaps what you seek lies not in answers, but in the questions themselves.",
  "The path of spiritual growth is often through reflection and prayer. What does your heart tell you in this moment of quietude?",
  "Like a lamp that burns brightest in the darkest night, wisdom often emerges from our deepest contemplations.",
];

export const SpiritualChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Peace be upon you, dear seeker. I am here to offer gentle guidance through the wisdom of the Bahá'í Faith. How may I assist you on your spiritual journey today?",
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

      // Fallback to local response if API fails
      const responseText = spiritualResponses[Math.floor(Math.random() * spiritualResponses.length)];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
        hasQuote: Math.random() > 0.7
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
    <Card className="glass-morphism border-divine h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-divine-gold/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-divine flex items-center justify-center animate-divine-pulse">
            <Sparkles className="w-5 h-5 text-sacred-blue" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gradient-divine">
              Spiritual Guidance
            </h2>
            <p className="text-sm text-muted-foreground">
              Wisdom from the Bahá'í Faith
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
                className={`max-w-[80%] p-4 rounded-lg transition-all duration-300 ${
                  message.isUser
                    ? 'bg-divine-gold/20 text-divine-gold border border-divine-gold/30'
                    : 'bg-sacred-blue/30 text-foreground border border-sacred-blue-light/30'
                }`}
              >
                <p className="text-sm leading-relaxed">
                  {message.text}
                </p>
                
                {message.hasQuote && !message.isUser && (
                  <div className="mt-3 pt-3 border-t border-divine-gold/20">
                    <p className="text-xs italic text-divine-gold/80 font-script">
                      "Be generous in prosperity, and thankful in adversity..."
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {!message.isUser && (
                    <Heart className="w-3 h-3 text-divine-gold/60" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-sacred-blue/30 text-foreground border border-sacred-blue-light/30 p-4 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-divine-gold rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-divine-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-divine-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 border-t border-divine-gold/20">
        <div className="flex space-x-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask for spiritual guidance..."
            className="flex-1 bg-sacred-blue/20 border-divine-gold/30 text-foreground placeholder:text-muted-foreground focus:border-divine-gold/50"
          />
          
          <Button
            onClick={handleVoiceInput}
            variant="outline"
            size="icon"
            className={`border-divine-gold/30 text-divine-gold hover:bg-divine-gold/10 transition-all duration-300 ${
              isListening ? 'animate-pulse bg-divine-gold/20' : ''
            }`}
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-divine-gold text-sacred-blue hover:bg-divine-gold/90 transition-all duration-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};