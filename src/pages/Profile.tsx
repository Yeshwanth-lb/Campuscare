import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Lock, FileText } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [lostFoundStats, setLostFoundStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [complaintRes, lostFoundRes] = await Promise.all([
        api.get('/complaints/stats'),
        api.get('/lostfound/stats'),
      ]);
      setComplaintStats(complaintRes.data.data);
      setLostFoundStats(lostFoundRes.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
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
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-5 w-1 bg-blue-600 rounded-full"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage your personal information and account security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="glass-card p-8 border-slate-200/60 shadow-sm text-center">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <User className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg shadow-md border border-slate-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h2>
          <div className="flex items-center justify-center text-slate-500 mt-2 font-medium">
            <Mail className="w-4 h-4 mr-2" />
            <span>{user?.email}</span>
          </div>
          
          <div className="mt-6">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
              user?.role === 'admin'
                ? 'bg-red-50 text-red-600 border border-red-100'
                : user?.role === 'staff'
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-2 glass-card p-8 border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Activity Overview</h3>
            <div className="p-2 bg-slate-50 rounded-lg">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
              <p className="text-3xl font-bold text-slate-900 mb-1">{complaintStats?.total || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Complaints</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors">
              <p className="text-3xl font-bold text-slate-900 mb-1">{complaintStats?.pending || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
              <p className="text-3xl font-bold text-slate-900 mb-1">{complaintStats?.resolved || 0}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resolved</p>
            </div>
            {user?.role !== 'staff' && (
              <>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-colors">
                  <p className="text-3xl font-bold text-slate-900 mb-1">{lostFoundStats?.lost || 0}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lost Items</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-colors">
                  <p className="text-3xl font-bold text-slate-900 mb-1">{lostFoundStats?.found || 0}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Found Items</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <p className="text-3xl font-bold text-slate-900 mb-1">{lostFoundStats?.returned || 0}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Returned</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-8 border-slate-200/60 shadow-sm max-w-2xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Lock className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security Settings</h3>
        </div>
        
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary px-8 py-3"
            >
              {changingPassword ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Security...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
