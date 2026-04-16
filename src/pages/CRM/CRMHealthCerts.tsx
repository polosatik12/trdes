import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type CertStatus = 'active' | 'pending' | 'expired';

interface Cert {
  id: string;
  user_id: string;
  issued_date: string;
  expiry_date: string;
  status: CertStatus;
  document_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

const statusMap: Record<CertStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Активна', variant: 'default' },
  pending: { label: 'На проверке', variant: 'outline' },
  expired: { label: 'Истекла', variant: 'destructive' },
};

const CRMHealthCerts: React.FC = () => {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAllHealthCertificates(
        filter !== 'all' ? filter : undefined
      );
      setCerts(data.certificates || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: CertStatus) => {
    try {
      await adminAPI.updateHealthCertificate(id, { status });
      toast.success(`Статус: ${statusMap[status].label}`);
      load();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Медицинские справки</h2>
          <p className="text-sm text-muted-foreground mt-1">Всего: {certs.length}</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Все статусы" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="pending">На проверке</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="expired">Истекшие</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Участник</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Выдана</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Действует до</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Документ</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {certs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Нет справок</td></tr>
                ) : certs.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {c.profiles?.last_name || ''} {c.profiles?.first_name || ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.issued_date).toLocaleDateString('ru-RU')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.expiry_date).toLocaleDateString('ru-RU')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMap[c.status].variant}>{statusMap[c.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {c.document_url ? (
                        <a href={c.document_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">Скачать</a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(c.id, 'active')}>Одобрить</Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => updateStatus(c.id, 'expired')}>Отклонить</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMHealthCerts;
