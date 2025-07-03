// src/app/dashboard/page.tsx
import React from 'react';
import { FaTasks, FaUsers, FaChartLine, FaBell, FaCog, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  // Mock data based on your schema
  const workspaces = [
    { workspace_id: 'ws1', name: 'Product Development', description: 'Main product team workspace' },
    { workspace_id: 'ws2', name: 'Marketing', description: 'Marketing campaigns and activities' },
  ];

  const projects = [
    { project_id: 'p1', name: 'Dashboard Redesign', description: 'Redesigning the user dashboard' },
    { project_id: 'p2', name: 'API Integration', description: 'Integrating third-party APIs' },
  ];

  const tasks = [
    {
      task_id: 't1',
      title: 'Create dashboard layout',
      status: 'In Progress',
      priority: 'High',
      due_date: '2023-12-15',
      progress: 75,
      assigned_to: 'John Doe',
    },
    {
      task_id: 't2',
      title: 'Implement task filtering',
      status: 'To Do',
      priority: 'Medium',
      due_date: '2023-12-20',
      progress: 0,
      assigned_to: 'Jane Smith',
    },
    {
      task_id: 't3',
      title: 'Fix authentication bug',
      status: 'Completed',
      priority: 'Critical',
      due_date: '2023-12-10',
      progress: 100,
      assigned_to: 'Alex Johnson',
    },
  ];

  const notifications = [
    { id: 'n1', message: 'Task assigned to you: Create dashboard layout', time: '2 hours ago' },
    { id: 'n2', message: 'Alex Johnson completed "Fix authentication bug"', time: '1 day ago' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#2c3e50] text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center">
            <FaTasks className="mr-2" /> WorkNest
          </h1>
        </div>
        
        <div className="p-4">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Workspaces</h2>
          <ul>
            {workspaces.map((workspace) => (
              <li key={workspace.workspace_id} className="mb-2">
                <button className="w-full text-left p-2 rounded hover:bg-[#34495e] flex items-center">
                  <span className="truncate">{workspace.name}</span>
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-6">
            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-2">Projects</h2>
            <ul>
              {projects.map((project) => (
                <li key={project.project_id} className="mb-2">
                  <button className="w-full text-left p-2 rounded hover:bg-[#34495e] flex items-center">
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-auto p-4">
          <button className="w-full flex items-center justify-center p-2 rounded bg-[#2c8f9e] hover:bg-[#237a87]">
            <FaCog className="mr-2" /> Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center p-4">
            <div>
              <h1 className="text-xl font-semibold">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, Sarah!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FaBell className="text-gray-600" />
                </button>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#A4EBF3] flex items-center justify-center text-[#2c3e50] font-bold">
                  S
                </div>
                <span className="ml-2 font-medium">Sarah Johnson</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Tasks</p>
                  <p className="text-2xl font-bold mt-1">42</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaTasks size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-[#2c8f9e] rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">75% completed</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold mt-1">8</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaChartLine size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">3 behind schedule</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Team Members</p>
                  <p className="text-2xl font-bold mt-1">12</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaUsers size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">2 available for tasks</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Notifications</p>
                  <p className="text-2xl font-bold mt-1">{notifications.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaBell size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">2 unread</p>
              </div>
            </div>
          </div>

          {/* Task Management Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Task Management</h2>
              <button className="flex items-center bg-[#2c8f9e] text-white py-2 px-4 rounded-lg hover:bg-[#237a87]">
                <FaPlus className="mr-2" /> New Task
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.task_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{task.assigned_to}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                             task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                             'bg-yellow-100 text-yellow-800'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${task.priority === 'Critical' ? 'bg-red-100 text-red-800' : 
                             task.priority === 'High' ? 'bg-orange-100 text-orange-800' : 
                             'bg-gray-100 text-gray-800'}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.due_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full 
                              ${task.progress === 100 ? 'bg-green-600' : 
                                 task.progress > 50 ? 'bg-blue-600' : 
                                 'bg-yellow-500'}`} 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{task.progress}% complete</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#A4EBF3] flex items-center justify-center text-[#2c3e50] font-bold">
                      J
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">Assigned "Dashboard Redesign" to Sarah Johnson</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#CCF2F4] flex items-center justify-center text-[#2c3e50] font-bold">
                      A
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Alex Johnson</p>
                    <p className="text-sm text-gray-500">Completed "Fix authentication bug"</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;