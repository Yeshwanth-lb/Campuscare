import { useState, useEffect } from 'react';
import api from '../config/api';
import ComplaintCard from '../components/ComplaintCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Filter, UserPlus, X } from 'lucide-react';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes, staffRes] = await Promise.all([
        api.get('/complaints/all'),
        api.get('/auth/staff'),
      ]);
      setComplaints(Array.isArray(complaintsRes?.data?.data) ? complaintsRes.data.data : []);
      setStaff(Array.isArray(staffRes?.data?.data) ? staffRes.data.data : []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setComplaints([]);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (complaint: any) => {
    setSelectedComplaint(complaint);
    setSelectedStaff(complaint.assignedStaff?._id || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/complaints/${selectedComplaint._id}/assign`, {
        staffId: selectedStaff,
      });
      toast.success('Complaint assigned successfully');
      setIsAssignModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (complaint: any) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.delete(`/complaints/${complaint._id}`);
        toast.success('Complaint deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete complaint');
      }
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Administration</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Complaints</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and assign campus issues to appropriate staff</p>
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
              <option value="Pending">Pending</option>
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
            <Filter className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">No complaints found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">
            There are no complaints matching your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredComplaints.map((complaint) => (
            <div key={complaint._id} className="relative group">
              <ComplaintCard
                complaint={complaint}
                showAssignee={true}
                onAction={handleAssign}
                actionLabel={
                  <span className="flex items-center justify-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {complaint.assignedStaff ? 'Reassign' : 'Assign Staff'}
                  </span>
                }
              />
              <button
                onClick={() => handleDelete(complaint)}
                className="absolute -top-2 -right-2 p-2 bg-white text-red-500 rounded-full shadow-lg border border-red-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 z-10"
                title="Delete Complaint"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Complaint to Staff"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Selected Complaint</span>
            <p className="text-sm font-bold text-slate-900">
              {selectedComplaint?.title}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Select Staff Member
            </label>
            <div className="relative">
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="input-field appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
              >
                <option value="">Choose a staff member</option>
                {staff.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {staff.length === 0 && (
            <div className="flex items-start space-x-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <div className="mt-0.5">
                <X className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                No staff members available. Please create staff accounts first from the user management section.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              disabled={submitting}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              className="flex-1 btn-primary py-3"
              disabled={!selectedStaff || submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </span>
              ) : (
                'Assign'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminComplaints;
