import { BarChart3, Boxes, LogOut, ReceiptText, RotateCcw, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/products", label: "Produits", icon: Boxes },
  { to: "/sales", label: "Ventes", icon: ReceiptText },
  { to: "/movements", label: "Mouvements", icon: RotateCcw }
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} aria-label="Fermer" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-stone-200 bg-white px-4 py-5 shadow-soft transition lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xl font-black text-ink">Gestock Pro</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Stock & ventes</p>
          </div>
          <button className="btn-muted h-9 w-9 p-0 lg:hidden" type="button" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-ink text-white" : "text-stone-700 hover:bg-stone-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-stone-200 pt-4">
          <p className="text-sm font-bold text-ink">{user?.name}</p>
          <p className="mb-3 truncate text-xs text-stone-500">{user?.email}</p>
          <button className="btn-muted w-full" type="button" onClick={logout}>
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
