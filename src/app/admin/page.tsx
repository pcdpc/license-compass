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
  Search,
  Send,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers, updateUserProfile, toDate, deleteUserFullAccount, getUserLicenses, updateLicense, getAprnRequirementDefaults, setAprnRequirementDefault } from '@/lib/firestore';
import type { UserProfile, AprnRequirementDefault } from '@/types/schema';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

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
  const [importing, setImporting] = useState(false);
  const [currentRequirements, setCurrentRequirements] = useState<AprnRequirementDefault[]>([]);

  // Selection & Email states
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
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

    const fetchRequirements = async () => {
      const data = await getAprnRequirementDefaults();
      setCurrentRequirements(data);
    };

    if (userProfile?.role === 'admin') {
      fetchUsers();
      fetchRequirements();
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

  const handleCleanAllTasks = async () => {
    if (!window.confirm('DANGER: This will remove ALL tasks from ALL licenses for ALL users in the database. Are you absolutely sure?')) return;
    setLoading(true);
    let count = 0;
    try {
      const allUsers = await getAllUsers();
      for (const u of allUsers) {
        const userLicenses = await getUserLicenses(u.id);
        for (const license of userLicenses) {
          if (license.tasks && license.tasks.length > 0) {
            await updateLicense(u.id, license.id!, { tasks: [] });
            count++;
          }
        }
      }
      alert(`Database cleanup complete! Removed tasks from ${count} licenses.`);
    } catch (error) {
      console.error("Error cleaning tasks:", error);
      alert("Failed to clean up tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (email === 'larry.a.montgomery@gmail.com') return;
    const confirmed = window.confirm(`DANGER: Are you sure you want to PERMANENTLY delete the account for ${email}? This will purge all their licenses, documents, and record history. This action cannot be undone.`);
    if (!confirmed) return;
    setProcessingId(userId);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete user');
      }

      setUsers(prev => prev.filter(u => u.id !== userId));
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
      alert(`Successfully deleted ${email} from both Authentication and Firestore.`);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(`Failed to delete user account: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleExtendTrial = async (user: UserProfile & { id: string }) => {
    setProcessingId(user.id);
    try {
      const now = new Date();
      const currentEnd = toDate(user.trialEndDate);
      
      let newTrialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (currentEnd && currentEnd > now) {
        newTrialEnd = new Date(currentEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      
      await updateUserProfile(user.id, { 
        trialEndDate: newTrialEnd as any,
        accountStatus: 'trial'
      });
      
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, trialEndDate: newTrialEnd as any, accountStatus: 'trial' } : u));
      alert(`Trial successfully extended by 7 days for ${user.email}.`);
    } catch (error) {
      console.error("Error extending trial:", error);
      alert("Failed to extend trial.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendExtensionOffer = async (user: UserProfile & { id: string }) => {
    if (!user.email) {
      alert("This user has no email address.");
      return;
    }
    setProcessingId(user.id);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/send-offer-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userEmail: user.email })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send offer email');
      }
      
      const data = await res.json();
      if (data.simulated) {
        alert(`[Simulation Mode] Trial extension offer email logged for ${user.email}.`);
      } else {
        alert(`Trial extension offer email successfully sent to ${user.email}.`);
      }
    } catch (error: any) {
      console.error("Email dispatch failed:", error);
      alert(`Failed to send email: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };


  const handleImportRequirements = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (!Array.isArray(json)) throw new Error("Invalid format: Expected an array of requirements.");
          let count = 0;
          for (const req of json) {
            if (req.stateAbbreviation) {
              await setAprnRequirementDefault(req.stateAbbreviation, req);
              count++;
            }
          }
          const updated = await getAprnRequirementDefaults();
          setCurrentRequirements(updated);
          alert(`Successfully imported ${count} state requirements.`);
        } catch (err: any) {
          alert(`Import failed: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
    } finally {
      setImporting(false);
    }
  };

  // Helper to determine subscription detail and status type
  const getUserBillingState = (u: UserProfile) => {
    const role = u.role;
    if (role === 'admin') {
      return {
        label: 'Admin',
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        type: 'admin'
      };
    }

    const status = u.subscriptionStatus || 'none';
    const accStatus = u.accountStatus || 'none';
    const isSuspended = u.paymentSuspended === true || accStatus === 'suspended' || status === 'past_due';

    if (isSuspended) {
      return {
        label: 'Payment Suspended',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20 border shadow-[0_0_10px_rgba(244,63,94,0.1)]',
        type: 'suspended'
      };
    }

    if (accStatus === 'pending' || u.status === 'pending') {
      return {
        label: 'Pending',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20 border',
        type: 'pending'
      };
    }

    const isActive = status === 'active' || accStatus === 'active';
    const isTrialing = status === 'trialing' || accStatus === 'trial' || accStatus === 'trialing';

    if (isTrialing) {
      const trialStart = toDate(u.trialStartDate) || toDate(u.createdAt) || new Date();
      const trialEnd = toDate(u.trialEndDate);
      const now = new Date();
      
      if (trialEnd) {
        const totalMs = trialEnd.getTime() - trialStart.getTime();
        const totalDays = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24)));
        const elapsedMs = now.getTime() - trialStart.getTime();
        const elapsedDays = Math.max(1, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)));
        const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const dayNumber = Math.min(totalDays, elapsedDays);

        const isExpired = trialEnd < now;
        if (isExpired) {
          return {
            label: 'Expired Trial',
            badgeClass: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 border',
            type: 'expired'
          };
        }

        return {
          label: `Trial — Day ${dayNumber}/${totalDays}`,
          badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 border shadow-[0_0_10px_rgba(99,102,241,0.1)]',
          type: 'trial'
        };
      }
    }

    if (isActive) {
      return {
        label: 'Active Paid',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        type: 'active'
      };
    }

    if (status === 'canceled' || accStatus === 'canceled') {
      return {
        label: 'Canceled',
        badgeClass: 'bg-zinc-500/10 text-zinc-500 border border-white/5',
        type: 'canceled'
      };
    }

    return {
      label: 'No Subscription',
      badgeClass: 'bg-zinc-500/5 text-zinc-600 border border-transparent',
      type: 'none'
    };
  };

  // Perform search and filter
  const filteredUsers = users.filter(u => {
    const queryMatch = 
      u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!queryMatch) return false;

    if (filterType === 'all') return true;
    const billingState = getUserBillingState(u);
    return billingState.type === filterType;
  });

  // Table selection logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleToggleSelect = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Administrative transactional email dispatch
  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert("Please enter both subject and message body.");
      return;
    }

    setSendingEmail(true);
    try {
      const selectedEmails = users
        .filter(u => selectedUserIds.includes(u.id) && u.email)
        .map(u => u.email!);

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userEmails: selectedEmails,
          subject: emailSubject,
          body: emailBody
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send email');
      }

      const data = await res.json();
      if (data.simulated) {
        alert(`[Simulation Mode] Securely logged email to ${selectedEmails.length} recipients. Check terminal stdout!`);
      } else {
        alert(`Successfully sent email to ${selectedEmails.length} recipients.`);
      }

      setEmailModalOpen(false);
      setEmailSubject('');
      setEmailBody('');
      setSelectedUserIds([]);
    } catch (err: any) {
      console.error("Email dispatch failed:", err);
      alert(`Failed to dispatch email: ${err.message}`);
    } finally {
      setSendingEmail(false);
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
          <p className="text-sm text-zinc-400 mt-1 font-medium">Manage user access, subscription statuses, and system operations</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {selectedUserIds.length > 0 && (
            <button
              onClick={() => setEmailModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 border border-indigo-400/30 text-white rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all animate-in fade-in zoom-in-95 duration-200"
            >
              <Mail className="w-3.5 h-3.5" />
              Email Selected ({selectedUserIds.length})
            </button>
          )}
          <button 
            onClick={handleCleanAllTasks}
            className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-all whitespace-nowrap"
          >
            Purge All Tasks
          </button>
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
      </div>

      {/* Subscription Status Filter Pill Row */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { key: 'all', label: 'All Users' },
          { key: 'trial', label: 'Trial Users' },
          { key: 'active', label: 'Active Paid' },
          { key: 'suspended', label: 'Suspended / Payment Required' },
          { key: 'pending', label: 'Pending Verification' },
          { key: 'canceled', label: 'Canceled Subscribers' },
          { key: 'expired', label: 'Expired Trials' }
        ].map(pill => (
          <button
            key={pill.key}
            onClick={() => {
              setFilterType(pill.key);
              setSelectedUserIds([]);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              filterType === pill.key
                ? 'bg-white/10 text-zinc-100 border-white/20 shadow-sm'
                : 'bg-white/5 text-zinc-400 border-white/5 hover:text-zinc-200 hover:border-white/10'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Subscription & Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const billing = getUserBillingState(user);
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <tr key={user.id} className={`hover:bg-white/5 transition-colors group ${isSelected ? 'bg-white/[0.02]' : ''}`}>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(user.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                      />
                    </td>
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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${billing.badgeClass}`}>
                        {billing.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-500 font-medium">{toDate(user.createdAt)?.toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.email === 'larry.a.montgomery@gmail.com' ? (
                          <span className="px-4 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(99,102,241,0.2)] flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" /> Super User (Owner)
                          </span>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleExtendTrial(user)}
                                disabled={processingId === user.id}
                                className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold hover:bg-indigo-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
                              >
                                Extend Trial 7 Days
                              </button>
                              <button 
                                onClick={() => handleSendExtensionOffer(user)}
                                disabled={processingId === user.id}
                                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold hover:bg-blue-500/20 transition-all disabled:opacity-50 whitespace-nowrap flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" /> Send Offer
                              </button>
                            </div>
                            <div className="flex items-center justify-end gap-2">
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
                              onClick={() => handleDeleteUser(user.id, user.email ?? user.id)}
                              disabled={processingId === user.id}
                              className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition-all disabled:opacity-50"
                            >
                              Delete
                            </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500 italic">
                    No users match search query or filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APRN Requirements Management Section */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Global APRN Requirements
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Populate the master list of state CEU and competency rules via JSON</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="file" 
                id="json-import"
                accept=".json"
                onChange={handleImportRequirements}
                className="hidden"
              />
              <label 
                htmlFor="json-import"
                className={`px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition-all cursor-pointer flex items-center gap-2 ${importing ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                Import Requirements JSON
              </label>
            </div>
          </div>
        </div>

        {currentRequirements.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {currentRequirements.map(req => (
              <div key={req.stateAbbreviation} className="p-3 bg-white/5 border border-white/5 rounded-xl text-center group hover:border-indigo-500/30 transition-all">
                <p className="text-sm font-black text-zinc-100">{req.stateAbbreviation}</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase truncate">{req.state}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 border border-dashed border-white/5 rounded-2xl text-center">
            <p className="text-sm text-zinc-500 italic">No requirements imported yet. Upload a JSON file to get started.</p>
          </div>
        )}
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

      {/* Admin Email Modal Tool */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setEmailModalOpen(false);
                setEmailSubject('');
                setEmailBody('');
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <Mail className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Send Administrative Notification</h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">Dispatches a transactional email to selected recipients.</p>
              </div>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Recipients ({selectedUserIds.length})</label>
                <div className="max-h-24 overflow-y-auto bg-white/5 border border-white/5 p-3 rounded-xl space-y-1 scrollbar-thin">
                  {users
                    .filter(u => selectedUserIds.includes(u.id))
                    .map(u => (
                      <div key={u.id} className="text-xs text-zinc-300 font-medium truncate">
                        {u.displayName} &lt;{u.email}&gt;
                      </div>
                    ))
                  }
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="NP Compass Notification: License Expiration Alert"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Message Body</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Dear practitioner, this is an administrative update regarding your CEUs..."
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none font-medium"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setEmailModalOpen(false);
                    setEmailSubject('');
                    setEmailBody('');
                  }}
                  className="px-4 py-2 text-sm font-bold text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 transition-all border border-indigo-400/30"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
