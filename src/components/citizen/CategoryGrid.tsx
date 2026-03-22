import { CATEGORIES, AlertCategory } from "@/lib/alert-data";

const CategoryGrid = () => {
  const entries = Object.entries(CATEGORIES) as [AlertCategory, (typeof CATEGORIES)[AlertCategory]][];

  return (
    <section className="animate-fade-up stagger-2">
      <h2 className="text-base font-bold text-foreground mb-3">أنواع التنبيهات</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {entries.map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-card border border-border hover:border-accent hover:shadow-sm transition-all duration-200 active:scale-95 group"
          >
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-accent" />
            </div>
            <span className="text-[11px] font-medium text-center text-muted-foreground group-hover:text-foreground leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
