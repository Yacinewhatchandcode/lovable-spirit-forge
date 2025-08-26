import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Search } from 'lucide-react';
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
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
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

      // Call OpenRouter via Supabase Edge Function with history
      const { data, error } = await supabase.functions.invoke('chat-with-openrouter', {
        body: { message: messageText, history: historyPayload }
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
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        description: "Response received",
      });
    } catch (error) {
      console.error('Error sending message:', error);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I cannot provide a response at this moment. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        description: "Connection error. Please try again.",
        variant: "destructive",
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


  return (
    <div className="flex flex-col h-full">
      {/* Header with Web Search Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Quest</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              webSearchEnabled 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            Web search
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="text-primary w-6 h-6" />
                </div>
                <p className="text-muted-foreground text-base">
                  Quest helps you explore life through guidance that emphasizes meaning, purpose, and growth. How can I guide your reflection today?
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              {!message.isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={`flex-1 ${message.isUser ? 'ml-12' : ''}`}>
                <div className={`${message.isUser ? 'bg-muted/50 p-4 rounded-xl' : ''}`}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap font-sans">
                    {message.text}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {message.isUser && (
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  You
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex space-x-2 items-center py-2">
                  <span className="text-base mr-2 font-sans">Thinking...</span>
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
      <div className="border-t border-border/30 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message Quest..."
              className="w-full h-12 pr-12 rounded-xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring text-base resize-none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="true"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {webSearchEnabled && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Search className="w-3 h-3" />
              Web search enabled - responses will include current information
            </div>
          )}
        </div>
      </div>
    </div>
  );
};