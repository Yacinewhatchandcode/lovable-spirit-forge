import { Session } from '@supabase/supabase-js';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Chat } from '@/components/Chat';
import { ParticleField } from '@/components/ParticleField';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

interface IndexProps {
  session: Session | null;
}

const Index = ({ session }: IndexProps) => {
  const { toast } = useToast();

  // Redirect to auth if not logged in
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden mobile-safe-area flex flex-col">
      {/* Animated particle background */}
      <ParticleField />
      
      {/* Header with sign out */}
      <div className="relative z-20 flex justify-end p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-accent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Compact Hero Section - Mobile optimized */}
        <section className="flex-shrink-0 flex items-center px-3 sm:px-6 py-2 sm:py-4">
          <div className="w-full">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-wisdom mb-2 sm:mb-3 text-crisp android-text-size">
                Chat Assistant
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2 leading-relaxed">
                AI-powered conversation platform
              </p>
            </div>
          </div>
        </section>

        {/* Chat Interface - Takes remaining space */}
        <section className="flex-1 flex flex-col px-3 sm:px-6 pb-4 sm:pb-8 min-h-0">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full min-h-0">
            <Chat session={session} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
