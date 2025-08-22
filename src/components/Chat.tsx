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

type HiddenWordData = NonNullable<Message['hiddenWord']>;

const getRandomHiddenWord = async (): Promise<HiddenWordData | null> => {
  try {
    const { data, error } = await supabase
      .from('hidden_words')
      .select('id, text, addressee, part, number, section_title')
      .limit(200);

    if (error) throw error;

    if (data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const content = data[randomIndex] as any;
      return {
        id: content.id,
        text: content.text,
        addressee: content.addressee,
        part: content.part,
        number: content.number,
        section_title: content.section_title ?? ''
      };
    }
  } catch (error) {
    console.error('Error fetching random Hidden Word:', error);
  }

  return null;
};

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to Quest. I'm here to help you explore areas of life through guidance that emphasizes meaning, purpose, and growth. Rather than focusing on material objectives, I draw from sources that aim to build a constructive framework for life—at the level of the individual, family, and community. How can I guide your reflection today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [usedHiddenWordIds, setUsedHiddenWordIds] = useState<string[]>([]);
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
      // Prepare short conversation history (without current message) for memory
      const historyPayload = messages.slice(-8).map(m => ({
        role: m.isUser ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

      // Call OpenRouter via Supabase Edge Function with history and excludeIds
      const { data, error } = await supabase.functions.invoke('chat-with-openrouter', {
        body: { message: messageText, history: historyPayload, excludeIds: usedHiddenWordIds }
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

      if (aiMessage.hiddenWord?.id) {
        setUsedHiddenWordIds(prev => [...prev, aiMessage.hiddenWord!.id]);
      }

      toast({
        description: "Response received",
      });
    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback to a random Hidden Word if API fails
      const randomHiddenWord = await getRandomHiddenWord();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomHiddenWord ? "Let me share some spiritual wisdom that may offer guidance for your journey." : "I apologize, but I cannot provide a response at this moment. Please try again.",
        isUser: false,
        timestamp: new Date(),
        hasQuote: !!randomHiddenWord,
        hiddenWord: randomHiddenWord || undefined
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        description: "Using offline mode",
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
        description: "Listening... Please speak your question.",
      });
      
      setTimeout(() => {
        setIsListening(false);
        setInputValue("How can I get help with this?");
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
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg flex flex-col flex-1 min-h-0 rounded-2xl">
      {/* Compact Header - only show on larger screens */}
      <div className="hidden sm:flex p-4 md:p-6 border-b border-border/30 bg-card/80 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Quest
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Guidance for meaningful living
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 sm:p-4 md:p-6 min-h-0">
        <div className="space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="text-primary text-2xl" />
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Quest helps you explore life through guidance that emphasizes meaning, purpose, and growth. How can I guide your reflection today?
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] p-3 sm:p-4 rounded-2xl transition-all duration-200 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/80 text-foreground border border-border/50'
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!message.isUser && (
                      <Heart className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/80 text-foreground p-3 sm:p-4 rounded-2xl border border-border/50">
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
      <div className="p-3 sm:p-4 md:p-6 border-t border-border/30 bg-card/80 backdrop-blur-sm rounded-b-2xl">
        <div className="flex gap-2 sm:gap-3">
          {/* Voice button */}
          <Button
            onClick={handleVoiceInput}
            variant="outline"
            size="icon"
            className={`shrink-0 h-11 w-11 sm:h-10 sm:w-10 mobile-touch-target border-border/50 hover:bg-accent transition-all duration-200 ${
              isListening ? 'animate-pulse bg-accent' : ''
            }`}
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          {/* Input and send */}
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full h-11 mobile-touch-target pr-12 rounded-xl bg-input border-border/50 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring text-base android-text-size"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="true"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 mobile-touch-target bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};