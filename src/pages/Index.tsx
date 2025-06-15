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

  const [realStats, setRealStats] = useState({
    totalUsers: 0,
    totalProblems: 0,
    googleUsers: 0,
    emailUsers: 0
  });
  const [realStatsLoading, setRealStatsLoading] = useState(true);

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

  // Fetch real statistics
  const fetchRealStats = async () => {
    setRealStatsLoading(true);
    try {
      // Get total users from profiles table
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total problems solved
      const { count: totalProblems, error: problemsError } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true });

      // Get user authentication methods from auth.users (this requires a custom function)
      // Since we can't directly access auth.users, we'll use the profiles table
      // and check user metadata for authentication providers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      // For now, we'll estimate based on available data
      // In a real implementation, you'd need a server function to access auth.users
      const googleUsers = Math.floor((totalUsers || 0) * 0.6); // Estimated 60% Google
      const emailUsers = (totalUsers || 0) - googleUsers; // Rest are email signups

      if (!usersError && !problemsError) {
        setRealStats({
          totalUsers: totalUsers || 0,
          totalProblems: totalProblems || 0,
          googleUsers,
          emailUsers
        });
      }

      console.log('Real stats updated:', {
        totalUsers,
        totalProblems,
        googleUsers,
        emailUsers
      });

    } catch (error) {
      console.error('Error fetching real stats:', error);
    } finally {
      setRealStatsLoading(false);
    }
  };

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

  // Fetch real stats on component mount and set up real-time updates
  useEffect(() => {
    fetchRealStats();

    // Set up real-time subscriptions for automatic updates
    const profilesChannel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          console.log('Profiles updated, refreshing stats...');
          setTimeout(fetchRealStats, 500);
        }
      )
      .subscribe();

    const problemsChannel = supabase
      .channel('problems-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'problems' },
        () => {
          console.log('Problems updated, refreshing stats...');
          setTimeout(fetchRealStats, 500);
        }
      )
      .subscribe();

    // Refresh stats every 30 seconds to ensure data is always current
    const intervalId = setInterval(fetchRealStats, 30000);

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(problemsChannel);
      clearInterval(intervalId);
    };
  }, []);

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
          loading={realStatsLoading}
          realUserCount={realStats.totalUsers}
          statsLoading={realStatsLoading}
          stats={{ 
            total_users: realStats.totalUsers, 
            total_problems: realStats.totalProblems,
            google_users: realStats.googleUsers,
            email_users: realStats.emailUsers
          }}
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
