import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { Code2, TrendingUp, Target, Users, Sparkles, Zap, Shield, Rocket, X, ChevronRight, ChevronLeft, Info } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const { stats, isLoading: statsLoading } = usePlatformStats();

  const tourSteps = [
    {
      title: "Welcome to Codevance!",
      description: "Your intelligent coding companion that tracks your programming journey across multiple platforms with real-time data updates.",
      highlight: "header"
    },
    {
      title: "Smart Problem Tracking",
      description: "Automatically sync and track problems from LeetCode, CodeChef, GeeksforGeeks, and more popular coding platforms.",
      highlight: "features"
    },
    {
      title: "Real-time Analytics",
      description: "Get beautiful visualizations and detailed progress charts that update in real-time as you and other users solve problems.",
      highlight: "stats"
    },
    {
      title: "AI-Powered Insights",
      description: "Receive personalized recommendations and learning paths powered by advanced AI technology.",
      highlight: "cta"
    },
    {
      title: "Important Notice",
      description: "Please note that coding platforms don't provide real-time APIs. We can only sync the total number of problems you've solved on each platform, not individual problem details or real-time progress.",
      highlight: "notice",
      isNotice: true
    }
  ];

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

  const startDemoTour = () => {
    setShowDemoTour(true);
    setCurrentTourStep(0);
  };

  const nextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(currentTourStep + 1);
    }
  };

  const prevTourStep = () => {
    if (currentTourStep > 0) {
      setCurrentTourStep(currentTourStep - 1);
    }
  };

  const closeDemoTour = () => {
    setShowDemoTour(false);
    setCurrentTourStep(0);
  };

  const currentStep = tourSteps[currentTourStep];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg md:text-xl font-medium animate-pulse text-center">Loading your coding journey...</div>
        </div>
      </div>
    );
  }

  if (user && currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <LoginForm onSuccess={handleAuth} onSwitchToSignup={() => setCurrentView('signup')} />
        <Footer />
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <SignupForm onSuccess={handleAuth} onSwitchToLogin={() => setCurrentView('login')} />
        <Footer />
      </div>
    );
  }

  // Format numbers for display - updated to show real numbers better
  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className={`relative bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-500 ${showDemoTour && currentStep.highlight === 'header' ? 'ring-4 ring-purple-400/50 z-50' : ''}`}>
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-3 group">
              <div className="relative">
                <Code2 className="h-8 w-8 md:h-10 md:w-10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Codevance
                </h1>
                <p className="text-xs text-purple-300/70 font-medium tracking-wider hidden sm:block">ELEVATE YOUR CODING</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView('login')}
                className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-transparent hover:border-white/20 backdrop-blur-sm text-sm md:text-base px-3 md:px-4 py-2"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setCurrentView('signup')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 border-0 text-sm md:text-base px-3 md:px-4 py-2"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="text-center mb-16 md:mb-24 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8 animate-pulse">
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            <span className="text-purple-300 text-xs md:text-sm font-medium">Powered by AI Intelligence</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight px-2">
            Master Your
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Coding Journey
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Transform your programming skills with intelligent tracking, real-time analytics, and AI-powered insights across all major coding platforms.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4">
            <Button 
              size="lg"
              onClick={() => setCurrentView('signup')}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105 group bg-size-200 hover:bg-pos-100 w-full sm:w-auto justify-center"
              style={{ backgroundSize: '200% 100%' }}
            >
              <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 group-hover:animate-bounce" />
              Start Your Journey
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={startDemoTour}
              className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40 px-8 md:px-10 py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24 px-4 transition-all duration-500 ${showDemoTour && currentStep.highlight === 'features' ? 'ring-4 ring-purple-400/50 rounded-2xl p-4' : ''}`}>
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
              <CardHeader className="text-center pb-3 md:pb-4">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} p-3 md:p-4 mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg md:text-xl font-semibold group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 md:px-6">
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Stats Section */}
        <div className={`bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 mb-16 md:mb-24 mx-4 animate-fade-in delay-500 transition-all duration-500 ${showDemoTour && currentStep.highlight === 'stats' ? 'ring-4 ring-purple-400/50' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            {[
              { 
                number: statsLoading ? '...' : formatNumber(stats.total_users || 0), 
                label: 'Active Developers', 
                icon: Users,
                actualValue: stats.total_users || 0,
                isRealTime: true
              },
              { 
                number: statsLoading ? '...' : formatNumber(stats.total_problems || 0), 
                label: 'Problems Tracked', 
                icon: Target,
                actualValue: stats.total_problems || 0,
                isRealTime: true
              },
              { 
                number: '99.9%', 
                label: 'Sync Accuracy', 
                icon: Shield,
                actualValue: 99.9,
                isRealTime: false
              }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                  {stat.isRealTime && !statsLoading && (
                    <div className="ml-2 flex items-center">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400 ml-1">LIVE</span>
                    </div>
                  )}
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-slate-300 font-medium text-sm md:text-base">{stat.label}</div>
                {stat.isRealTime && !statsLoading && (
                  <div className="text-xs text-slate-500 mt-1 hidden md:block">
                    Real-time data • Updated {new Date(stats.last_updated).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!statsLoading && (stats.total_users > 0 || stats.total_problems > 0) && (
            <div className="text-center mt-6 md:mt-8 text-xs md:text-sm text-slate-400">
              📊 All statistics update automatically as users interact with the platform
            </div>
          )}
        </div>

        {/* Enhanced CTA Section */}
        <div className={`text-center bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-16 mx-4 animate-fade-in delay-700 transition-all duration-500 ${showDemoTour && currentStep.highlight === 'cta' ? 'ring-4 ring-purple-400/50' : ''}`}>
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
            <span className="text-purple-300 text-xs md:text-sm font-medium">Join the Revolution</span>
          </div>
          
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight px-2">
            Ready to 
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Dominate </span>
            Your Coding Goals?
          </h3>
          
          <p className="text-lg md:text-xl text-slate-300 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Join thousands of developers who are already accelerating their programming journey with our intelligent tracking platform.
          </p>
          
          <Button 
            size="lg"
            onClick={() => setCurrentView('signup')}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl text-lg md:text-xl font-semibold shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-110 group w-full sm:w-auto justify-center"
          >
            <Rocket className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 group-hover:animate-bounce" />
            Launch Your Journey Now
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3 group-hover:animate-pulse" />
          </Button>
          
          <p className="text-xs md:text-sm text-slate-400 mt-4 md:mt-6 px-4">
            ✨ Free forever • No credit card required • Setup in 30 seconds
          </p>
        </div>
      </main>

      {/* Demo Tour Dialog */}
      <Dialog open={showDemoTour} onOpenChange={setShowDemoTour}>
        <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/20 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDemoTour}
              className="absolute -top-2 -right-2 text-white/60 hover:text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
            <DialogTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 pr-8">
              {currentStep.isNotice ? (
                <Info className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              ) : (
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              )}
              {currentStep.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 md:space-y-6">
            <DialogDescription className="text-slate-300 text-base md:text-lg leading-relaxed">
              {currentStep.description}
            </DialogDescription>
            
            {currentStep.isNotice && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-200 text-sm">
                    <p className="font-medium mb-1">API Limitations</p>
                    <p>Due to platform restrictions, we can only track the total number of problems solved on each platform. Individual problem details and real-time progress tracking are not available through official APIs.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentTourStep 
                        ? 'bg-purple-400 w-6 md:w-8' 
                        : index < currentTourStep 
                          ? 'bg-purple-600' 
                          : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="ghost"
                  onClick={prevTourStep}
                  disabled={currentTourStep === 0}
                  className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 text-sm md:text-base px-3 md:px-4 py-2"
                >
                  <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                
                {currentTourStep < tourSteps.length - 1 ? (
                  <Button
                    onClick={nextTourStep}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm md:text-base px-3 md:px-4 py-2"
                  >
                    Next
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={closeDemoTour}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm md:text-base px-3 md:px-4 py-2"
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                    <Rocket className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
