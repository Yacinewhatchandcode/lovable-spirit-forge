import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: 'Sign In Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully.'
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: 'Sign Up Failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link to complete your registration.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-spiritual-bg to-background p-6 bg-classic-texture">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-wisdom-amber/5 rounded-full blur-3xl animate-gentle-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-quest-slate/5 rounded-full blur-3xl animate-gentle-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 bg-spiritual-card/95 backdrop-blur-sm border-spiritual-border shadow-lg">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-wisdom-amber to-quest-slate rounded-full flex items-center justify-center shadow-md">
            <div className="w-8 h-8 bg-primary rounded-full shadow-inner"></div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-cinzel text-quest-slate font-semibold tracking-wide">
              Spiritual Quest
            </CardTitle>
            <CardDescription className="text-base font-cormorant text-quest-slate-light italic">
              Connect with timeless spiritual wisdom
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-lg">
              <TabsTrigger 
                value="signin" 
                className="font-cormorant text-sm data-[state=active]:bg-card data-[state=active]:text-quest-slate data-[state=active]:shadow-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="font-cormorant text-sm data-[state=active]:bg-card data-[state=active]:text-quest-slate data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-0">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-3">
                  <Label 
                    htmlFor="signin-email" 
                    className="text-sm font-cormorant font-medium text-quest-slate"
                  >
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="h-11 font-cormorant text-base bg-card/80 border-spiritual-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label 
                    htmlFor="signin-password" 
                    className="text-sm font-cormorant font-medium text-quest-slate"
                  >
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="h-11 font-cormorant text-base bg-card/80 border-spiritual-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-cormorant text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 mt-6" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-0">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-3">
                  <Label 
                    htmlFor="signup-email" 
                    className="text-sm font-cormorant font-medium text-quest-slate"
                  >
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="h-11 font-cormorant text-base bg-card/80 border-spiritual-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label 
                    htmlFor="signup-password" 
                    className="text-sm font-cormorant font-medium text-quest-slate"
                  >
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 6 characters)"
                    disabled={loading}
                    className="h-11 font-cormorant text-base bg-card/80 border-spiritual-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-cormorant text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 mt-6" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}