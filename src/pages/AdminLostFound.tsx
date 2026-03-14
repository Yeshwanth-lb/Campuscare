import { useState, useEffect } from 'react';
import api from '../config/api';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Filter, Trash2 } from 'lucide-react';

const AdminLostFound = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchItems();
  }, [filterType, filterStatus]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      const response = await api.get(`/lostfound?${params.toString()}`);
      setItems(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      toast.error('Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/lostfound/${item._id}`);
        toast.success('Item deleted successfully');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleUpdateStatus = async (item: any, newStatus: string) => {
    if (updatingStatus) return;
    setUpdatingStatus(item._id);
    try {
      await api.put(`/lostfound/${item._id}/status`, { status: newStatus });
      toast.success(`Item marked as ${newStatus}`);
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-5 w-1 bg-blue-600 rounded-full"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administration</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Lost & Found</h1>
          <p className="text-slate-500 mt-1 font-medium">Overview and management of all campus lost and found items</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-slate-400 w-4 h-4" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filters</span>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field min-w-[120px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="all">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field min-w-[120px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="Claimed">Claimed</option>
                <option value="Returned">Returned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card text-center py-20 border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No items found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">
            There are no lost or found items matching your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item._id} className="glass-card p-4 flex flex-col h-full border-slate-200/60 shadow-sm hover:shadow-md transition-all group">
              <div className="flex-1">
                <ItemCard item={item} />
              </div>
              <div className="mt-6 flex space-x-3">
                {item.status === 'Open' && (
                  <button
                    onClick={() => handleUpdateStatus(item, 'Claimed')}
                    disabled={updatingStatus === item._id}
                    className="flex-1 btn-secondary py-2 text-sm"
                  >
                    {updatingStatus === item._id ? 'Updating...' : 'Mark Claimed'}
                  </button>
                )}
                {item.status === 'Claimed' && (
                  <button
                    onClick={() => handleUpdateStatus(item, 'Returned')}
                    disabled={updatingStatus === item._id}
                    className="flex-1 btn-primary py-2 text-sm"
                  >
                    {updatingStatus === item._id ? 'Updating...' : 'Mark Returned'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item)}
                  disabled={updatingStatus === item._id}
                  className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLostFound;
