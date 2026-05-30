import { ArrowDownToLine, ArrowUpFromLine, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import api from "../utils/api.js";
import { formatDate } from "../utils/formatters.js";

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product: "",
    type: "IN",
    quantity: 1,
    reason: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [movementsResponse, productsResponse] = await Promise.all([
      api.get("/stock-movements"),
      api.get("/products")
    ]);
    setMovements(movementsResponse.data);
    setProducts(productsResponse.data);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await loadData();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const submitMovement = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/stock-movements", {
        ...form,
        quantity: Number(form.quantity)
      });
      setForm({ product: "", type: "IN", quantity: 1, reason: "" });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Mouvement impossible");
    }
  };

  return (
    <div>
      <PageHeader title="Mouvements" description="Suivez les entrees, sorties et sorties liees aux ventes." />

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-ink">Ajuster le stock</h2>
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <form className="grid gap-3 md:grid-cols-[1fr_140px_120px_1fr_auto]" onSubmit={submitMovement}>
          <select className="field" value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} required>
            <option value="">Produit</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} - stock {product.quantity}
              </option>
            ))}
          </select>
          <select className="field" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            <option value="IN">Entree</option>
            <option value="OUT">Sortie</option>
          </select>
          <input
            className="field"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            required
          />
          <input className="field" placeholder="Raison" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} required />
          <button className="btn-primary" type="submit">
            <Plus size={18} />
            Ajouter
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-ink">Historique</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Produit</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Quantite</th>
                <th className="px-3 py-3">Raison</th>
                <th className="px-3 py-3">Utilisateur</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement._id} className="border-b border-stone-100">
                  <td className="px-3 py-3">{formatDate(movement.date)}</td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-ink">{movement.product?.name}</p>
                    <p className="text-xs text-stone-500">{movement.product?.reference}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black ${
                        movement.type === "IN" ? "bg-mint/10 text-mint" : "bg-clay/10 text-clay"
                      }`}
                    >
                      {movement.type === "IN" ? <ArrowDownToLine size={14} /> : <ArrowUpFromLine size={14} />}
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-black">{movement.quantity}</td>
                  <td className="px-3 py-3">{movement.reason}</td>
                  <td className="px-3 py-3">{movement.user?.name}</td>
                </tr>
              ))}
              {!loading && !movements.length && (
                <tr>
                  <td className="px-3 py-6 text-center text-stone-500" colSpan="6">
                    Aucun mouvement enregistre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Movements;
