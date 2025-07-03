'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/config/supabaseClient';
import { FaTasks, FaUsers, FaChartLine, FaBell, FaCog, FaPlus, FaSearch, FaInbox, FaRegCalendarAlt, FaRegFileAlt } from 'react-icons/fa';
import { BsThreeDotsVertical, BsCheckCircleFill, BsChatLeftText } from 'react-icons/bs';

// New color palette for better readability
const COLORS = {
  background: '#f8fafc',      // Light gray background
  sidebar: '#ffffff',         // White sidebar
  textPrimary: '#1e293b',     // Dark blue-gray for text
  textSecondary: '#64748b',   // Medium gray for secondary text
  accent: '#4f46e5',          // Indigo accent color
  highlight: '#e0e7ff',       // Light indigo for highlights
  danger: '#ef4444',          // Red for errors
  success: '#10b981',         // Green for success
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState('tasks');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/signin');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUser(userData);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Sidebar Menu */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>MENU</h1>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
            Welcome {user?.name?.toUpperCase()}, how can I help?
          </p>
        </div>

        <div className="mb-6">
          <button 
            className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100"
            style={{ color: COLORS.textPrimary }}
          >
            <BsChatLeftText className="mr-3" />
            <span>Message Copilot</span>
            <span className="ml-auto">+</span>
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textSecondary }}>
            My Tasks
          </h2>
          <ul className="space-y-1">
            {['To Do', 'Agenda', 'Records'].map((item) => (
              <li key={item}>
                <button 
                  className={`flex items-center w-full p-2 rounded-lg ${activeMenu === item.toLowerCase() ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'}`}
                  onClick={() => setActiveMenu(item.toLowerCase())}
                >
                  {item === 'To Do' && <FaTasks className="mr-3" />}
                  {item === 'Agenda' && <FaRegCalendarAlt className="mr-3" />}
                  {item === 'Records' && <FaRegFileAlt className="mr-3" />}
                  <span>{item}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.textSecondary }}>
            Settings
          </h2>
          <button 
            className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100"
            style={{ color: COLORS.textPrimary }}
          >
            <FaCog className="mr-3" />
            <span>Train</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                {activeMenu === 'tasks' && 'My Tasks'}
                {activeMenu === 'agenda' && 'Agenda'}
                {activeMenu === 'records' && 'Records'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: COLORS.textSecondary }} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  style={{ color: COLORS.textPrimary }}
                />
              </div>
              
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <FaBell style={{ color: COLORS.textSecondary }} />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
              
              <div className="flex items-center">
                {user?.profile_picture ? (
                  <img 
                    src={user.profile_picture} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: COLORS.background }}>
          {activeMenu === 'tasks' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>To Do</h3>
                <div className="space-y-3">
                  {/* Sample tasks */}
                  <div className="p-3 border border-gray-200 rounded-lg hover:border-indigo-200">
                    <div className="flex items-start">
                      <button className="mt-1 mr-3 text-gray-400 hover:text-indigo-500">
                        <BsCheckCircleFill />
                      </button>
                      <div>
                        <h4 className="font-medium" style={{ color: COLORS.textPrimary }}>Complete dashboard redesign</h4>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>Update the color scheme and layout</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-lg hover:border-indigo-200">
                    <div className="flex items-start">
                      <button className="mt-1 mr-3 text-gray-400 hover:text-indigo-500">
                        <BsCheckCircleFill />
                      </button>
                      <div>
                        <h4 className="font-medium" style={{ color: COLORS.textPrimary }}>Implement new menu</h4>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>Create sidebar navigation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'agenda' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>Agenda</h3>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>Your scheduled tasks will appear here</p>
              </div>
            </div>
          )}

          {activeMenu === 'records' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.textPrimary }}>Records</h3>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>Your completed tasks will appear here</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}