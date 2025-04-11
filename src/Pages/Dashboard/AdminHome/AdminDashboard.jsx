import React from 'react';
import { 
  Users, 
  BookOpenCheck, 
  BarChart4, 
  Settings, 
  FileText, 
  CalendarDays,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  // Sample data - replace with real data from your backend
  const stats = [
    { title: "Total Students", value: "1,254", icon: <Users className="w-6 h-6" />, change: "+12%", trend: 'up' },
    { title: "Active Courses", value: "24", icon: <BookOpenCheck className="w-6 h-6" />, change: "+3", trend: 'up' },
    { title: "Pending Requests", value: "8", icon: <FileText className="w-6 h-6" />, change: "-2", trend: 'down' },
    { title: "Revenue", value: "$8,420", icon: <BarChart4 className="w-6 h-6" />, change: "+18%", trend: 'up' }
  ];

  const recentActivities = [
    { id: 1, user: "John Doe", action: "created new course", time: "2 mins ago" },
    { id: 2, user: "Sarah Smith", action: "updated profile", time: "15 mins ago" },
    { id: 3, user: "Admin", action: "approved instructor", time: "1 hour ago" },
    { id: 4, user: "System", action: "completed backup", time: "3 hours ago" }
  ];

  const quickActions = [
    { title: "Manage Users", icon: <Users className="w-5 h-5" />, link: "/admin/users" },
    { title: "Course Approval", icon: <BookOpenCheck className="w-5 h-5" />, link: "/admin/courses" },
    { title: "System Settings", icon: <Settings className="w-5 h-5" />, link: "/admin/settings" },
    { title: "View Reports", icon: <BarChart4 className="w-5 h-5" />, link: "/admin/reports" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {stat.icon}
              </div>
            </div>
            <p className={`mt-2 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change} from last week
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  {action.icon}
                </span>
                <span className="font-medium">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="bg-gray-100 p-2 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">
                    <span className="text-blue-600">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Pending Approvals
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">New Instructor Application</p>
                <p className="text-sm text-gray-500">From: alex@example.com</p>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-sm btn-success">Approve</button>
                <button className="btn btn-sm btn-error">Reject</button>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Course Submission</p>
                <p className="text-sm text-gray-500">"Advanced React Patterns"</p>
              </div>
              <button className="btn btn-sm btn-primary">Review</button>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Messages
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Support Request</p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  "Hello, I'm having trouble accessing the course materials. The system says..."
                </p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-full">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Feedback Submission</p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  "The new dashboard layout is great! One suggestion would be to..."
                </p>
                <p className="text-xs text-gray-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;