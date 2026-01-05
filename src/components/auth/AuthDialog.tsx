import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-188c0e85`;

interface AuthDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type AuthView = 'login' | 'signup' | 'forgot_password';

export default function AuthDialog({ trigger, open, onOpenChange }: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [view, setView] = useState<AuthView>('login'); // Manage view state
  const navigate = useNavigate();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

  // Clear error when view changes
  useEffect(() => {
    setError(null);
  }, [view]);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');

  // Error State
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast.success('Successfully signed in!');
      if (setIsOpen) setIsOpen(false);
      window.location.reload(); 
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in');
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign up');
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: signupEmail,
        password: signupPassword,
      });

      if (loginError) throw loginError;

      toast.success('Account created successfully!');
      if (setIsOpen) setIsOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      toast.success('Check your email for the password reset link');
      setView('login');
      setResetEmail('');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to send reset email');
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset view when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setView('login');
      setLoginEmail('');
      setLoginPassword('');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setResetEmail('');
      setError(null);
    }
    if (setIsOpen) setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[480px] w-full p-10 bg-[#0a0a0a] border border-white/10 text-white shadow-2xl transition-all duration-200">
        
        {view === 'forgot_password' ? (
          <div className="space-y-6">
            <div className="space-y-3 flex flex-col items-center text-center">
              <div className="w-full flex justify-start">
                <Button 
                  variant="ghost" 
                  onClick={() => setView('login')} 
                  className="p-0 hover:bg-transparent hover:text-white/80 text-white/50 -ml-2 mb-2 h-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
              <DialogTitle className="text-3xl font-bold tracking-tight">Reset Password</DialogTitle>
              <DialogDescription className="text-white/60 text-base max-w-[90%] leading-relaxed mx-auto">
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="reset-email" className="text-sm font-medium text-white/80 ml-1">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all text-base"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white rounded-xl shadow-lg shadow-[var(--brand-primary)]/20" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Send Reset Link
              </Button>
            </form>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-3 mb-6 flex flex-col items-center text-center sm:text-center">
              <DialogTitle className="text-3xl font-bold tracking-tight">Welcome Back</DialogTitle>
              <DialogDescription className="text-white/60 text-base max-w-[85%] leading-relaxed mx-auto">
                Sign in to sync your watchlist, favorites, and history across devices.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={view} onValueChange={(v) => setView(v as AuthView)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-white/5 rounded-xl mb-8 h-14">
                <TabsTrigger 
                  value="login" 
                  className="h-full rounded-lg data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white text-white/60 font-medium text-base transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="h-full rounded-lg data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white text-white/60 font-medium text-base transition-all"
                >
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-medium text-white/80 ml-1">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all text-base"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="password" className="text-sm font-medium text-white/80">Password</Label>
                      <Button 
                        variant="link" 
                        type="button"
                        onClick={() => setView('forgot_password')}
                        className="p-0 h-auto text-xs font-normal text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80"
                      >
                        Forgot Password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all text-base"
                    />
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white rounded-xl shadow-lg shadow-[var(--brand-primary)]/20 mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="flex flex-col gap-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-white/80 ml-1">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all text-base"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-white/80 ml-1">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all text-base"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-white/80 ml-1">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)] transition-all text-base"
                    />
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white rounded-xl shadow-lg shadow-[var(--brand-primary)]/20 mt-2" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}