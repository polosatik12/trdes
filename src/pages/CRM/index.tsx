import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authAPI, adminAPI } from '@/lib/api';
import CRMLayout from './CRMLayout';
import CRMParticipants from './CRMParticipants';
import CRMCorporateApps from './CRMCorporateApps';
import CRMAnalytics from './CRMAnalytics';
import CRMLogin from './CRMLogin';

const CRM: React.FC = () => {
  // DEV BYPASS отключён — требуется авторизация
  const DEV_BYPASS = false;
  const [state, setState] = useState<'loading' | 'login' | 'denied' | 'authorized'>('loading');

  const checkAccess = async () => {
    if (DEV_BYPASS) { setState('authorized'); return; }
    setState('loading');
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setState('login');
      return;
    }

    try {
      const { data: userData } = await authAPI.getCurrentUser();
      const { data: rolesData } = await adminAPI.getUserRoles(userData.user.id);
      const roles = rolesData.roles || [];
      const hasAccess = roles.some((r: any) => r.role === 'admin' || r.role === 'organizer');
      setState(hasAccess ? 'authorized' : 'denied');
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setState('login');
    }
  };

  useEffect(() => {
    checkAccess();
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#003051]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  if (state === 'login') {
    return <CRMLogin onSuccess={checkAccess} />;
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#003051] text-white">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Доступ запрещён</h1>
          <p className="text-white/60">У вашего аккаунта нет прав для доступа к CRM</p>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              checkAccess();
            }}
            className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
          >
            Войти другим аккаунтом
          </button>
        </div>
      </div>
    );
  }

  return (
    <CRMLayout>
      <Routes>
        <Route index element={<Navigate to="analytics" replace />} />
        <Route path="analytics"     element={<CRMAnalytics />} />
        <Route path="participants"  element={<CRMParticipants />} />
        <Route path="registrations" element={<CRMParticipants />} />
        <Route path="corporate"     element={<CRMCorporateApps />} />
      </Routes>
    </CRMLayout>
  );
};

export default CRM;
