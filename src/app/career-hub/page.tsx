'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Bookmark, Send, Building, Filter, Search, 
  MapPin, Clock, DollarSign, Calendar, ChevronRight, Edit2, Trash2, 
  ExternalLink, MoreVertical, Loader2, ArrowRight, Globe
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserCareers, createCareer, updateCareer, deleteCareer, toDate } from '@/lib/firestore';
import { CareerOpportunity, CareerType } from '@/types/schema';
import { CareerOpportunityModal } from '@/components/career/CareerOpportunityModal';

export default function CareerHubPage() {
  const { user } = useAuth();
  const [careers, setCareers] = useState<CareerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CareerType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<CareerOpportunity | null>(null);

  useEffect(() => {
    if (user) {
      fetchCareers();
    }
  }, [user]);

  const fetchCareers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUserCareers(user.uid);
      setCareers(data);
    } catch (error) {
      console.error('Error fetching careers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCareer = () => {
    setEditingCareer(null);
    setIsModalOpen(true);
  };

  const handleEditCareer = (career: CareerOpportunity) => {
    setEditingCareer(career);
    setIsModalOpen(true);
  };

  const handleDeleteCareer = async (id: string) => {
    if (!user || !confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteCareer(user.uid, id);
      setCareers(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting career:', error);
    }
  };

  const handleModalSubmit = async (data: Partial<CareerOpportunity>) => {
    if (!user) return;
    try {
      if (editingCareer?.id) {
        // Optimistic Update: Update the local list instantly
        const updatedData = { ...editingCareer, ...data, updatedAt: new Date() };
        setCareers(prev => prev.map(c => c.id === editingCareer.id ? updatedData as CareerOpportunity : c));
        
        // Background write
        await updateCareer(user.uid, editingCareer.id, data);
      } else {
        await createCareer(user.uid, data as any);
        await fetchCareers(); // Still fetch for new entries to get the generated ID
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving career:', error);
      // Rollback if needed
      await fetchCareers();
    }
  };

  const filteredCareers = careers.filter(c => {
    const matchesTab = activeTab === 'all' || c.type === activeTab;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.employer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'applied': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'interviewing': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'offer_received': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'rejected': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-white/5 border-white/10';
    }
  };

  const getTypeIcon = (type: CareerType) => {
    switch (type) {
      case 'saved': return <Bookmark className="w-4 h-4" />;
      case 'applied': return <Send className="w-4 h-4" />;
      case 'active': return <Building className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 relative z-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-200 to-zinc-400 tracking-tight text-glow">
            Career Hub
          </h1>
          <p className="text-zinc-400 font-medium mt-2 text-sm md:text-base">Track your job opportunities, applications, and professional employment.</p>
        </div>
        <button
          onClick={handleAddCareer}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 border border-indigo-400/30 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Entry
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Overview', icon: Briefcase },
            { id: 'saved', label: 'Saved', icon: Bookmark },
            { id: 'applied', label: 'Applications', icon: Send },
            { id: 'active', label: 'Current Jobs', icon: Building },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search title or employer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading Career Data...</p>
        </div>
      ) : filteredCareers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCareers.map((career) => (
            <div key={career.id} className="glass-panel rounded-[2rem] p-6 border border-white/5 hover:border-white/20 transition-all duration-500 group relative flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-0 p-8 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors -z-10"></div>
              
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform`}>
                  <div className="text-indigo-400">
                    {getTypeIcon(career.type)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(career.status)} shadow-sm`}>
                    {career.status.replace('_', ' ')}
                  </span>
                  <div className="relative flex-shrink-0">
                     <button 
                      onClick={() => handleEditCareer(career)}
                      className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCareer(career.id!)}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-zinc-100 leading-tight group-hover:text-white transition-colors">
                    {career.title}
                  </h3>
                  <p className="text-zinc-400 font-bold text-sm mt-0.5">{career.employer}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Location/Mode</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 capitalize">
                      {career.workMode === 'remote' || career.state === 'Multi-state' ? <Globe className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {career.state === 'Multi-state' ? 'Multi-state' : (career.state && career.workMode !== 'remote' ? `${career.state} (${career.workMode})` : career.workMode)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Type</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      {career.employmentType}
                    </div>
                  </div>
                  
                  {career.type === 'active' || career.startDate ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Timeline</p>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {career.startDate ? toDate(career.startDate)?.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) : 'Start'}
                        <span className="text-zinc-600 mx-0.5">→</span>
                        <span className={!career.endDate ? 'text-emerald-400' : ''}>
                          {career.endDate ? toDate(career.endDate)?.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) : 'Current'}
                        </span>
                      </div>
                    </div>
                  ) : career.salary ? (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Comp</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        {career.salary}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Updated</p>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {career.updatedAt ? toDate(career.updatedAt)?.toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                {career.jobPostingUrl && (
                  <a 
                    href={career.jobPostingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex lg:inline-flex items-center justify-center lg:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors pt-2 group/link"
                  >
                    View Listing 
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-[3rem] border border-white/10 text-center gap-6">
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-inner">
            <Briefcase className="w-16 h-16 text-zinc-600 opacity-50" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-2xl font-black text-zinc-100 mb-2">Build your career pipeline</h3>
            <p className="text-zinc-500 font-medium leading-relaxed">
              Start tracking your applications and opportunities. All data is securely tied to your practitioner profile.
            </p>
          </div>
          <button
            onClick={handleAddCareer}
            className="flex items-center gap-3 px-8 py-3.5 bg-zinc-100 text-zinc-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white hover:-translate-y-1 transition-all duration-300"
          >
            Create your first entry
          </button>
        </div>
      )}

      <CareerOpportunityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCareer}
      />
    </div>
  );
}
