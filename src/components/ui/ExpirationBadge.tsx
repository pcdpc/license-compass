import React from 'react';
import { ExpirationInfo } from '@/lib/expiration';

interface ExpirationBadgeProps {
  info: ExpirationInfo | null;
  className?: string;
  showExactDate?: boolean;
}

export const ExpirationBadge: React.FC<ExpirationBadgeProps> = ({ info, className = '', showExactDate = true }) => {
  if (!info) return null;

  const { daysRemaining, date, label } = info;
  
  let colorClass = '';
  let text = '';
  
  if (daysRemaining < 0) {
    colorClass = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    text = `Expired ${Math.abs(daysRemaining)} days ago`;
  } else if (daysRemaining < 30) {
    colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.3)]';
    text = `Expires in ${daysRemaining} days`;
  } else if (daysRemaining <= 90) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
    text = `Expires in ${daysRemaining} days`;
  } else {
    colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.3)]';
    text = `Expires in ${daysRemaining} days`;
  }

  const formattedDate = date.toLocaleDateString();

  return (
    <div className={`flex flex-col gap-1 ${className}`} title={`Expiration date: ${formattedDate}`}>
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border w-fit ${colorClass}`}>
        {label}: {text}
      </span>
      {showExactDate && (
        <span className="text-[10px] text-zinc-500 font-medium pl-1">
          {formattedDate}
        </span>
      )}
    </div>
  );
};
