import { useState, useEffect } from 'react';
import api from '../config/api';
import { ComplaintStatusChart, LostFoundChart, CombinedStatsChart } from '../components/Charts';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { FileText, Search, CheckCircle, Clock } from 'lucide-react';

const Analytics = () => {
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

  return (
    <div className="space-y-10 pb-12">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-5 w-1 bg-blue-600 rounded-full"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Insights</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Detailed overview of campus operational statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={complaintStats?.total || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Resolution Rate"
          value={`${complaintStats?.total ? Math.round((complaintStats.resolved / complaintStats.total) * 100) : 0}%`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Lost Items"
          value={lostFoundStats?.lost || 0}
          icon={Search}
          color="red"
        />
        <StatCard
          title="Items Returned"
          value={lostFoundStats?.returned || 0}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-slate-200/60 shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Complaint Status
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {complaintStats && <ComplaintStatusChart data={complaintStats} />}
          </div>
        </div>
        
        <div className="glass-card p-8 border-slate-200/60 shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Search className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Lost & Found Overview
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {lostFoundStats && <LostFoundChart data={lostFoundStats} />}
          </div>
        </div>
      </div>

      {/* Combined Chart */}
      <div className="glass-card p-8 border-slate-200/60 shadow-sm">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Overall Statistics Comparison
          </h2>
        </div>
        <div className="h-[400px] w-full">
          {complaintStats && lostFoundStats && (
            <CombinedStatsChart
              complaintData={complaintStats}
              lostFoundData={lostFoundStats}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
