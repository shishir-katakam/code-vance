
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Code2, TrendingUp, Target, Users } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setCurrentView('dashboard');
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setCurrentView('dashboard');
        } else {
          setUser(null);
          setCurrentView('landing');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = () => {
    // This will be handled by the auth state change listener
  };

  const handleLogout = () => {
    setCurrentView('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (user && currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen flex flex-col">
        <LoginForm onSuccess={handleAuth} onSwitchToSignup={() => setCurrentView('signup')} />
        <Footer />
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen flex flex-col">
        <SignupForm onSuccess={handleAuth} onSwitchToLogin={() => setCurrentView('login')} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">CodeTracker</h1>
          </div>
          <div className="space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView('login')}
              className="text-white hover:bg-white/10"
            >
              Login
            </Button>
            <Button 
              onClick={() => setCurrentView('signup')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-white mb-6 animate-fade-in">
            Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Coding Journey</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Monitor your progress across all coding platforms. Get AI-powered insights on your strengths and areas to improve.
          </p>
          <Button 
            size="lg"
            onClick={() => setCurrentView('signup')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full"
          >
            Start Tracking Now
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="bg-black/40 border-white/10 backdrop-blur-md hover-scale">
            <CardHeader>
              <Target className="h-10 w-10 text-purple-400 mb-2" />
              <CardTitle className="text-white">Problem Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Add problems from LeetCode, CodeChef, GeeksforGeeks, and more.</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md hover-scale">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-green-400 mb-2" />
              <CardTitle className="text-white">Progress Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Visualize your improvement with detailed charts and graphs.</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md hover-scale">
            <CardHeader>
              <Code2 className="h-10 w-10 text-blue-400 mb-2" />
              <CardTitle className="text-white">Topic Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Track your expertise in different topics and programming languages.</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-md hover-scale">
            <CardHeader>
              <Users className="h-10 w-10 text-pink-400 mb-2" />
              <CardTitle className="text-white">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Get personalized recommendations powered by Gemini AI.</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Level Up Your Coding?</h3>
          <p className="text-gray-300 mb-8">Join thousands of developers already tracking their progress.</p>
          <Button 
            size="lg"
            onClick={() => setCurrentView('signup')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full"
          >
            Get Started Free
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
