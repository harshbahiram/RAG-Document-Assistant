import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;