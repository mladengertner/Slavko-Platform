import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UsersIcon, DollarSignIcon, SparklesIcon, RocketIcon } from './icons';
import { api } from '../lib/api';
import { UsersTable } from './UsersTable';
import { Tabs, Tab } from './Tabs';
import { CostMonitor } from './CostMonitor';

interface AdminStats {
  totalUsers: number;
  mrr: number;
  ideasGenerated: number;
  buildsCompleted: number;
}

const AdminStatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-sm">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
            <div className="w-10 h-10 text-slate-400">{icon}</div>
        </div>
    </div>
);


const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Users');
  const { user, signOutUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.get<AdminStats>('/api/admin/stats');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
  const tabs = ["Users", "Cost Monitoring", "Revenue", "Activity", "Alerts"];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold text-white">InnovaForge™ Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:block">{user?.email}</span>
            <a href="#/dashboard" className="text-sm text-cyan-400 hover:underline">Exit Admin</a>
            <button onClick={signOutUser} className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading || !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 h-28 bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminStatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<UsersIcon />} />
            <AdminStatCard title="MRR" value={`$${stats.mrr.toLocaleString()}`} icon={<DollarSignIcon />} />
            <AdminStatCard title="Ideas Generated" value={stats.ideasGenerated.toLocaleString()} icon={<SparklesIcon />} />
            <AdminStatCard title="Builds Completed" value={stats.buildsCompleted.toLocaleString()} icon={<RocketIcon />} />
          </div>
        )}
        
        <Tabs>
            {tabs.map(tab => (
                <Tab key={tab} label={tab} isActive={activeTab === tab} onClick={() => setActiveTab(tab)} />
            ))}
        </Tabs>

        <div className="mt-8">
            {activeTab === 'Users' && <UsersTable />}
            {activeTab === 'Cost Monitoring' && <CostMonitor />}
            {activeTab !== 'Users' && activeTab !== 'Cost Monitoring' && (
                <div className="p-12 bg-slate-900 rounded-lg border border-slate-800 text-center text-slate-500">
                    <h3 className="text-lg font-semibold mb-2">{activeTab} view coming soon.</h3>
                    <p>This section is under construction.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
