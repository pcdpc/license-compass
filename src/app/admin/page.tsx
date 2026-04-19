'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  MoreVertical,
  Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, updateUserProfile, toDate, deleteUserFullAccount } from '@/lib/firestore';
import type { UserProfile } from '@/types/schema';
import { useRouter } from 'next/navigation';

interface UserWithId extends UserProfile {
  id: string;
}

export default function AdminPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Security check - redirect if not admin
    if (userProfile && userProfile.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.role === 'admin') {
      fetchUsers();
    }
  }, [userProfile, router]);

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'pending' | 'denied' | 'suspended') => {
    setProcessingId(userId);
    try {
      await updateUserProfile(userId, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === 'larry.a.montgomery@gmail.com') return;
    
    const confirmed = window.confirm(`DANGER: Are you sure you want to PERMANENTLY delete the account for ${email}? This will purge all their licenses, documents, and record history. This action cannot be undone.`);
    
    if (!confirmed) return;

    setProcessingId(userId);
    try {
      await deleteUserFullAccount(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user account.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="w-3 h-3" /> Active
        </span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
          <Clock className="w-3 h-3" /> Pending
        </span>;
      case 'denied':
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
          <XCircle className="w-3 h-3" /> Denied
        </span>;
      case 'suspended':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
          <ShieldAlert className="w-3 h-3" /> Suspended
        </span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading user database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">Admin Console</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Manage user access, approvals, and system roles</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-zinc-100 truncate">{user.displayName}</p>
                  <p className="text-xs text-zinc-500 font-medium truncate">{user.email}</p>
                </div>
                <div className="flex-shrink-0">
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</p>
                  {getStatusBadge(user.status)}
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Joined</p>
                  <p className="text-xs text-zinc-100 font-medium">{toDate(user.createdAt)?.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 border-t border-white/5">
                {user.email === 'larry.a.montgomery@gmail.com' ? (
                  <span className="w-full text-center px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Super User
                  </span>
                ) : (
                  <>
                    {user.status !== 'active' && (
                      <button 
                        onClick={() => handleStatusUpdate(user.id, 'active')}
                        disabled={processingId === user.id}
                        className="flex-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {user.status !== 'suspended' && (
                      <button 
                        onClick={() => handleStatusUpdate(user.id, 'suspended')}
                        disabled={processingId === user.id}
                        className="flex-1 px-3 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={processingId === user.id}
                      className="flex-1 px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-sm font-medium text-zinc-500">No users found.</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-100">{user.displayName}</p>
                        <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {user.role === 'admin' ? (
                         <ShieldCheck className="w-4 h-4 text-indigo-400" />
                       ) : (
                         <ShieldAlert className="w-4 h-4 text-zinc-600" />
                       )}
                       <span className={`text-[11px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'text-indigo-300' : 'text-zinc-600'}`}>
                         {user.role}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-zinc-500 font-medium">{toDate(user.createdAt)?.toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.email === 'larry.a.montgomery@gmail.com' ? (
                        <span className="px-4 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(99,102,241,0.2)] flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5" /> Super User (Owner)
                        </span>
                      ) : (
                        <>
                          {user.status !== 'active' && (
                            <button 
                              onClick={() => handleStatusUpdate(user.id, 'active')}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {user.status !== 'suspended' && (
                            <button 
                              onClick={() => handleStatusUpdate(user.id, 'suspended')}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            disabled={processingId === user.id}
                            className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Users</p>
          <p className="text-2xl font-black text-white">{users.length}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Pending Approval</p>
          <p className="text-2xl font-black text-amber-400">{users.filter(u => u.status === 'pending').length}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10 text-glow">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">System Health</p>
          <p className="text-2xl font-black text-emerald-400">Optimal</p>
        </div>
      </div>
    </div>
  );
}
