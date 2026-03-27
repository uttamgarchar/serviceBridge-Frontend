import { useEffect, useState, useMemo } from "react";
import { adminApi } from "@/api/adminApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface UserItem { _id: string; name: string; email: string; role: string; isAccountVerified: boolean; }

const ROLES = ["All", "User", "ServiceProvider", "VerificationManager", "ProviderManager", "Admin"];
const PER_PAGE = 10;

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await adminApi.getAllUsers(); setUsers(res.data.users || res.data || []); }
    catch { setUsers([]); }
    setLoading(false);
  };

  const handleAssignRole = async (userId: string, role: string) => {
    try { await adminApi.assignRole({ userId, role }); toast({ title: `Role updated to ${role}` }); fetchUsers(); }
    catch { toast({ title: "Failed to assign role", variant: "destructive" }); }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(searchText.toLowerCase()) || u.email.toLowerCase().includes(searchText.toLowerCase());
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchText, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / PER_PAGE);
  const paginatedUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (loading) return <div className="flex justify-center py-16"><Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">User Management</h1>
          <p className="text-xs text-muted-foreground">{filteredUsers.length} users</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} className="text-xs h-8">
          <Icon icon="solar:refresh-bold-duotone" className="h-3.5 w-3.5 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative w-60">
          <Icon icon="solar:magnifer-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." value={searchText} onChange={(e) => { setSearchText(e.target.value); setPage(1); }} className="pl-9 h-8 text-xs" />
        </div>
        <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Filter role" /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No users found</td></tr>
            ) : paginatedUsers.map((u) => (
              <tr key={u._id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-2.5">
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-primary/8 text-primary">{u.role}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${u.isAccountVerified ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"}`}>
                    {u.isAccountVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Select onValueChange={(val) => handleAssignRole(u._id, val)}>
                    <SelectTrigger className="w-32 ml-auto h-7 text-[10px]"><SelectValue placeholder="Change role" /></SelectTrigger>
                    <SelectContent>{ROLES.slice(1).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
          </p>
          <div className="flex items-center gap-0.5">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0">
              <Icon icon="solar:alt-arrow-left-bold" className="h-3 w-3" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)} className="h-7 w-7 p-0 text-[10px]">{p}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0">
              <Icon icon="solar:alt-arrow-right-bold" className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
