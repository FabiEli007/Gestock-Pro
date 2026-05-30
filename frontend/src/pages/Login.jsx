import { Boxes } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-pearl lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-white">
              <Boxes size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink">Gestock Pro</h1>
              <p className="text-sm text-stone-600">Connexion a votre espace</p>
            </div>
          </div>

          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-stone-600">
            Pas encore de compte ?{" "}
            <Link className="font-bold text-mint hover:underline" to="/register">
              Creer un compte
            </Link>
          </p>
        </div>
      </section>

      <section className="hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-end">
        <p className="max-w-lg text-4xl font-black leading-tight">Pilotez vos produits, vos ventes et vos alertes stock avec precision.</p>
        <p className="mt-5 max-w-md text-sm leading-6 text-stone-200">
          Une interface operationnelle pour suivre les mouvements, eviter les ruptures et enregistrer les ventes multi-produits.
        </p>
      </section>
    </div>
  );
};

export default Login;
