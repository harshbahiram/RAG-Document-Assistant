
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  LogOut,
} from "lucide-react";

import { signOut } from "../../services/auth";
import { useAuth } from "../../context/AuthContext";
import logo from "../../../public/favicon.ico";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Chat with Documents",
    path: "/chat",
    icon: MessageSquare,
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError("");

    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Unable to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-slate-950 text-white">
      {/* Brand */}
      <div className="border-b border-white/5 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25 ring-1 ring-inset ring-white/15">
            {/* <Brain size={22} aria-hidden="true" /> */}
            <img src={ logo } alt="logo" />    
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight">
              Knowvia AI
            </h1>
            <p className="truncate text-xs text-slate-400">
              RAG Document Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto px-3 py-5"
      >
        <p className="mb-3 px-3 text-xs font-medium text-slate-500">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-400/70 ${
                    isActive
                      ? "bg-blue-500/10 text-white ring-1 ring-inset ring-blue-500/20 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-blue-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      aria-hidden="true"
                      className={`shrink-0 transition-colors duration-150 ${
                        isActive ? "text-blue-400" : "text-slate-500"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="space-y-3 border-t border-white/5 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5 ring-1 ring-inset ring-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-300">
            <FileText size={16} aria-hidden="true" />
          </div>

          <p className="text-xs leading-snug text-slate-400">
            PDF-powered knowledge assistant
          </p>
        </div>

        {user?.email && (
          <p className="truncate px-2 text-xs text-slate-500">
            {user.email}
          </p>
        )}

        {error && (
          <p role="alert" className="px-2 text-xs text-red-400">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
