import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Search as SearchIcon, Upload, Filter } from 'lucide-react';

const LostFound = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    location: '',
    type: 'lost',
    contactInfo: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [filterType, searchQuery]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/lostfound?${params.toString()}`);
      setItems(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      toast.error('Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setFormData((prev: any) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('contactInfo', formData.contactInfo);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      await api.post('/lostfound', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Item posted successfully!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        type: 'lost',
        contactInfo: '',
        image: null,
      });
      setImagePreview(null);
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (item: any) => {
    if (updatingStatus) return;
    const newStatus = item.status === 'Open' ? 'Claimed' : 'Returned';
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Community</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lost & Found</h1>
          <p className="text-slate-500 mt-1 font-medium">Find lost items or report found ones in campus</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2 px-6"
        >
          <Plus className="w-5 h-5" />
          <span>Post Item</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="glass-card p-6 shadow-sm border-slate-200/60">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative group">
            <SearchIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or location..."
              className="input-field pl-11"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="text-slate-400 w-4 h-4" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter</span>
            </div>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field min-w-[160px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="all">All Items</option>
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card text-center py-20 border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SearchIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No items found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">
            {searchQuery || filterType !== 'all'
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Be the first to post a lost or found item to help the community.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const isOwner = user && item.postedBy && (
              typeof item.postedBy === 'string' 
                ? item.postedBy === user.id 
                : item.postedBy._id === user.id
            );
            const canUpdate = isOwner && item.status !== 'Returned';

            return (
              <ItemCard
                key={item._id}
                item={item}
                onAction={canUpdate ? handleUpdateStatus : undefined}
                disabled={updatingStatus === item._id}
                actionLabel={
                  updatingStatus === item._id 
                    ? 'Updating...' 
                    : item.status === 'Open' ? 'Mark as Claimed' : 'Mark as Returned'
                }
              />
            );
          })}
        </div>
      )}

      {/* Post Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Lost or Found Item"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
              Item Type
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="type"
                    value="lost"
                    checked={formData.type === 'lost'}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-500 peer-checked:border-[6px] transition-all"></div>
                </div>
                <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Lost Item</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="type"
                    value="found"
                    checked={formData.type === 'found'}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-500 peer-checked:border-[6px] transition-all"></div>
                </div>
                <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Found Item</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Blue Backpack, iPhone 14, etc."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field h-24 resize-none"
              placeholder="Describe the item in detail..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Where was it lost/found?"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Contact Information
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="input-field"
                placeholder="Phone number or email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Image (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-200 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group">
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-40 w-auto rounded-lg object-cover shadow-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setImagePreview(null);
                        setFormData((prev: any) => ({ ...prev, image: null }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <Plus className="w-4 h-4 transform rotate-45" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                      <Upload className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="flex text-sm text-slate-600">
                      <label className="relative cursor-pointer rounded-md font-bold text-blue-600 hover:text-blue-700">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary py-3"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post Item'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LostFound;
