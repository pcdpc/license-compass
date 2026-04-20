import React from 'react';
import { ReadyStatus } from '@/types/schema';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: ReadyStatus | 'avoid_licensing';
  className?: string;
}

const statusConfig: Record<ReadyStatus | 'avoid_licensing', { label: string; bg: string; text: string; border: string; glow: string; icon: React.ReactNode }> = {
  ready: {
    label: 'Ready',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'shadow-[0_0_8px_rgba(52,211,153,0.3)]',
    icon: <CheckCircle className="w-4 h-4 mr-1.5" />,
  },
  almost_ready: {
    label: 'Almost Ready',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: 'shadow-[0_0_8px_rgba(251,191,36,0.3)]',
    icon: <AlertTriangle className="w-4 h-4 mr-1.5" />,
  },
  not_ready: {
    label: 'Not Ready',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    glow: 'shadow-[0_0_8px_rgba(251,113,133,0.3)]',
    icon: <XCircle className="w-4 h-4 mr-1.5" />,
  },
  avoid_licensing: {
    label: 'Avoid Licensing',
    bg: 'bg-rose-600/20',
    text: 'text-rose-500',
    border: 'border-rose-500/30',
    glow: 'shadow-[0_0_10px_rgba(225,29,72,0.4)]',
    icon: <XCircle className="w-4 h-4 mr-1.5" />,
  },
  expired: {
    label: 'Expired',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/20',
    glow: '',
    icon: <Clock className="w-4 h-4 mr-1.5" />,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['not_ready'];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${config.bg} ${config.text} ${config.border} ${config.glow} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

