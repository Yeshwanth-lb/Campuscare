import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [lostFoundStats, setLostFoundStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const getRoleSpecificGreeting = () => {
    switch (user?.role) {
      case 'admin': return 'Admin Dashboard';
      case 'staff': return 'Staff Dashboard';
      default: return 'Student Dashboard';
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{getRoleSpecificGreeting()}</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Complaint Statistics */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-5 w-1 bg-blue-600 rounded-full" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Complaint Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tickets"
            value={complaintStats?.total || 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Awaiting Review"
            value={complaintStats?.pending || 0}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Active Tasks"
            value={complaintStats?.inProgress || 0}
            icon={AlertCircle}
            color="purple"
          />
          <StatCard
            title="Resolved"
            value={complaintStats?.resolved || 0}
            icon={CheckCircle}
            color="green"
          />
        </div>
      </section>

      {/* Lost & Found Statistics */}
      {user?.role !== 'staff' && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-5 w-1 bg-emerald-600 rounded-full" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Lost & Found Activity
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Catalog"
              value={lostFoundStats?.total || 0}
              icon={Package}
              color="blue"
            />
            <StatCard
              title="Missing Items"
              value={lostFoundStats?.lost || 0}
              icon={Search}
              color="red"
            />
            <StatCard
              title="Found Items"
              value={lostFoundStats?.found || 0}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Successfully Returned"
              value={lostFoundStats?.returned || 0}
              icon={Package}
              color="purple"
            />
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-5 w-1 bg-slate-900 rounded-full" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {user?.role === 'user' && (
            <>
              <Link
                to="/complaints"
                className="glass-card p-6 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Submit Complaint</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Report a new issue or request maintenance service.</p>
              </Link>
              <Link
                to="/lost-found"
                className="glass-card p-6 hover:border-rose-500 hover:bg-rose-50/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Report Lost Item</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Help us find your missing belongings on campus.</p>
              </Link>
              <Link
                to="/lost-found"
                className="glass-card p-6 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Report Found Item</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Found something? Report it to help its owner.</p>
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin/complaints"
                className="glass-card p-6 hover:border-slate-900 hover:bg-slate-50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Manage Complaints</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Review, assign, and track all campus complaints.</p>
              </Link>
              <Link
                to="/admin/lost-found"
                className="glass-card p-6 hover:border-slate-900 hover:bg-slate-50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Manage Lost & Found</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Oversee the campus lost and found inventory.</p>
              </Link>
              <Link
                to="/analytics"
                className="glass-card p-6 hover:border-slate-900 hover:bg-slate-50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">View Analytics</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Analyze trends and performance metrics.</p>
              </Link>
            </>
          )}
          {user?.role === 'staff' && (
            <Link
              to="/staff/complaints"
              className="glass-card p-6 hover:border-slate-900 hover:bg-slate-50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">View Assigned Tasks</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Access and update the status of your assigned complaints.</p>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
