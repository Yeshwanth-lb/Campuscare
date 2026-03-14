import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CellProps
} from 'recharts';

export const ComplaintStatusChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = [
    { name: 'Pending', value: data.pending, color: '#EAB308' },
    { name: 'Assigned', value: data.assigned, color: '#3B82F6' },
    { name: 'In Progress', value: data.inProgress, color: '#A855F7' },
    { name: 'Resolved', value: data.resolved, color: '#22C55E' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LostFoundChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = [
    { name: 'Lost', count: data.lost },
    { name: 'Found', count: data.found },
    { name: 'Returned', count: data.returned },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CombinedStatsChart: React.FC<{ complaintData: any, lostFoundData: any }> = ({ complaintData, lostFoundData }) => {
  const chartData = [
    {
      name: 'Total',
      Complaints: complaintData.total,
      'Lost & Found': lostFoundData.total,
    },
    {
      name: 'Resolved/Returned',
      Complaints: complaintData.resolved,
      'Lost & Found': lostFoundData.returned,
    },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Complaints" fill="#3B82F6" />
          <Bar dataKey="Lost & Found" fill="#A855F7" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
