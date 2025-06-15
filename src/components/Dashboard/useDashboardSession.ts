
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UseDashboardSessionReturn {
  user: any;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

const useDashboardSession = (onLogout?: () => void): UseDashboardSessionReturn => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    } else {
      if (onLogout) onLogout();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [onLogout]);

  return { user, isLoading, checkAuth };
};

export default useDashboardSession;
