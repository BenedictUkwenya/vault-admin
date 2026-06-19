type PortalPlaceholderProps = {
  title: string;
  description: string;
  items: string[];
};

export default function PortalPlaceholder({ title, description, items }: PortalPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-vault-primary">Portal foundation</p>
        <h1 className="text-2xl font-display font-bold text-white mt-1">{title}</h1>
        <p className="text-vault-textSecondary text-sm mt-2 max-w-2xl">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-vault-border bg-vault-card p-5">
            <p className="text-sm font-medium text-white">{item}</p>
            <p className="text-xs text-vault-textHint mt-2">Planned workflow for this portal phase.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
