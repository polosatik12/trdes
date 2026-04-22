import React, { useState } from 'react';
import { authAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CRMLogin: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.login(email, password);
      onSuccess();
    } catch (error) {
      toast.error('Неверный email или пароль');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#003051]">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-5">
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-white">Аналитика Tour de Russie</h1>
        </div>
        <div className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-white text-[#003051] hover:bg-white/90 font-semibold">
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </div>
  );
};

export default CRMLogin;
