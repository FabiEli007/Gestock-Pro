import { Boxes } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Inscription impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-pearl px-6 py-10">
      <div className="w-full max-w-lg rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-mint text-white">
            <Boxes size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink">Creer un compte</h1>
            <p className="text-sm text-stone-600">Demarrez Gestock Pro</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-700">Nom complet</span>
            <input className="field" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-700">Email</span>
            <input
              className="field"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-700">Mot de passe</span>
            <input
              className="field"
              type="password"
              minLength="6"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-700">Role</span>
            <select className="field" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="cashier">Caissier</option>
            </select>
          </label>
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Creation..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-600">
          Deja inscrit ?{" "}
          <Link className="font-bold text-mint hover:underline" to="/login">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
