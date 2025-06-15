
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const useDashboardSession = (onLogout?: () => void) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT' && onLogout) {
            onLogout();
          }
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (!mounted) return;

        if (session?.user) {
          console.log('Found existing session for:', session.user.email);
          setUser(session.user);
        } else {
          console.log('No existing session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [onLogout]);

  return { user, isLoading };
};

export default useDashboardSession;
