'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, Bookmark, Send, Building, MapPin, Globe, Clock, DollarSign, User, Phone, Mail, Link as LinkIcon, FileText, Calendar } from 'lucide-react';
import type { CareerOpportunity, CareerType } from '@/types/schema';

interface CareerOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CareerOpportunity>) => Promise<void>;
  initialData?: CareerOpportunity | null;
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all";
const labelClass = "block text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1";
const selectClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all appearance-none";

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC', 'Multi-state'
];

export function CareerOpportunityModal({ isOpen, onClose, onSubmit, initialData }: CareerOpportunityModalProps) {
  const [formData, setFormData] = useState<Partial<CareerOpportunity>>({
    type: 'saved',
    status: 'saved',
    title: '',
    employer: '',
    workMode: 'onsite',
    employmentType: 'full-time',
    state: '',
    specialty: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Convert Firestore Timestamps to date strings for input fields
        dateFound: initialData.dateFound ? (initialData.dateFound.toDate ? initialData.dateFound.toDate().toISOString().split('T')[0] : initialData.dateFound) : '',
        dateApplied: initialData.dateApplied ? (initialData.dateApplied.toDate ? initialData.dateApplied.toDate().toISOString().split('T')[0] : initialData.dateApplied) : '',
        followUpDate: initialData.followUpDate ? (initialData.followUpDate.toDate ? initialData.followUpDate.toDate().toISOString().split('T')[0] : initialData.followUpDate) : '',
        interviewDate: initialData.interviewDate ? (initialData.interviewDate.toDate ? initialData.interviewDate.toDate().toISOString().split('T')[0] : initialData.interviewDate) : '',
        offerDate: initialData.offerDate ? (initialData.offerDate.toDate ? initialData.offerDate.toDate().toISOString().split('T')[0] : initialData.offerDate) : '',
        startDate: initialData.startDate ? (initialData.startDate.toDate ? initialData.startDate.toDate().toISOString().split('T')[0] : initialData.startDate) : '',
        endDate: initialData.endDate ? (initialData.endDate.toDate ? initialData.endDate.toDate().toISOString().split('T')[0] : initialData.endDate) : '',
        reminderDate: initialData.reminderDate ? (initialData.reminderDate.toDate ? initialData.reminderDate.toDate().toISOString().split('T')[0] : initialData.reminderDate) : '',
      } as any);
    } else {
       setFormData({
        type: 'saved',
        status: 'saved',
        title: '',
        employer: '',
        workMode: 'onsite',
        employmentType: 'full-time',
        state: '',
        specialty: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert date strings back to Dates before submission
      const submissionData = { ...formData };
      const dateFields = ['dateFound', 'dateApplied', 'followUpDate', 'interviewDate', 'offerDate', 'startDate', 'endDate', 'reminderDate'];
      dateFields.forEach(field => {
        const val = submissionData[field as keyof CareerOpportunity];
        if (val && typeof val === 'string' && val.trim() !== '') {
          submissionData[field as keyof CareerOpportunity] = new Date(val) as any;
        } else if (val === '') {
          submissionData[field as keyof CareerOpportunity] = null as any;
        }
      });
      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error saving career opportunity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type: CareerType) => {
    let status = 'saved';
    if (type === 'applied') status = 'applied';
    if (type === 'active') status = 'active';
    setFormData({ ...formData, type, status });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden glass-panel rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]`}>
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-100 tracking-tight text-glow">
                {initialData ? 'Edit Opportunity' : 'New Career Entry'}
              </h2>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">
                Track your clinical career pipeline
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-white/5 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {/* Type Selection */}
          <div className="space-y-4">
            <label className={labelClass}>Entry Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'saved', label: 'Saved', icon: Bookmark, color: 'indigo' },
                { id: 'applied', label: 'Applied', icon: Send, color: 'emerald' },
                { id: 'active', label: 'Active', icon: Building, color: 'amber' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id as CareerType)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                    formData.type === t.id
                      ? `bg-${t.color}-500/10 border-${t.color}-500/30 text-${t.color}-400 shadow-[0_0_15px_rgba(0,0,0,0.1)]`
                      : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClass}
                placeholder="Nurse Practitioner"
              />
            </div>
            <div>
              <label className={labelClass}>Employer / System</label>
              <input
                type="text"
                required
                value={formData.employer}
                onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                className={inputClass}
                placeholder="Medical Center"
              />
            </div>
            <div>
              <label className={labelClass}>Employer Website</label>
              <input
                type="url"
                value={formData.employerWebsite || ''}
                onChange={(e) => setFormData({ ...formData, employerWebsite: e.target.value })}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>Employer Phone</label>
              <input
                type="tel"
                value={formData.employerPhone || ''}
                onChange={(e) => setFormData({ ...formData, employerPhone: e.target.value })}
                className={inputClass}
                placeholder="555-000-0000"
              />
            </div>
            <div>
              <label className={labelClass}>Employer Fax</label>
              <input
                type="tel"
                value={formData.employerFax || ''}
                onChange={(e) => setFormData({ ...formData, employerFax: e.target.value })}
                className={inputClass}
                placeholder="555-000-0001"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Employer Address</label>
              <input
                type="text"
                value={formData.employerAddress || ''}
                onChange={(e) => setFormData({ ...formData, employerAddress: e.target.value })}
                className={inputClass}
                placeholder="123 Medical Way, Suite 100, City, ST 12345"
              />
            </div>
            <div>
              <label className={labelClass}>Specialty</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className={inputClass}
                placeholder="Family / Internal Med"
              />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className={selectClass}
              >
                <option value="">Select State</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                className={selectClass}
              >
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                className={selectClass}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="PRN">PRN</option>
                <option value="locums">Locums</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Current Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={selectClass}
              >
                {formData.type === 'saved' && (
                  <>
                    <option value="saved">Saved</option>
                    <option value="researching">Researching</option>
                    <option value="ready_to_apply">Ready to Apply</option>
                  </>
                )}
                {formData.type === 'applied' && (
                  <>
                    <option value="applied">Applied</option>
                    <option value="follow_up_needed">Follow-up Needed</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer_received">Offer Received</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </>
                )}
                {formData.type === 'active' && (
                  <>
                    <option value="active">Active</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="credentialing">Credentialing</option>
                    <option value="leave">Leave</option>
                    <option value="ended">Ended</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Conditional Detail Fields */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Tracking Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.type === 'saved' && (
                <>
                  <div>
                    <label className={labelClass}>Date Found</label>
                    <input
                      type="date"
                      value={formData.dateFound as any}
                      onChange={(e) => setFormData({ ...formData, dateFound: e.target.value as any })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Posting URL</label>
                    <input
                      type="url"
                      value={formData.jobPostingUrl}
                      onChange={(e) => setFormData({ ...formData, jobPostingUrl: e.target.value })}
                      className={inputClass}
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

              {formData.type === 'applied' && (
                <>
                  <div>
                    <label className={labelClass}>Date Applied</label>
                    <input
                      type="date"
                      value={formData.dateApplied as any}
                      onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value as any })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Follow-up Date</label>
                    <input
                      type="date"
                      value={formData.followUpDate as any}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value as any })}
                      className={inputClass}
                    />
                  </div>
                   <div>
                    <label className={labelClass}>Interview Date</label>
                    <input
                      type="date"
                      value={formData.interviewDate as any}
                      onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value as any })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Offer Date</label>
                    <input
                      type="date"
                      value={formData.offerDate as any}
                      onChange={(e) => setFormData({ ...formData, offerDate: e.target.value as any })}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {formData.type === 'active' && (
                <>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate as any}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value as any })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.endDate as any}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value as any })}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              <div>
                <label className={labelClass}>Salary / Compensation</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className={inputClass + " pl-10"}
                    placeholder="120k + Bonus"
                  />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Recruiter Name</label>
                 <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.recruiterName}
                    onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                    className={inputClass + " pl-10"}
                    placeholder="John Recruiter"
                  />
                </div>
              </div>

               <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Recruiter Email</label>
                  <input
                    type="email"
                    value={formData.recruiterEmail}
                    onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Recruiter Phone</label>
                  <input
                    type="tel"
                    value={formData.recruiterPhone}
                    onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <label className={labelClass}>Additional Notes & Role Details</label>
            <textarea
              rows={4}
              value={formData.notes || formData.currentRoleDetails}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass + " resize-none"}
              placeholder="List job requirements, interview questions, or your current responsibilities..."
            />
          </div>

          {/* Checkbox fields */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={formData.deaRequired || false}
                onChange={(e) => setFormData({ ...formData, deaRequired: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
              />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-300">DEA Required</span>
            </label>
             <label className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={formData.collaboratingPhysicianRequired || false}
                onChange={(e) => setFormData({ ...formData, collaboratingPhysicianRequired: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
              />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-300">CP Required</span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-end gap-3 px-8">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-400 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !formData.title || !formData.employer}
            className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border border-indigo-400/30 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
          >
            {saving ? 'Processing...' : (initialData ? 'Update Opportunity' : 'Create Entry')}
          </button>
        </div>
      </div>
    </div>
  );
}
