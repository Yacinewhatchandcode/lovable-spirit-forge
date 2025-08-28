import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Sparkles, Search, Settings, ChevronDown } from 'lucide-react';
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
  const [mode, setMode] = useState<'insights' | 'perspective'>('insights');
  const [usedHiddenWordIds, setUsedHiddenWordIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);


  const ADMIN_PASSWORD = 'spiritguide2024'; // Hardcoded password

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const isNearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100;
        setShowScrollToBottom(!isNearBottom);
      }
    }
  };

  // Check for admin mode on component mount
  useEffect(() => {
    const adminMode = localStorage.getItem('spiritguide-admin-mode');
    if (adminMode === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('spiritguide-admin-mode', 'true');
      setShowAdminDialog(false);
      setAdminPassword('');
    } else {
      alert('Incorrect password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('spiritguide-admin-mode');
  };

  const regenerateConversationForMode = async (newMode: 'insights' | 'perspective') => {
    if (messages.length <= 1 || isRegenerating) return; // Only regenerate if there are actual exchanges

    setIsRegenerating(true);

    try {
      const regeneratedMessages: Message[] = [messages[0]]; // Keep the initial welcome message

      // Process each user message and regenerate AI responses
      for (let i = 1; i < messages.length; i++) {
        const currentMessage = messages[i];

        if (currentMessage.isUser) {
          regeneratedMessages.push(currentMessage); // Keep user messages as-is

          // Find the next AI message after this user message
          const nextAiMessage = messages.slice(i + 1).find(msg => !msg.isUser);
          if (nextAiMessage) {
            // Regenerate the AI response with the new mode
            const userMessageText = currentMessage.text;

            // Build conversation history up to this point
            type ChatRole = 'user' | 'assistant' | 'system';
            type ChatHistoryMessage = { role: ChatRole; content: string };

            const historyPayload: ChatHistoryMessage[] = regeneratedMessages
              .filter(msg => msg.id !== messages[0].id) // Exclude welcome message
              .map(m => ({
                role: m.isUser ? 'user' : 'assistant',
                content: m.text,
              }));

            // Remove old system prompt - let backend handle mode-specific prompts
            const enhancedHistory: ChatHistoryMessage[] = historyPayload;

            // Generate new response with the target mode
            const { data, error } = await supabase.functions.invoke('chat-with-openrouter', {
              body: {
                message: userMessageText,
                history: enhancedHistory,
                mode: newMode,
                isAdmin
              }
            });

            if (!error && data?.response) {
              const newAiMessage: Message = {
                id: nextAiMessage.id, // Keep the same ID to maintain conversation flow
                text: data.response,
                isUser: false,
                timestamp: nextAiMessage.timestamp, // Keep original timestamp
              };
              regeneratedMessages.push(newAiMessage);
            } else {
              // Keep the original message if regeneration fails
              regeneratedMessages.push(nextAiMessage);
            }
          }
        }
      }

      setMessages(regeneratedMessages);
    } catch (error) {
      console.error('Error regenerating conversation:', error);
    } finally {
      setIsRegenerating(false);
    }
  };



  useEffect(() => {
    // Scroll to the top of the latest assistant message for better readability
    const lastAssistant = [...messages].reverse().find(m => !m.isUser);
    if (lastAssistant) {
      const el = document.getElementById(`msg-${lastAssistant.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
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

      // Remove old system prompt - let backend handle mode-specific prompts
      const enhancedHistory: ChatHistoryMessage[] = historyPayload;

      // Call OpenRouter via Supabase Edge Function with history, current mode, and admin status
      const { data, error } = await supabase.functions.invoke('chat-with-openrouter', {
        body: { message: messageText, history: enhancedHistory, mode: mode, isAdmin }
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
    } catch (error) {
      console.error('Error sending message:', error);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I cannot provide a response at this moment. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
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
      {/* Header with Mode Toggle (repurposed existing button) */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 md:p-5 border-b border-border/30 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center cursor-pointer hover:bg-foreground/90 transition-colors"
            onClick={() => setShowAdminDialog(true)}
            title="Click for Admin Mode"
          >
            <Sparkles className="w-4 h-4 text-background" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Quest</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <button
            onClick={() => {
              const newMode = mode === 'insights' ? 'perspective' : 'insights';
              setMode(newMode);
              regenerateConversationForMode(newMode);
            }}
            disabled={isRegenerating}
            className={`text-base md:text-lg px-4 md:px-5 py-2 rounded-full border transition-colors mobile-touch-target ${
              mode === 'perspective'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            } ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRegenerating ? 'Regenerating...' : (mode === 'insights' ? 'Mode: Insights' : 'Mode: Perspective')}
          </button>

          <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`w-8 h-8 ${isAdmin ? 'bg-red-100 border-red-300' : ''}`}
                title={isAdmin ? 'Admin Mode Active' : 'Admin Settings'}
              >
                <Settings className={`w-4 h-4 ${isAdmin ? 'text-red-600' : ''}`} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isAdmin ? 'Admin Mode Active' : 'Admin Access'}
                </DialogTitle>
              </DialogHeader>
              {isAdmin ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You are currently in Admin Mode. Sources will be displayed in Insights mode for debugging and verification.
                  </p>
                  <Button
                    onClick={handleAdminLogout}
                    variant="destructive"
                    className="w-full"
                  >
                    Logout from Admin Mode
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter admin password to access source citations and debugging features.
                  </p>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAdminLogin();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAdminLogin}
                    className="w-full"
                  >
                    Login
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 ios-scroll android-text-size">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-foreground rounded-xl flex items-center justify-center">
                  <Sparkles className="text-background w-6 h-6" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Quest helps you explore life through guidance that emphasizes meaning, purpose, and growth. Switch between Insights and Perspective modes to see different presentations of spiritual wisdom. How can I guide your reflection today?
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div id={`msg-${message.id}`} key={message.id} className="flex gap-3 sm:gap-4">
              {!message.isUser && (
                <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-background" />
                </div>
              )}
              
              <div className={`flex-1 ${message.isUser ? 'ml-12' : ''}`}>
                <div className={`${message.isUser ? 'bg-muted p-4 rounded-lg' : ''}`}>
                  {message.isUser ? (
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  ) : (
                    <div className="prose prose-base dark:prose-invert max-w-none chat-message">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!message.isUser && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(message.text);
                          // Could add a toast notification here
                        }}
                        className="text-xs"
                      >
                        Copy
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {message.isUser && (
                <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  You
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-background" />
              </div>
              
              <div className="flex-1">
                <div className="flex space-x-2 items-center py-3">
                  <span className="text-base mr-2">Thinking...</span>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Floating Scroll to Bottom Button */}
      {showScrollToBottom && (
        <Button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-4 z-50 rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200"
          size="icon"
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      )}

      {/* Input */}
      <div className="sticky bottom-0 z-20 border-t border-border p-4 bg-background mobile-safe-area">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Message Quest..."
              className="w-full min-h-[52px] max-h-[200px] pr-14 py-3 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring text-lg resize-none"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="true"
              rows={1}
              style={{
                fieldSizing: 'content'
              } as any}
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 rounded-lg mobile-touch-target"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};