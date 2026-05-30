import { AlertTriangle, Boxes, PackageCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatters.js";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/dashboard");
        setStats(data);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="text-sm font-semibold text-stone-600">Chargement du dashboard...</div>;
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Vue rapide sur la valeur du stock, les ruptures et les ventes du mois." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Valeur totale du stock" value={formatCurrency(stats?.totalStockValue)} icon={Wallet} tone="mint" />
        <StatCard title="Produits en rupture/alerte" value={stats?.lowStockCount || 0} icon={AlertTriangle} tone="clay" />
        <StatCard title="Produits references" value={stats?.totalProducts || 0} icon={Boxes} tone="ink" />
        <StatCard
          title="Ventes ce mois"
          value={formatCurrency(stats?.monthlySales?.reduce((sum, item) => sum + item.total, 0))}
          icon={PackageCheck}
          tone="saffron"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h2 className="text-lg font-black text-ink">Ventes du mois</h2>
            <p className="text-sm text-stone-500">Total journalier des ventes enregistrees.</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlySales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#2F8F83" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-lg font-black text-ink">Top 5 produits</h2>
          <div className="space-y-3">
            {stats?.topProducts?.length ? (
              stats.topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3 last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-100 text-sm font-black text-ink">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{product.name}</p>
                      <p className="text-xs text-stone-500">{product.reference}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-mint">{product.quantity}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Aucune vente pour le moment.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
