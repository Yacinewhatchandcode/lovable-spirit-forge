import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      // Build short conversation history and inject system rules for formatting/behavior
      type ChatRole = 'user' | 'assistant' | 'system';
      type ChatHistoryMessage = { role: ChatRole; content: string };

      const historyPayload: ChatHistoryMessage[] = messages.slice(-8).map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text,
      }));

      const systemInstructions: ChatHistoryMessage = {
        role: 'system',
        content: `You are a spiritual guide who answers by weaving together passages from the Writings and timeless wisdom from literature. Follow these rules strictly:\n1) Organize the response into clear topics using markdown headings (###).\n2) In each topic, include at least two passages from the Writings. Wrap every word from the Writings in bold markdown. Do not use quotation marks. Do not name or cite sources or authors.\n3) In each topic, add one concise idea from a philosopher or writer. Wrap those words in italic markdown. Do not identify the thinker. Do not use quotation marks.\n4) Do not include citations, footnotes, brackets, or any references.\n5) Do not use the word Bahá’í anywhere in the answer.\n6) Keep language simple, kind, and easy to understand.\n7) If the question cannot be answered from the Writings, respond with: There is no direct statement in the Writings on this matter.\n8) Output only the final formatted answer.`
      };

      const enhancedHistory: ChatHistoryMessage[] = [systemInstructions, ...historyPayload];

      // Call OpenRouter via Supabase Edge Function with history
      const { data, error } = await supabase.functions.invoke('chat-with-openrouter', {
        body: { message: messageText, history: enhancedHistory }
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
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 md:p-5 border-b border-border/30 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Quest</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-muted-foreground hidden sm:block" />
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`text-sm md:text-base px-3 md:px-4 py-1.5 rounded-full border transition-colors mobile-touch-target ${
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
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-3 sm:px-4 py-4 sm:py-6 ios-scroll android-text-size">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="text-primary w-6 h-6" />
                </div>
                <p className="text-muted-foreground text-lg md:text-xl">
                  Quest helps you explore life through guidance that emphasizes meaning, purpose, and growth. How can I guide your reflection today?
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3 sm:gap-4">
              {!message.isUser && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              )}
              
              <div className={`flex-1 ${message.isUser ? 'ml-10 sm:ml-12' : ''}`}>
                <div className={`${message.isUser ? 'bg-muted/50 p-3 sm:p-4 rounded-xl' : ''}`}>
                  {message.isUser ? (
                    <p className="text-lg leading-relaxed whitespace-pre-wrap font-sans">
                      {message.text}
                    </p>
                  ) : (
                    <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 sm:mt-3">
                    <span className="text-[11px] sm:text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {message.isUser && (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
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
                <div className="flex space-x-2 items-center py-3">
                  <span className="text-lg mr-2 font-sans">Thinking...</span>
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
      <div className="sticky bottom-0 z-20 border-t border-border/30 p-3 sm:p-4 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 mobile-safe-area">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message Quest..."
              className="w-full h-14 md:h-16 pr-12 rounded-2xl bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring text-lg md:text-xl resize-none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="true"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 rounded-xl mobile-touch-target"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </div>
          
          {webSearchEnabled && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <Search className="w-4 h-4" />
              Web search enabled - responses will include current information
            </div>
          )}
        </div>
      </div>
    </div>
  );
};