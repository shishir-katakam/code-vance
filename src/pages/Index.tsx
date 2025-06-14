
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Code2, TrendingUp, Target, Users, Sparkles, Zap, Shield, Rocket } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-xl font-medium animate-pulse">Loading your coding journey...</div>
        </div>
      </div>
    );
  }

  if (user && currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen flex flex-col animate-fade-in">
        <LoginForm onSuccess={handleAuth} onSwitchToSignup={() => setCurrentView('signup')} />
        <Footer />
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen flex flex-col animate-fade-in">
        <SignupForm onSuccess={handleAuth} onSwitchToLogin={() => setCurrentView('login')} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Code2 className="h-10 w-10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  CodeTracker
                </h1>
                <p className="text-xs text-purple-300/70 font-medium tracking-wider">ELEVATE YOUR CODING</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView('login')}
                className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/20 backdrop-blur-sm"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setCurrentView('signup')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 border-0"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative container mx-auto px-6 py-20">
        <div className="text-center mb-24 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full px-6 py-2 mb-8 animate-pulse">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Powered by AI Intelligence</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Master Your
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Coding Journey
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your programming skills with intelligent tracking, real-time analytics, and AI-powered insights across all major coding platforms.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => setCurrentView('signup')}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105 group bg-size-200 hover:bg-pos-100"
              style={{ backgroundSize: '200% 100%' }}
            >
              <Rocket className="w-5 h-5 mr-3 group-hover:animate-bounce" />
              Start Your Journey
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {[
            {
              icon: Target,
              title: 'Smart Tracking',
              description: 'Automatically sync problems from LeetCode, CodeChef, GeeksforGeeks, and more with lightning-fast background processing.',
              color: 'from-purple-500 to-pink-500',
              delay: 'delay-100'
            },
            {
              icon: TrendingUp,
              title: 'Real-time Analytics',
              description: 'Beautiful visualizations and detailed progress charts that update in real-time as you solve problems.',
              color: 'from-green-500 to-emerald-500',
              delay: 'delay-200'
            },
            {
              icon: Code2,
              title: 'Topic Mastery',
              description: 'Advanced tracking of your expertise across programming languages, algorithms, and data structures.',
              color: 'from-blue-500 to-cyan-500',
              delay: 'delay-300'
            },
            {
              icon: Users,
              title: 'AI Insights',
              description: 'Get personalized recommendations and learning paths powered by advanced Gemini AI technology.',
              color: 'from-pink-500 to-rose-500',
              delay: 'delay-400'
            }
          ].map((feature, index) => (
            <Card key={index} className={`bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 group animate-fade-in ${feature.delay} hover:shadow-2xl hover:shadow-purple-500/10`}>
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl font-semibold group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Stats Section */}
        <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 p-12 mb-24 animate-fade-in delay-500">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { number: '50K+', label: 'Active Developers', icon: Users },
              { number: '2M+', label: 'Problems Tracked', icon: Target },
              { number: '99.9%', label: 'Sync Accuracy', icon: Shield }
            ].map((stat, index) => (
              <div key={index} className="group">
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-white/10 p-16 animate-fade-in delay-700">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Join the Revolution</span>
          </div>
          
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to 
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Dominate </span>
            Your Coding Goals?
          </h3>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of developers who are already accelerating their programming journey with our intelligent tracking platform.
          </p>
          
          <Button 
            size="lg"
            onClick={() => setCurrentView('signup')}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-12 py-6 rounded-2xl text-xl font-semibold shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-110 group"
          >
            <Rocket className="w-6 h-6 mr-3 group-hover:animate-bounce" />
            Launch Your Journey Now
            <Sparkles className="w-6 h-6 ml-3 group-hover:animate-pulse" />
          </Button>
          
          <p className="text-sm text-slate-400 mt-6">
            ✨ Free forever • No credit card required • Setup in 30 seconds
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
