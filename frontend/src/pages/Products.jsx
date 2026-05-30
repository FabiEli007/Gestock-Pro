import { Edit3, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatters.js";

const emptyForm = {
  name: "",
  reference: "",
  category: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  threshold: "",
  image: ""
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const loadProducts = async () => {
    const params = { search, category, lowStock: lowStock || undefined };
    const { data } = await api.get("/products", { params });
    setProducts(data);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        await loadProducts();
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [search, category, lowStock]);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null) payload.append(key, value);
    });
    if (imageFile) payload.append("image", imageFile);

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/products", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Enregistrement impossible");
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      reference: product.reference,
      category: product.category,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      threshold: product.threshold,
      image: product.image || ""
    });
    setImageFile(null);
  };

  const deleteProduct = async (id) => {
    await api.delete(`/products/${id}`);
    await loadProducts();
  };

  return (
    <div>
      <PageHeader
        title="Produits"
        description="Ajoutez, modifiez et filtrez votre catalogue avec seuils d'alerte."
        action={
          editingId && (
            <button className="btn-muted" type="button" onClick={resetForm}>
              <X size={18} />
              Annuler
            </button>
          )
        }
      />

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-ink">{editingId ? "Modifier le produit" : "Nouveau produit"}</h2>
        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSubmit}>
          <input className="field" placeholder="Nom" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input className="field" placeholder="Reference" value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} required />
          <input className="field" placeholder="Categorie" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
          <input
            className="field"
            type="number"
            min="0"
            placeholder="Prix d'achat"
            value={form.purchasePrice}
            onChange={(event) => setForm({ ...form, purchasePrice: event.target.value })}
            required
          />
          <input
            className="field"
            type="number"
            min="0"
            placeholder="Prix de vente"
            value={form.sellingPrice}
            onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })}
            required
          />
          <input
            className="field"
            type="number"
            min="0"
            placeholder="Quantite"
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: event.target.value })}
            required
          />
          <input
            className="field"
            type="number"
            min="0"
            placeholder="Seuil"
            value={form.threshold}
            onChange={(event) => setForm({ ...form, threshold: event.target.value })}
            required
          />
          <input className="field" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
          <button className="btn-primary md:col-span-2 xl:col-span-4" type="submit">
            <Plus size={18} />
            {editingId ? "Enregistrer les modifications" : "Ajouter le produit"}
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input className="field pl-10" placeholder="Recherche nom, reference, categorie" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Toutes categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700">
            <input type="checkbox" checked={lowStock} onChange={(event) => setLowStock(event.target.checked)} />
            Stock bas
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-3">Produit</th>
                <th className="px-3 py-3">Reference</th>
                <th className="px-3 py-3">Categorie</th>
                <th className="px-3 py-3">Achat</th>
                <th className="px-3 py-3">Vente</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Seuil</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-stone-100">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-stone-100">
                        {product.image && <img className="h-full w-full object-cover" src={product.image} alt={product.name} />}
                      </div>
                      <span className="font-bold text-ink">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{product.reference}</td>
                  <td className="px-3 py-3">{product.category}</td>
                  <td className="px-3 py-3">{formatCurrency(product.purchasePrice)}</td>
                  <td className="px-3 py-3">{formatCurrency(product.sellingPrice)}</td>
                  <td className={`px-3 py-3 font-black ${product.quantity <= product.threshold ? "text-red-600" : "text-mint"}`}>{product.quantity}</td>
                  <td className="px-3 py-3">{product.threshold}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button className="btn-muted h-9 w-9 p-0" type="button" onClick={() => editProduct(product)} aria-label="Modifier">
                        <Edit3 size={16} />
                      </button>
                      <button className="btn-danger h-9 w-9 p-0" type="button" onClick={() => deleteProduct(product._id)} aria-label="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !products.length && (
                <tr>
                  <td className="px-3 py-6 text-center text-stone-500" colSpan="8">
                    Aucun produit trouve.
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

export default Products;
