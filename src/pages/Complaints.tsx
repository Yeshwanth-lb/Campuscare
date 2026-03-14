import React, { useState, useEffect } from 'react';
import api from '../config/api';
import ComplaintCard from '../components/ComplaintCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Upload } from 'lucide-react';

const Complaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    category: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    'Infrastructure',
    'Cleanliness',
    'Electrical',
    'Plumbing',
    'Internet',
    'Hostel',
    'Canteen',
    'Library',
    'Sports',
    'Other',
  ];

  useEffect(() => {
    fetchComplaints();
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/my');
      setComplaints(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      toast.error('Failed to fetch complaints');
      setComplaints([]);
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
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      await api.post('/complaints', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Complaint submitted successfully!');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: '', image: null });
      setImagePreview(null);
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Complaints</h1>
          <p className="text-slate-500 mt-1 font-medium">Track and manage your campus issues</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2 px-6"
        >
          <Plus className="w-5 h-5" />
          <span>New Complaint</span>
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="glass-card text-center py-20 border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No complaints yet</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">
            Need help with something? Submit your first complaint to get started.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-8 text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center justify-center mx-auto space-x-1"
          >
            <span>Submit a complaint</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              showAssignee={true}
            />
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit New Complaint"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Brief title of your complaint"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Category
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field h-32 resize-none"
              placeholder="Describe your complaint in detail..."
              required
            />
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
                  Submitting...
                </span>
              ) : (
                'Submit Complaint'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Complaints;
