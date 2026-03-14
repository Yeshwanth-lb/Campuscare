import React from 'react';
import { Clock, User, Tag, MapPin } from 'lucide-react';

interface ComplaintCardProps {
  complaint: any;
  onAction?: (complaint: any) => void;
  actionLabel?: React.ReactNode;
  showAssignee?: boolean;
  disabled?: boolean;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onAction, actionLabel, showAssignee = false, disabled = false }) => {
  const statusColors: any = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Assigned: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'In Progress': 'bg-purple-50 text-purple-700 border-purple-100',
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className="glass-card overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[complaint.status]}`}>
            {complaint.status}
          </span>
          <div className="flex items-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(complaint.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors">{complaint.title}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">{complaint.description}</p>
        
        {complaint.image && (
          <div className="relative h-40 mb-4 rounded-lg overflow-hidden border border-slate-100">
            <img
              src={complaint.image}
              alt={complaint.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold uppercase tracking-wide">
            <Tag className="w-2.5 h-2.5 mr-1" />
            {complaint.category}
          </span>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-100">
          {showAssignee && complaint.assignedStaff && typeof complaint.assignedStaff === 'object' && complaint.assignedStaff !== null && (
            <div className="flex items-center text-xs text-slate-500">
              <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <span className="truncate">Assigned to: <span className="font-medium text-slate-700">{(complaint.assignedStaff as any).name}</span></span>
            </div>
          )}
          {complaint.userId && typeof complaint.userId === 'object' && complaint.userId !== null && (
            <div className="flex items-center text-xs text-slate-500">
              <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <span className="truncate">By: <span className="font-medium text-slate-700">{(complaint.userId as any).name}</span></span>
            </div>
          )}
        </div>

        {onAction && (
          <button
            onClick={() => onAction(complaint)}
            disabled={disabled}
            className="w-full mt-5 btn-primary text-sm py-2.5 flex items-center justify-center space-x-2"
          >
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
