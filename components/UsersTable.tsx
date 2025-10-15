import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../hooks/useToast";
import type { UserProfile } from "../types";
import { Loader2Icon, CheckCircle2Icon, BanIcon, MailIcon } from './icons';

export function UsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await api.get<UserProfile[]>('/api/admin/users');
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error(error instanceof Error ? error.message : "Could not fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user => 
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  const handleToggleSuspend = async (userId: string, currentStatus: 'active' | 'suspended' | undefined) => {
    const suspend = currentStatus !== 'suspended';
    const action = suspend ? "suspend" : "reactivate";
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        await api.post('/api/admin/users/suspend', { userId, suspend });
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === userId ? { ...u, status: suspend ? 'suspended' : 'active' } : u
        ));
        toast.success(`User has been ${action}d.`);
    } catch (error) {
        toast.error(error instanceof Error ? error.message : `Failed to ${action} user.`);
    }
  };
  
  const getPlanBadgeColor = (plan: string) => {
      switch (plan) {
          case 'founder': return 'bg-blue-500/30 text-blue-300';
          case 'enterprise': return 'bg-purple-500/30 text-purple-300';
          default: return 'bg-slate-600/50 text-slate-300';
      }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-900 rounded-lg border border-slate-800">
        <Loader2Icon className="w-8 h-8 text-white animate-spin" />
        <p className="ml-4 text-lg">Loading User Data...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm bg-slate-800 border-slate-700 text-white rounded-md px-4 py-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Plan</th>
              <th scope="col" className="px-6 py-3">Usage (Ideas/Builds)</th>
              <th scope="col" className="px-6 py-3">Joined</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getPlanBadgeColor(user.plan)}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono">{user.usage.ideasGenerated} / {user.usage.buildsStarted}</td>
                <td className="px-6 py-4">{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4">
                  {user.status === 'suspended' ? (
                     <span className="flex items-center gap-2 text-red-400"><BanIcon className="w-4 h-4" /> Suspended</span>
                  ) : (
                     <span className="flex items-center gap-2 text-green-400"><CheckCircle2Icon className="w-4 h-4" /> Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                     <a href={`mailto:${user.email}`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md">
                         <MailIcon className="w-4 h-4"/>
                     </a>
                     <button
                        onClick={() => handleToggleSuspend(user.id, user.status)}
                        className={`p-2 rounded-md ${user.status === 'suspended' ? 'text-green-400 hover:bg-green-500/20' : 'text-red-400 hover:bg-red-500/20'}`}
                        aria-label={user.status === 'suspended' ? 'Reactivate user' : 'Suspend user'}
                     >
                         {user.status === 'suspended' ? <CheckCircle2Icon className="w-4 h-4"/> : <BanIcon className="w-4 h-4"/>}
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-slate-500">No users found.</div>
        )}
      </div>
    </div>
  );
}