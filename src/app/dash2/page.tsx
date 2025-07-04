"use client";

import React, { useEffect, useState } from "react";
import {
  FaTasks,
  FaUsers,
  FaChartLine,
  FaBell,
  FaCog,
  FaPlus,
} from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (replace with your own env variables or config)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Workspace = {
  workspace_id: string;
  name: string;
  description: string;
  // can_manage_workspace is managed by role/permissions but not fetched here specifically
};

type Project = {
  project_id: string;
  name: string;
  description: string;
  workspace_id: string;
};

type User = {
  user_id: string;
  name: string;
  surname: string | null;
  email: string;
  profile_picture: string | null;
  role_name: string;
  role_permissions: {
    can_create_tasks: boolean;
    // you may add other permissions if needed
  };
};

type Task = {
  task_id: string;
  workspace_id: string;
  project_id: string;
  created_by: string;
  assigned_to: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimated_time_minutes?: number;
  start_date?: string;
  due_date?: string;
  progress?: number;
};

type Notification = {
  notification_id: string;
  message: string;
  time: string;
};

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  // For Create Task modal/form state:
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    workspace_id: "",
    project_id: "",
    assigned_to: "",
    due_date: "",
    priority: "Medium",
    status: "To Do",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch current user with role & permissions info
  const fetchCurrentUser = async () => {
  const {
    data: { user },
    error: errUser,
  } = await supabase.auth.getUser();

  if (errUser || !user) {
    console.error("No logged in user or error", errUser);
    setCurrentUser(null);
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .select(
      `user_id, name, surname, email, profile_picture, role:roles (role_name, can_create_tasks, can_edit_tasks, can_delete_tasks)`
    )
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Failed to load current user info", error);
    setCurrentUser(null);
    return;
  }
  if (!data) {
    setCurrentUser(null);
    return;
  }

  // Guard role possibly null:
  if (!data.role) {
    console.warn("User has no role assigned!");
    setCurrentUser({
      user_id: data.user_id,
      name: data.name,
      surname: data.surname,
      email: data.email,
      profile_picture: data.profile_picture,
      role_name: "No Role",
      role_permissions: {
        can_create_tasks: false,
        can_edit_tasks: false,
        can_delete_tasks: false,
      },
    });
    return;
  }

  setCurrentUser({
    user_id: data.user_id,
    name: data.name,
    surname: data.surname,
    email: data.email,
    profile_picture: data.profile_picture,
    role_name: data.role.role_name,
    role_permissions: {
      can_create_tasks: data.role.can_create_tasks,
      can_edit_tasks: data.role.can_edit_tasks,
      can_delete_tasks: data.role.can_delete_tasks,
    },
  });
};

  const fetchWorkspaces = async () => {
    const { data, error } = await supabase.from("workspaces").select("*");
    if (error) console.error("Error fetching workspaces:", error);
    else setWorkspaces(data ?? []);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*");
    if (error) console.error("Error fetching projects:", error);
    else setProjects(data ?? []);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) console.error("Error fetching tasks:", error);
    else setTasks(data ?? []);
  };

  const fetchNotifications = async () => {
    // Simplified notifications fetch for current user if logged in
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.user_id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } else {
      const now = new Date();
      const mapped = (data ?? []).map((n: any) => {
        const createdAt = new Date(n.created_at);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        let time = "";
        if (diffDays > 0)
          time = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        else if (diffHours > 0) time = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        else time = "Just now";
        return { notification_id: n.notification_id, message: n.message, time };
      });
      setNotifications(mapped);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, name, surname, email");
    if (error) console.error("Error fetching users:", error);
    else setUsers(data ?? []);
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await fetchCurrentUser();
      await fetchWorkspaces();
      await fetchProjects();
      await fetchTasks();
      await fetchUsers();
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (currentUser) fetchNotifications();
  }, [currentUser]);

  // Handle form input changes
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Handle task creation submit
  async function handleCreateTask() {
    setCreateError(null);

    if (!currentUser) {
      setCreateError("No logged-in user.");
      return;
    }

    if (!formData.title.trim()) {
      setCreateError("Title is required.");
      return;
    }

    // Validate workspace & project
    if (!formData.workspace_id) {
      setCreateError("Please select a workspace.");
      return;
    }
    if (!formData.project_id) {
      setCreateError("Please select a project.");
      return;
    }

    // Optional: assigned_to can be empty (unassigned)
    setCreating(true);

    const { error } = await supabase.from("tasks").insert({
      title: formData.title,
      description: formData.description,
      workspace_id: formData.workspace_id,
      project_id: formData.project_id,
      created_by: currentUser.user_id,
      assigned_to: formData.assigned_to || null,
      status: formData.status || "To Do",
      priority: formData.priority || "Medium",
      due_date: formData.due_date ? new Date(formData.due_date) : null,
      progress: 0,
      created_at: new Date(),
    });

    setCreating(false);

    if (error) {
      console.error("Failed to create task:", error);
      setCreateError("Failed to create task. Please try again.");
      return;
    }

    // Success: refresh tasks & reset form
    await fetchTasks();
    setFormData({
      title: "",
      description: "",
      workspace_id: "",
      project_id: "",
      assigned_to: "",
      due_date: "",
      priority: "Medium",
      status: "To Do",
    });
    setShowCreateTask(false);
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading dashboard...
      </div>
    );

  const totalTasks = tasks.length;
  const activeProjects = projects.length;
  const teamMembers = users.length;
  const unreadNotifications = notifications.length;

  // For user display name & avatar initials
  const userFullName =
    currentUser === null
      ? ""
      : `${currentUser.name} ${currentUser.surname ?? ""}`.trim();

  const userInitials = userFullName
    ? userFullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

  // Get projects filtered by selected workspace for create task form
  const filteredProjects = projects.filter(
    (p) => p.workspace_id === formData.workspace_id
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#2c3e50] text-white flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center">
            <FaTasks className="mr-2" /> WorkNest
          </h1>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-2">
            Workspaces
          </h2>
          <ul>
            {workspaces.map((workspace) => (
              <li key={workspace.workspace_id} className="mb-2">
                <button
                  className="w-full text-left p-2 rounded hover:bg-[#34495e] flex items-center"
                  title={workspace.description}
                >
                  <span className="truncate">{workspace.name}</span>
                </button>
              </li>
            ))}
            {workspaces.length === 0 && (
              <li className="text-gray-400 italic">No workspaces found.</li>
            )}
          </ul>

          <div className="mt-6">
            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-2">
              Projects
            </h2>
            <ul>
              {projects.map((project) => (
                <li key={project.project_id} className="mb-2">
                  <button
                    className="w-full text-left p-2 rounded hover:bg-[#34495e] flex items-center"
                    title={project.description}
                  >
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              ))}
              {projects.length === 0 && (
                <li className="text-gray-400 italic">No projects found.</li>
              )}
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
              <p className="text-sm text-gray-500">
                Welcome back, {userFullName || "User"}!
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <FaBell className="text-gray-600" />
                </button>
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </div>
              <div className="flex items-center cursor-default select-none">
                {currentUser?.profile_picture ? (
                  // Show profile picture if exists
                  <img
                    src={currentUser.profile_picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#A4EBF3] flex items-center justify-center text-[#2c3e50] font-bold text-sm">
                    {userInitials || "U"}
                  </div>
                )}
                <span className="ml-2 font-medium">
                  {currentUser?.name || "User"}
                </span>
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
                  <p className="text-2xl font-bold mt-1">{totalTasks}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaTasks size={20} />
                </div>
              </div>
              <div className="mt-4">
                {totalTasks > 0 ? (
                  (() => {
                    const totalProgress = tasks.reduce(
                      (acc, t) => acc + (t.progress ?? 0),
                      0
                    );
                    const averageProgress = Math.round(totalProgress / totalTasks);
                    return (
                      <>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-[#2c8f9e] rounded-full"
                            style={{ width: `${averageProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {averageProgress}% completed
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <p className="text-xs text-gray-500 mt-2">No tasks found</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold mt-1">{activeProjects}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaChartLine size={20} />
                </div>
              </div>
              <div className="mt-4">
                {projects.length > 0 ? (
                  (() => {
                    const today = new Date();
                    const projectsBehind = projects.filter((p) =>
                      tasks.some(
                        (t) =>
                          t.project_id === p.project_id &&
                          t.status !== "Completed" &&
                          t.due_date &&
                          new Date(t.due_date) < today
                      )
                    ).length;
                    return (
                      <p className="text-sm text-gray-600">{projectsBehind} behind schedule</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-600">No projects found</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Team Members</p>
                  <p className="text-2xl font-bold mt-1">{teamMembers}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaUsers size={20} />
                </div>
              </div>
              <div className="mt-4">
                {users.length > 0 ? (
                  (() => {
                    const assignedUserIds = new Set(tasks.map((t) => t.assigned_to));
                    const availableCount = users.filter(
                      (u) => !assignedUserIds.has(u.user_id)
                    ).length;
                    return (
                      <p className="text-sm text-gray-600">{availableCount} available for tasks</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-600">No team members found</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Notifications</p>
                  <p className="text-2xl font-bold mt-1">{unreadNotifications}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F9F9] text-[#2c8f9e]">
                  <FaBell size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">2 unread</p>
                {/* TODO: implement real unread count */}
              </div>
            </div>
          </div>

          {/* Task Management Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Task Management</h2>
              {currentUser?.role_permissions.can_create_tasks ? (
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="flex items-center bg-[#2c8f9e] text-white py-2 px-4 rounded-lg hover:bg-[#237a87]"
                >
                  <FaPlus className="mr-2" /> New Task
                </button>
              ) : (
                <button
                  disabled
                  title="You don't have permission to create tasks"
                  className="flex items-center bg-gray-400/50 text-white py-2 px-4 rounded-lg cursor-not-allowed"
                >
                  <FaPlus className="mr-2" /> New Task
                </button>
              )}
            </div>

            {/* Task List Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => {
                    const assignedUser = users.find(
                      (u) => u.user_id === task.assigned_to
                    );
                    return (
                      <tr key={task.task_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {assignedUser
                              ? `${assignedUser.name} ${assignedUser.surname ?? ""}`
                              : "Unassigned"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : task.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.priority === "Critical"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "High"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.due_date
                            ? new Date(task.due_date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                task.progress === 100
                                  ? "bg-green-600"
                                  : task.progress && task.progress > 50
                                  ? "bg-blue-600"
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${task.progress ?? 0}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {task.progress ?? 0}% complete
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {tasks.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-4 text-gray-500"
                      >
                        No tasks found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        {showCreateTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Create New Task</h3>
                <button
                  onClick={() => {
                    setShowCreateTask(false);
                    setCreateError(null);
                    setFormData({
                      title: "",
                      description: "",
                      workspace_id: "",
                      project_id: "",
                      assigned_to: "",
                      due_date: "",
                      priority: "Medium",
                      status: "To Do",
                    });
                  }}
                  className="text-gray-600 hover:text-gray-900 text-lg font-bold"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateTask();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="workspace_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Workspace <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="workspace_id"
                    name="workspace_id"
                    value={formData.workspace_id}
                    onChange={(e) => {
                      // Clear project selection when workspace changes
                      setFormData((prev) => ({
                        ...prev,
                        workspace_id: e.target.value,
                        project_id: "",
                      }));
                    }}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50"
                  >
                    <option value="" disabled>
                      Select workspace
                    </option>
                    {workspaces.map((ws) => (
                      <option key={ws.workspace_id} value={ws.workspace_id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="project_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="project_id"
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    required
                    disabled={!formData.workspace_id}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50 disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {formData.workspace_id
                        ? "Select project"
                        : "Select workspace first"}
                    </option>
                    {filteredProjects.map((project) => (
                      <option key={project.project_id} value={project.project_id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="assigned_to"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assign To
                  </label>
                  <select
                    id="assigned_to"
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50"
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.name} {user.surname ?? ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="due_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c8f9e] focus:ring focus:ring-[#2c8f9e]/50"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {createError && (
                  <p className="text-sm text-red-600 font-medium">{createError}</p>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateTask(false)}
                    disabled={creating}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-[#2c8f9e] text-white px-4 py-2 rounded hover:bg-[#237a87] disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}