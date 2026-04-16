import React, { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

type AppRole = 'admin' | 'organizer' | 'moderator' | 'participant';
const ALL_ROLES: AppRole[] = ['admin', 'organizer', 'moderator', 'participant'];

interface UserWithRoles {
  id: string;
  first_name: string | null;
  last_name: string | null;
  roles: { id: string; role: AppRole }[];
}

const CRMRoles: React.FC = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingRole, setAddingRole] = useState<{ userId: string; role: AppRole } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: participantsData } = await adminAPI.getAllParticipants();
      const profiles = participantsData.participants || [];

      const usersWithRoles: UserWithRoles[] = await Promise.all(
        profiles.map(async (p: any) => {
          try {
            const { data: rolesData } = await adminAPI.getUserRoles(p.id);
            return {
              id: p.id,
              first_name: p.first_name,
              last_name: p.last_name,
              roles: (rolesData.roles || []).map((r: any) => ({ id: r.id || r.role, role: r.role })),
            };
          } catch (error) {
            return {
              id: p.id,
              first_name: p.first_name,
              last_name: p.last_name,
              roles: [],
            };
          }
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addRole = async (userId: string, role: AppRole) => {
    try {
      await adminAPI.addUserRole(userId, role);
      toast.success(`Роль ${role} добавлена`);
      setAddingRole(null);
      load();
    } catch (error: any) {
      toast.error(error.response?.data?.message?.includes('duplicate') ? 'Роль уже назначена' : 'Ошибка');
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      await adminAPI.removeUserRole(userId, role);
      toast.success('Роль удалена');
      load();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.first_name?.toLowerCase().includes(q) || u.last_name?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Роли пользователей</h2>
          <p className="text-sm text-muted-foreground mt-1">Управление правами доступа</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск по имени..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Пользователь</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Роли</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">Пользователи не найдены</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {u.last_name || ''} {u.first_name || ''}
                      {!u.first_name && !u.last_name && <span className="text-muted-foreground italic">Не заполнено</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map(r => (
                          <Badge key={r.id} variant="secondary" className="gap-1">
                            {r.role}
                            <button onClick={() => removeRole(u.id, r.role)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                          </Badge>
                        ))}
                        {u.roles.length === 0 && <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {addingRole?.userId === u.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={addingRole.role} onValueChange={v => setAddingRole({ userId: u.id, role: v as AppRole })}>
                            <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ALL_ROLES.filter(r => !u.roles.some(ur => ur.role === r)).map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => addRole(u.id, addingRole.role)}>OK</Button>
                          <Button size="sm" variant="ghost" onClick={() => setAddingRole(null)}>✕</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => {
                          const available = ALL_ROLES.filter(r => !u.roles.some(ur => ur.role === r));
                          if (available.length === 0) { toast.info('Все роли уже назначены'); return; }
                          setAddingRole({ userId: u.id, role: available[0] });
                        }}>
                          <Plus className="w-3 h-3 mr-1" />Роль
                        </Button>
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

export default CRMRoles;
