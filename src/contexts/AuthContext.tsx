import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, profileAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  patronymic: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | null;
  phone: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  avatar_url: string | null;
  participation_type: string | null;
  team_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  refreshProfile: (userId?: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await profileAPI.getProfile();
      return data.profile as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    const profileData = await fetchProfile();
    if (profileData) {
      setProfile(profileData);
    }
  };

  useEffect(() => {
    authAPI.getCurrentUser()
      .then(({ data }) => {
        setUser({ id: data.user.id, email: data.user.email });
        setProfile(data.user);
      })
      .catch(() => {
        // not authenticated
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await authAPI.login(email, password);
      setUser(data.user);
      const profileData = await fetchProfile();
      setProfile(profileData);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Ошибка входа') };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data } = await authAPI.register(email, password);
      setUser(data.user);
      const profileData = await fetchProfile();
      setProfile(profileData);
      return { error: null, data: { user: data.user } };
    } catch (error: any) {
      return { error: new Error(error.response?.data?.error || 'Ошибка регистрации'), data: null };
    }
  };

  const loginWithToken = async (token: string) => {
    // Exchange token from Yandex OAuth redirect for a cookie session
    await authAPI.refreshToken(token);
    const { data } = await authAPI.getCurrentUser();
    setUser({ id: data.user.id, email: data.user.email });
    const profileData = await fetchProfile();
    setProfile(profileData);
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
