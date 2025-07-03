'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/config/supabaseClient';
import { FaTasks, FaUsers, FaChartLine, FaBell, FaCog, FaPlus, FaSearch } from 'react-icons/fa';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }

      // Fetch user details
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUser(userData);

      // Fetch workspaces
      const { data: workspacesData } = await supabase
        .from('workspace_members')
        .select('workspace_id, role, workspaces(*)')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (workspacesData && workspacesData.length > 0) {
        const formattedWorkspaces = workspacesData.map(w => w.workspaces);
        setWorkspaces(formattedWorkspaces);
        setSelectedWorkspace(formattedWorkspaces[0]);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!selectedWorkspace) return;

    const fetchWorkspaceData = async () => {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', selectedWorkspace.workspace_id);

      setProjects(projectsData || []);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('workspace_id', selectedWorkspace.workspace_id)
        .order('created_at', { ascending: false });

      setTasks(tasksData || []);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.user_id)
        .order('created_at', { ascending: false })
        .limit(5);

      setNotifications(notificationsData || []);
    };

    fetchWorkspaceData();
  }, [selectedWorkspace]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">TeamFlow</h1>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Workspaces</h2>
            <ul>
              {workspaces.map(workspace => (
                <li 
                  key={workspace.workspace_id}
                  className={`mb-1 px-2 py-1 rounded cursor-pointer ${selectedWorkspace?.workspace_id === workspace.workspace_id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedWorkspace(workspace)}
                >
                  {workspace.name}
                </li>
              ))}
            </ul>
            <button className="mt-2 text-sm text-blue-600 flex items-center">
              <FaPlus className="mr-1" size={12} /> New Workspace
            </button>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Projects</h2>
            <ul>
              {projects.map(project => (
                <li key={project.project_id} className="mb-1 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                  {project.name}
                </li>
              ))}
            </ul>
            <button className="mt-2 text-sm text-blue-600 flex items-center">
              <FaPlus className="mr-1" size={12} /> New Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">{selectedWorkspace?.name || 'Dashboard'}</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <FaBell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
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
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex border-b border-gray-200 px-6">
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('tasks')}
            >
              <FaTasks className="inline mr-2" /> Tasks
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'team' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('team')}
            >
              <FaUsers className="inline mr-2" /> Team
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('reports')}
            >
              <FaChartLine className="inline mr-2" /> Reports
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('settings')}
            >
              <FaCog className="inline mr-2" /> Settings
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Tasks</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                  <FaPlus className="mr-2" /> New Task
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-medium mb-2">To Do</h4>
                  {tasks.filter(t => t.status === 'To Do').map(task => (
                    <div key={task.task_id} className="bg-gray-50 p-3 rounded mb-2 cursor-pointer hover:bg-gray-100">
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-gray-600 truncate">{task.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-medium mb-2">In Progress</h4>
                  {tasks.filter(t => t.status === 'In Progress').map(task => (
                    <div key={task.task_id} className="bg-gray-50 p-3 rounded mb-2 cursor-pointer hover:bg-gray-100">
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-gray-600 truncate">{task.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-medium mb-2">In Review</h4>
                  {tasks.filter(t => t.status === 'In Review').map(task => (
                    <div key={task.task_id} className="bg-gray-50 p-3 rounded mb-2 cursor-pointer hover:bg-gray-100">
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-gray-600 truncate">{task.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-medium mb-2">Completed</h4>
                  {tasks.filter(t => t.status === 'Completed').map(task => (
                    <div key={task.task_id} className="bg-gray-50 p-3 rounded mb-2 cursor-pointer hover:bg-gray-100">
                      <h5 className="font-medium">{task.title}</h5>
                      <p className="text-sm text-gray-600 truncate">{task.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Team Members</h3>
              {/* Team members content would go here */}
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Reports</h3>
              {/* Reports content would go here */}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">Workspace Settings</h3>
              {/* Settings content would go here */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}