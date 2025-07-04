"use client";

import React, { useEffect, useState } from "react";
import {
  FaTasks,
  FaUsers,
  FaCog,
  FaBell,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Workspace = {
  workspace_id: string;
  name: string;
  description: string;
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
    can_edit_tasks: boolean;
    can_delete_tasks: boolean;
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

export default function TasksPage() {
  const router = useRouter();

  // State declarations...
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state for Create Task
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState("");
  const [formPriority, setFormPriority] = useState("Medium");
  const [formStatus, setFormStatus] = useState("To Do");
  const [formDueDate, setFormDueDate] = useState("");

  // Reload tasks after creation
  const reloadTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      setTasks(data ?? []);
    }
  };

  // Fetch current user info, workspaces, projects, tasks, etc.

  const fetchCurrentUser = async () => {
    const {
      data: { user },
      error: errUser,
    } = await supabase.auth.getUser();

    if (errUser || !user) {
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

    if (error || !data) {
      setCurrentUser(null);
      return;
    }

    setCurrentUser({
      user_id: data.user_id,
      name: data.name,
      surname: data.surname,
      email: data.email,
      profile_picture: data.profile_picture,
      role_name: data.role?.role_name || "No Role",
      role_permissions: {
        can_create_tasks: data.role?.can_create_tasks ?? false,
        can_edit_tasks: data.role?.can_edit_tasks ?? false,
        can_delete_tasks: data.role?.can_delete_tasks ?? false,
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
    if (!currentUser) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.user_id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
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
        else if (diffHours > 0)
          time = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
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

  // Filter tasks based on search
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find user by ID
  const findUserById = (id: string) =>
    users.find((u) => u.user_id === id);

  // Status badge classes
  function statusBadgeClasses(status: string) {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-[#2c8f9e] text-white";
      case "To Do":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  }

  // Priority badge classes
  function priorityBadgeClasses(priority: string) {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-gray-100 text-gray-800";
      case "Low":
      default:
        return "bg-gray-200 text-gray-600";
    }
  }

  // Handle "WorkNest" click nav
  const handleWorkNestClick = () => {
    router.push("/dash2");
  };

  // Create task form submission
  async function handleCreateTaskSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert("Task title is required");
      return;
    }
    if (!currentUser) {
      alert("User not authenticated");
      return;
    }

    try {
      const { error } = await supabase.from("tasks").insert({
        title: formTitle,
        assigned_to: formAssignedTo || null,
        status: formStatus,
        priority: formPriority,
        due_date: formDueDate || null,
        created_by: currentUser.user_id,
        progress: 0,
        // For simplicity, no project/workspace selected here
      });

      if (error) {
        alert("Failed to create task: " + error.message);
        return;
      }
      setModalOpen(false);
      setFormTitle("");
      setFormAssignedTo("");
      setFormPriority("Medium");
      setFormStatus("To Do");
      setFormDueDate("");
      await reloadTasks();
    } catch (err) {
      alert("Unexpected error: " + err);
    }
  }

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

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading tasks...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#2c3e50] text-white flex flex-col">
        <div
          onClick={handleWorkNestClick}
          className="p-5 border-b border-gray-700 cursor-pointer hover:bg-[#34495e] flex items-center select-none"
          title="Go to Dashboard"
        >
          <FaTasks className="mr-2" />
          <h1 className="text-xl font-bold">WorkNest</h1>
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
              <h1 className="text-xl font-semibold">Tasks</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {userFullName || "User"}!
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#2c8f9e] text-white px-4 py-2 rounded shadow-md hover:bg-[#237a87] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#2c8f9e]/80"
                aria-label="Create new task"
              >
                <FaPlus /> Create Task
              </button>

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
              <div className="flex items-center cursor-default select-none">
                {currentUser?.profile_picture ? (
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

        {/* Content and Search */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 max-w-md">
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-[#2c8f9e]/50 focus:border-[#2c8f9e]"
              aria-label="Search tasks"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {[
                    "Title",
                    "Assigned To",
                    "Status",
                    "Priority",
                    "Due Date",
                    "Progress",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const assignedUser = findUserById(task.assigned_to);

                    return (
                      <tr key={task.task_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignedUser
                            ? `${assignedUser.name} ${assignedUser.surname ?? ""}`
                            : "Unassigned"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClasses(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityBadgeClasses(
                              task.priority
                            )}`}
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
                                  ? "bg-[#2c8f9e]"
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
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Create Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block font-medium text-gray-700">
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-[#2c8f9e]/50 focus:border-[#2c8f9e]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="assigned_to" className="block font-medium text-gray-700">
                  Assigned To
                </label>
                <select
                  id="assigned_to"
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-[#2c8f9e]/50 focus:border-[#2c8f9e]"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.name} {u.surname ?? ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-[#2c8f9e]/50 focus:border-[#2c8f9e]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-[#2c8f9e]/50 focus:border-[#2c8f9e]"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="due_date" className="block font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  id="due_date"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring focus:ring-[#2c8f9e]/50 focus:border-[#2c8f9e]"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#2c8f9e] text-white hover:bg-[#237a87] focus:outline-none"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}