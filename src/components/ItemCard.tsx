import React from 'react';
import { MapPin, Phone, Clock, User, Search } from 'lucide-react';

interface ItemCardProps {
  item: any;
  onAction?: (item: any) => void;
  actionLabel?: React.ReactNode;
  showStatus?: boolean;
  disabled?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onAction, actionLabel, showStatus = true, disabled = false }) => {
  const typeColors: any = {
    lost: 'bg-rose-50 text-rose-700 border-rose-100',
    found: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  const statusColors: any = {
    Open: 'bg-amber-50 text-amber-700 border-amber-100',
    Claimed: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    Returned: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className="glass-card overflow-hidden group hover:shadow-md transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeColors[item.type]}`}>
            {item.type}
          </span>
          {showStatus && (
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[item.status]}`}>
              {item.status}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
        
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <span>{new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
          {item.postedBy && typeof item.postedBy === 'object' && item.postedBy !== null && (
            <div className="flex items-center text-xs text-slate-500">
              <User className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <span className="truncate">{(item.postedBy as any).name}</span>
            </div>
          )}
        </div>

        {onAction && (
          <button
            onClick={() => onAction(item)}
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

export default ItemCard;
