import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';
import logoHeader from '@/assets/logo-header.svg';

const Auth: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNew />
      
      <main className="flex-1 flex justify-center pt-20 pb-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="hidden md:flex justify-center mb-4">
              <img src={logoHeader} alt="Tour de Russie" className="h-10" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {activeTab === 'login' ? 'Вход в личный кабинет' : 'Регистрация'}
            </CardTitle>
            {activeTab === 'register' && (
              <CardDescription>
                Создайте аккаунт для участия в мероприятиях
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      <FooterNew />
    </div>
  );
};

export default Auth;
