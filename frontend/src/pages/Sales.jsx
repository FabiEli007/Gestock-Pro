import { Minus, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import api from "../utils/api.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([{ product: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [productsResponse, salesResponse] = await Promise.all([
      api.get("/products"),
      api.get("/sales")
    ]);
    setProducts(productsResponse.data);
    setSales(salesResponse.data);
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

  const productMap = useMemo(
    () => new Map(products.map((product) => [product._id, product])),
    [products]
  );

  const total = items.reduce((sum, item) => {
    const product = productMap.get(item.product);
    return sum + Number(item.quantity || 0) * Number(product?.sellingPrice || 0);
  }, 0);

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => setItems((current) => [...current, { product: "", quantity: 1 }]);

  const removeItem = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const submitSale = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await api.post("/sales", {
        products: items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity)
        }))
      });
      setItems([{ product: "", quantity: 1 }]);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Vente impossible");
    }
  };

  return (
    <div>
      <PageHeader title="Ventes" description="Creez une vente multi-produits et laissez Gestock Pro ajuster le stock." />

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-ink">Nouvelle vente</h2>
            <p className="text-sm text-stone-500">Les prix sont repris depuis la fiche produit.</p>
          </div>
          <div className="rounded-md bg-stone-100 px-3 py-2 text-sm font-black text-ink">{formatCurrency(total)}</div>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

        <form className="space-y-3" onSubmit={submitSale}>
          {items.map((item, index) => {
            const product = productMap.get(item.product);

            return (
              <div key={`${index}-${item.product}`} className="grid gap-3 md:grid-cols-[1fr_140px_140px_44px]">
                <select className="field" value={item.product} onChange={(event) => updateItem(index, "product", event.target.value)} required>
                  <option value="">Selectionner un produit</option>
                  {products.map((productOption) => (
                    <option key={productOption._id} value={productOption._id} disabled={productOption.quantity <= 0}>
                      {productOption.name} - stock {productOption.quantity}
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  type="number"
                  min="1"
                  max={product?.quantity || undefined}
                  value={item.quantity}
                  onChange={(event) => updateItem(index, "quantity", event.target.value)}
                  required
                />
                <div className="flex items-center rounded-md border border-stone-300 bg-stone-50 px-3 text-sm font-bold text-stone-700">
                  {formatCurrency(product?.sellingPrice || 0)}
                </div>
                <button className="btn-muted h-11 w-11 p-0" type="button" onClick={() => removeItem(index)} disabled={items.length === 1} aria-label="Retirer">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="btn-muted" type="button" onClick={addItem}>
              <Plus size={18} />
              Ajouter une ligne
            </button>
            <button className="btn-primary" type="submit">
              <ReceiptText size={18} />
              Valider la vente
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-ink">Dernieres ventes</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Produits</th>
                <th className="px-3 py-3">Utilisateur</th>
                <th className="px-3 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b border-stone-100">
                  <td className="px-3 py-3">{formatDate(sale.date)}</td>
                  <td className="px-3 py-3">
                    {sale.products.map((item) => (
                      <span key={`${sale._id}-${item.product?._id}`} className="mr-2 inline-flex rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-stone-700">
                        {item.product?.name} x{item.quantity}
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-3">{sale.user?.name}</td>
                  <td className="px-3 py-3 font-black text-mint">{formatCurrency(sale.totalAmount)}</td>
                </tr>
              ))}
              {!loading && !sales.length && (
                <tr>
                  <td className="px-3 py-6 text-center text-stone-500" colSpan="4">
                    Aucune vente enregistree.
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

export default Sales;
