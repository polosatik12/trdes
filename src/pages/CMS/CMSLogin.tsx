import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cmsAuthAPI } from '@/lib/cmsApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const CMSLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await cmsAuthAPI.login(username, password);
      localStorage.setItem('cms_token', data.token);
      localStorage.setItem('cms_user', JSON.stringify(data.user));
      toast.success('Добро пожаловать в CMS');
      navigate('/cms');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Ошибка входа');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#003051] to-[#004a7c]">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-5">
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-[#003051]">CMS Tour de Russie</h1>
          <p className="text-sm text-gray-500 mt-1">Управление контентом сайта</p>
        </div>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="bg-gray-50"
          />
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-50 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003051] hover:bg-[#004a7c] text-white font-semibold py-6"
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </div>
  );
};

export default CMSLogin;
