import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquare, FileText, Brain } from "lucide-react";

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
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Brain size={22} />
          </div>

          <div>
            <h1 className="font-bold text-lg">
              DocuMind AI
            </h1>
            <p className="text-xs text-slate-400">
              RAG Document Assistant
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4 flex-1">
        <p className="text-xs text-slate-500 uppercase mb-4 px-3">
          Workspace
        </p>

        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <FileText size={16} />
          PDF-powered knowledge assistant
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;