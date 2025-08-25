import { useState, useEffect } from 'react';

interface SessionUser {
  name: string;
  sessionId: string;
  startTime: number;
}

export const useSessionUser = () => {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedSession = localStorage.getItem('session_user');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSessionUser(parsed);
      } catch (error) {
        localStorage.removeItem('session_user');
      }
    }
    setLoading(false);
  }, []);

  const setUserName = (name: string) => {
    const sessionData: SessionUser = {
      name: name.trim(),
      sessionId: crypto.randomUUID(),
      startTime: Date.now()
    };
    
    localStorage.setItem('session_user', JSON.stringify(sessionData));
    setSessionUser(sessionData);
  };

  const clearSession = () => {
    localStorage.removeItem('session_user');
    setSessionUser(null);
  };

  const getTimeSpent = () => {
    if (!sessionUser) return 0;
    return Math.floor((Date.now() - sessionUser.startTime) / 1000 / 60); // minutes
  };

  return {
    sessionUser,
    loading,
    setUserName,
    clearSession,
    getTimeSpent,
    isLoggedIn: !!sessionUser
  };
};