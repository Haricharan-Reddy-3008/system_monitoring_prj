import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import axios from "axios";
import type { Project } from "../types";
import { LogOut, Plus } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    checkUser();
    fetchProjects();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
    } else {
      setUser(user);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/projects`);
      setProjects(response.data.projects || []);
    } catch (err: any) {
      console.error(
        "Error fetching projects:",
        err.response?.data || err.message || err,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Projects
            </h1>
            <p className="text-slate-400">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/projects/new")}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Project
            </button>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-400 mb-4">No projects yet</p>
            <button
              onClick={() => navigate("/projects/new")}
              className="btn-primary mx-auto"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/dashboard/${project.id}`)}
                className="card hover:border-blue-500 cursor-pointer transition-all hover:scale-105"
              >
                <h3 className="text-xl font-semibold text-white mb-2">
                  {project.name}
                </h3>
                <p className="text-slate-400 text-sm">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
