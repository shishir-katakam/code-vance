import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import LoginForm from '@/components/LoginForm';
import SignupForm from '@/components/SignupForm';
import Dashboard from '@/components/Dashboard';
import { Code2 } from 'lucide-react';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import StatsSection from '@/components/landing/StatsSection';
import CtaSection from '@/components/landing/CtaSection';
import DemoTourDialog from '@/components/landing/DemoTourDialog';

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const { stats, isLoading: statsLoading } = usePlatformStats();

  const [realUserCount, setRealUserCount] = useState<number | null>(null);
  const [realUserCountLoading, setRealUserCountLoading] = useState(true);
  const [realProblemCount, setRealProblemCount] = useState<number | null>(null);

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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setCurrentView('dashboard');
      }
      setIsLoading(false);
    };

    checkAuth();

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

  useEffect(() => {
    const fetchUserCount = async () => {
      setRealUserCountLoading(true);
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (!error && typeof count === 'number') {
        setRealUserCount(count);
      } else {
        setRealUserCount(stats.total_users || 0); // Fallback
      }
      setRealUserCountLoading(false);
    };

    const fetchProblemCount = async () => {
      // Direct count from problems table for immediate accuracy
      const { count, error } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true });
      if (!error && typeof count === 'number') {
        setRealProblemCount(count);
      } else if (typeof stats.total_problems === 'number') {
        setRealProblemCount(stats.total_problems); // Fallback
      }
    };

    fetchUserCount();
    fetchProblemCount();

    // Subscribe to realtime inserts on profiles (user sign-ups)
    const profilesChannel = supabase
      .channel('profile-signups')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          // Delay a moment to allow transaction
          setTimeout(() => fetchUserCount(), 550);
        }
      )
      .subscribe();

    // Subscribe to realtime problem changes
    const problemsChannel = supabase
      .channel('problem-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'problems' },
        (payload) => {
          setTimeout(() => fetchProblemCount(), 550);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(problemsChannel);
    };
    // stats.total_users and stats.total_problems as fallback on change
  }, [stats.total_users, stats.total_problems]);

  // Still call fetchUserCount on fallback stat change
  useEffect(() => {
    if (typeof stats.total_users === 'number') {
      setRealUserCount(stats.total_users);
    }
    if (typeof stats.total_problems === 'number') {
      setRealProblemCount(stats.total_problems);
    }
  }, [stats.total_users, stats.total_problems]);

  const handleAuth = () => {};
  const handleLogout = () => setCurrentView('landing');
  const startDemoTour = () => {
    setShowDemoTour(true);
    setCurrentTourStep(0);
  };
  const nextTourStep = () => {
    if (currentTourStep < tourSteps.length - 1) setCurrentTourStep(currentTourStep + 1);
  };
  const prevTourStep = () => {
    if (currentTourStep > 0) setCurrentTourStep(currentTourStep - 1);
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
    return <Dashboard onLogout={() => setCurrentView('landing')} />;
  }
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <LoginForm onSuccess={() => {}} onSwitchToSignup={() => setCurrentView('signup')} />
        <Footer />
      </div>
    );
  }
  if (currentView === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <SignupForm onSuccess={() => {}} onSwitchToLogin={() => setCurrentView('login')} />
        <Footer />
      </div>
    );
  }

  // Main Landing Page with real-time stats
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      {/* Header */}
      <header className={`relative bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-500 ${showDemoTour && tourSteps[currentTourStep].highlight === 'header' ? 'ring-4 ring-purple-400/50 z-50' : ''}`}>
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
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 md:px-6 py-12 md:py-20">
        <HeroSection
          onStart={() => setCurrentView('signup')}
          onDemo={() => {
            setShowDemoTour(true);
            setCurrentTourStep(0);
          }}
        />
        <FeaturesGrid
          highlight={showDemoTour && tourSteps[currentTourStep].highlight === "features"}
        />
        <StatsSection
          loading={realUserCountLoading}
          realUserCount={realUserCount}
          statsLoading={statsLoading}
          stats={{ ...stats, total_problems: realProblemCount ?? stats.total_problems }}
        />
        <CtaSection
          onStart={() => setCurrentView('signup')}
          highlight={showDemoTour && tourSteps[currentTourStep].highlight === "cta"}
        />
      </main>
      <DemoTourDialog
        open={showDemoTour}
        onOpenChange={setShowDemoTour}
        currentStep={tourSteps[currentTourStep]}
        tourSteps={tourSteps}
        currentTourStep={currentTourStep}
        nextTourStep={() => { if (currentTourStep < tourSteps.length - 1) setCurrentTourStep(currentTourStep + 1); }}
        prevTourStep={() => { if (currentTourStep > 0) setCurrentTourStep(currentTourStep - 1); }}
        closeDemoTour={() => { setShowDemoTour(false); setCurrentTourStep(0); }}
      />
      <Footer />
    </div>
  );
};

export default Index;
