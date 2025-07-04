'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/config/supabaseClient';
import { FaTasks, FaUsers, FaChartLine, FaBell, FaCog, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { BsThreeDotsVertical, BsCheckCircleFill } from 'react-icons/bs';

// Modern color palette
const COLORS = {
  primary: '#4F46E5',       // Indigo
  secondary: '#10B981',     // Emerald
  accent: '#F59E0B',        // Amber
  dark: '#1F2937',          // Gray-800
  light: '#F9FAFB',         // Gray-50
  text: '#111827',          // Gray-900
  textLight: '#6B7280',     // Gray-500
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assigned_to: '',
    project_id: ''
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/signin');
        return;
      }

      // Fetch user details with role information
      const { data: userData } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('user_id', user.id)
        .single();

      setUser(userData);

      // Fetch workspaces where user is a member
      const { data: workspacesData } = await supabase
        .from('workspace_members')
        .select('workspace_id, role, workspaces(*)')
        .eq('user_id', user.id);

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
      // Fetch projects in selected workspace
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', selectedWorkspace.workspace_id);

      setProjects(projectsData || []);

      // Fetch tasks in selected workspace with assigned user data
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*, assigned_to:users(name, surname), projects(name)')
        .eq('workspace_id', selectedWorkspace.workspace_id)
        .order('created_at', { ascending: false });

      setTasks(tasksData || []);

      // Fetch team members in this workspace
      const { data: membersData } = await supabase
        .from('workspace_members')
        .select('user_id, role, users(name, surname, email)')
        .eq('workspace_id', selectedWorkspace.workspace_id);

      setTeamMembers(membersData?.map(m => ({
        ...m.users,
        role: m.role,
        user_id: m.user_id
      })) || []);
    };

    fetchWorkspaceData();
  }, [selectedWorkspace]);

  const handleCreateTask = async () => {
    if (!user || !selectedWorkspace) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...newTaskData,
        workspace_id: selectedWorkspace.workspace_id,
        created_by: user.user_id,
        progress: 0,
        assigned_to: newTaskData.assigned_to || null,
        project_id: newTaskData.project_id || null
      }])
      .select();

    if (error) {
      console.error('Error creating task:', error);
      return;
    }

    // Refresh tasks
    const { data: newTasks } = await supabase
      .from('tasks')
      .select('*, assigned_to:users(name, surname), projects(name)')
      .eq('workspace_id', selectedWorkspace.workspace_id)
      .order('created_at', { ascending: false });

    setTasks(newTasks || []);
    setNewTaskModal(false);
    setNewTaskData({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      assigned_to: '',
      project_id: ''
    });
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('task_id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      return;
    }

    // Refresh tasks
    const { data: updatedTasks } = await supabase
      .from('tasks')
      .select('*, assigned_to:users(name, surname), projects(name)')
      .eq('workspace_id', selectedWorkspace.workspace_id)
      .order('created_at', { ascending: false });

    setTasks(updatedTasks || []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assigned_to?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserInitials = (name: string, surname: string) => {
    return `${name?.charAt(0)}${surname?.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold" style={{ color: COLORS.primary }}>WorkNest</h1>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Workspaces</h2>
            <ul>
              {workspaces.map(workspace => (
                <li 
                  key={workspace.workspace_id}
                  className={`mb-1 px-2 py-2 rounded cursor-pointer flex items-center ${
                    selectedWorkspace?.workspace_id === workspace.workspace_id ? 
                    'bg-indigo-50 text-indigo-600' : 
                    'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedWorkspace(workspace)}
                >
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS.secondary }}></div>
                  {workspace.name}
                </li>
              ))}
            </ul>
            {user?.roles?.can_manage_workspace && (
              <button className="mt-2 text-sm text-indigo-600 flex items-center">
                <FaPlus className="mr-1" size={12} /> New Workspace
              </button>
            )}
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Projects</h2>
            <ul>
              {projects.map(project => (
                <li key={project.project_id} className="mb-1 px-2 py-2 rounded hover:bg-gray-100 cursor-pointer flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS.accent }}></div>
                  {project.name}
                </li>
              ))}
            </ul>
            {user?.roles?.can_create_tasks && (
              <button className="mt-2 text-sm text-indigo-600 flex items-center">
                <FaPlus className="mr-1" size={12} /> New Project
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold" style={{ color: COLORS.dark }}>
                {selectedWorkspace?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <FaBell size={18} style={{ color: COLORS.textLight }} />
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
                    {getUserInitials(user?.name, user?.surname)}
                  </div>
                )}
                <span className="ml-2 text-sm font-medium" style={{ color: COLORS.dark }}>
                  {user?.name} {user?.surname}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex border-b border-gray-200 px-6">
            <button
              className={`px-4 py-3 font-medium text-sm flex items-center ${
                activeTab === 'tasks' ? 
                'text-indigo-600 border-b-2 border-indigo-600' : 
                'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              <FaTasks className="inline mr-2" /> Tasks
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm flex items-center ${
                activeTab === 'team' ? 
                'text-indigo-600 border-b-2 border-indigo-600' : 
                'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('team')}
            >
              <FaUsers className="inline mr-2" /> Team
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm flex items-center ${
                activeTab === 'reports' ? 
                'text-indigo-600 border-b-2 border-indigo-600' : 
                'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              <FaChartLine className="inline mr-2" /> Reports
            </button>
            {user?.roles?.can_manage_workspace && (
              <button
                className={`px-4 py-3 font-medium text-sm flex items-center ${
                  activeTab === 'settings' ? 
                  'text-indigo-600 border-b-2 border-indigo-600' : 
                  'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                <FaCog className="inline mr-2" /> Settings
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold" style={{ color: COLORS.dark }}>Tasks</h3>
                {user?.roles?.can_create_tasks && (
                  <div className="flex space-x-3">
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                      <FaFilter className="mr-2" /> Filter
                    </button>
                    <button 
                      className="flex items-center px-4 py-2 rounded-lg text-white hover:bg-indigo-700"
                      style={{ backgroundColor: COLORS.primary }}
                      onClick={() => setNewTaskModal(true)}
                    >
                      <FaPlus className="mr-2" /> New Task
                    </button>
                  </div>
                )}
              </div>
              
              {/* Task Status Columns */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {['To Do', 'In Progress', 'In Review', 'Completed'].map((status) => (
                  <div key={status} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium" style={{ color: COLORS.dark }}>{status}</h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {filteredTasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                    {filteredTasks
                      .filter(t => t.status === status)
                      .map(task => (
                        <div 
                          key={task.task_id} 
                          className="bg-white p-3 rounded-lg mb-3 cursor-move shadow border border-gray-100 hover:border-indigo-200"
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('taskId', task.task_id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedTaskId = e.dataTransfer.getData('taskId');
                            updateTaskStatus(draggedTaskId, status);
                          }}
                        >
                          <div className="flex justify-between">
                            <h5 className="font-medium" style={{ color: COLORS.text }}>{task.title}</h5>
                            <button className="text-gray-400 hover:text-gray-600">
                              <BsThreeDotsVertical />
                            </button>
                          </div>
                          {task.description && (
                            <p className="text-sm mt-1 mb-2" style={{ color: COLORS.textLight }}>
                              {task.description}
                            </p>
                          )}
                          {task.projects?.name && (
                            <p className="text-xs text-indigo-600 mb-2">
                              {task.projects.name}
                            </p>
                          )}
                          <div className="flex justify-between items-center text-xs">
                            <span className="px-2 py-1 rounded" style={{ 
                              backgroundColor: 
                                task.priority === 'Critical' ? '#FEE2E2' : 
                                task.priority === 'High' ? '#FEF3C7' : '#ECFCCB',
                              color: 
                                task.priority === 'Critical' ? '#DC2626' : 
                                task.priority === 'High' ? '#D97706' : '#65A30D'
                            }}>
                              {task.priority}
                            </span>
                            {task.assigned_to && (
                              <div className="flex items-center">
                                <span className="mr-1" style={{ color: COLORS.textLight }}>
                                  {task.assigned_to.name}
                                </span>
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                                  {getUserInitials(task.assigned_to.name, task.assigned_to.surname)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                    {filteredTasks.filter(t => t.status === status).length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No tasks in this status
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div>
              <h3 className="text-xl font-semibold mb-6" style={{ color: COLORS.dark }}>Team Members</h3>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamMembers.map(member => (
                      <tr key={member.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                              {getUserInitials(member.name, member.surname)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name} {member.surname}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h3 className="text-xl font-semibold mb-6" style={{ color: COLORS.dark }}>Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium mb-4">Task Completion</h4>
                  {/* Placeholder for chart */}
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">Completion chart will appear here</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="text-lg font-medium mb-4">Workload Distribution</h4>
                  {/* Placeholder for chart */}
                  <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500">Workload chart will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-xl font-semibold mb-6" style={{ color: COLORS.dark }}>Workspace Settings</h3>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-lg font-medium mb-4">General Settings</h4>
                {/* Settings form would go here */}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Task Modal */}
      {newTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.dark }}>Create New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>Title*</label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>Description</label>
                <textarea
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>Status*</label>
                  <select
                    value={newTaskData.status}
                    onChange={(e) => setNewTaskData({...newTaskData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>Priority*</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({...newTaskData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>Assign To</label>
                  <select
                    value={newTaskData.assigned_to}
                    onChange={(e) => setNewTaskData({...newTaskData, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.name} {member.surname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textLight }}>Project</label>
                  <select
                    value={newTaskData.project_id}
                    onChange={(e) => setNewTaskData({...newTaskData, project_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project.project_id} value={project.project_id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setNewTaskModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskData.title}
                className={`px-4 py-2 rounded-lg text-white ${
                  !newTaskData.title ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}