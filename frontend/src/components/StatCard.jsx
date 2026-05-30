const StatCard = ({ title, value, icon: Icon, tone = "ink" }) => {
  const tones = {
    ink: "bg-ink text-white",
    mint: "bg-mint text-white",
    clay: "bg-clay text-white",
    saffron: "bg-saffron text-ink"
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-500">{title}</p>
          <p className="mt-2 text-2xl font-black text-ink">{value}</p>
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-md ${tones[tone]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
