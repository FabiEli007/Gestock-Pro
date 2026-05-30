import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";

const Layout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-pearl">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="min-h-screen px-4 py-4 lg:ml-72 lg:px-8">
        <button
          className="btn-muted mb-4 lg:hidden"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir la navigation"
        >
          <Menu size={18} />
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
