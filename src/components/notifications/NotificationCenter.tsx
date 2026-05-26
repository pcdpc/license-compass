'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Trash2, Calendar, AlertCircle, FileText, CheckCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserNotifications, markNotificationAsRead, clearAllNotifications, toDate } from '@/lib/firestore';
import type { InAppNotification } from '@/types/schema';

export function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchNotifs = async () => {
      try {
        const data = await getUserNotifications(user.uid);
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifs();
    // Poll every 60 seconds for new alerts
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await clearAllNotifications(user.uid);
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    try {
      await markNotificationAsRead(user.uid, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
      >
        <Bell className={`w-5 h-5 transition-colors ${notifications.length > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-400 group-hover:text-zinc-100'}`} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg border-2 border-zinc-900">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0f0f12] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden z-[9999] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Notifications</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Alert Center</p>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                disabled={loading}
                className="text-[10px] font-bold text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors uppercase tracking-wider"
              >
                <CheckCheck className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-white/5 transition-all group relative">
                  <div className="flex gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                      notif.type === 'expiration' ? 'bg-rose-500/10 text-rose-400' :
                      notif.type === 'document' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {notif.type === 'expiration' ? <Calendar className="w-4 h-4" /> :
                       notif.type === 'document' ? <FileText className="w-4 h-4" /> :
                       <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200 leading-snug font-medium pr-6">{notif.message}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 font-bold">
                        {toDate(notif.createdAt)?.toLocaleDateString()} · {toDate(notif.createdAt)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleMarkRead(notif.id!)}
                    className="absolute top-4 right-4 p-1 text-zinc-600 hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/10">
                  <Bell className="w-6 h-6 text-zinc-600" />
                </div>
                <p className="text-sm font-bold text-zinc-100">All caught up!</p>
                <p className="text-xs text-zinc-500 font-medium mt-1">Check back later for new alerts.</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-white/5 border-t border-white/5 text-center">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">End of alerts</p>
            </div>
          )}
          </div>
      )}
    </div>
  );
}
