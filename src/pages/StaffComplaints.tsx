import { useState, useEffect } from 'react';
import api from '../config/api';
import ComplaintCard from '../components/ComplaintCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Filter, CheckCircle } from 'lucide-react';

const StaffComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/assigned');
      setComplaints(Array.isArray(response?.data?.data) ? response.data.data : []);
    } catch (error) {
      toast.error('Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (complaint: any) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setIsUpdateModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    setSubmitting(true);
    try {
      await api.put(`/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
      });
      toast.success('Status updated successfully');
      setIsUpdateModalOpen(false);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComplaints = filterStatus === 'all'
    ? complaints
    : complaints.filter((c) => c.status === filterStatus);

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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Staff Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assigned Complaints</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and resolve complaints assigned to you</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-slate-400 w-4 h-4" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</span>
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field min-w-[160px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
            >
              <option value="all">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="glass-card text-center py-20 border-dashed border-2 border-slate-200 bg-slate-50/50">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No complaints assigned</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">
            {filterStatus !== 'all'
              ? 'Try changing the filter to see other complaints.'
              : 'Great job! You have no pending tasks assigned to you.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              onAction={handleUpdateClick}
              actionLabel={
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Status
                </span>
              }
            />
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Complaint Status"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Selected Complaint</span>
              <p className="text-sm font-bold text-slate-900">{selectedComplaint?.title}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Current Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                selectedComplaint?.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                selectedComplaint?.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {selectedComplaint?.status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              New Status
            </label>
            <div className="relative">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input-field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setIsUpdateModalOpen(false)}
              disabled={submitting}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={submitting}
              className="flex-1 btn-primary py-3"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffComplaints;
