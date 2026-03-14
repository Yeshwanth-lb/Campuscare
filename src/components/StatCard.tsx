import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorVariants: any = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    yellow: 'text-amber-600 bg-amber-50',
    red: 'text-rose-600 bg-rose-50',
    purple: 'text-indigo-600 bg-indigo-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="glass-card p-5 hover:border-slate-300 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorVariants[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
