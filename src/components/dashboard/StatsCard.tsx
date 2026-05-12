import { LucideIcon, Users, Building2, Tag, Crown, BarChart2 } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  users: Users,
  building: Building2,
  tag: Tag,
  crown: Crown,
  info: BarChart2,
};

const colorMap: Record<string, string> = {
  primary: 'bg-vault-primary/10 text-vault-primary',
  accent: 'bg-yellow-500/10 text-yellow-400',
  success: 'bg-green-500/10 text-green-400',
  info: 'bg-blue-500/10 text-blue-400',
};

interface Props {
  title: string;
  value: number | string;
  icon: string;
  color: 'primary' | 'accent' | 'success' | 'info';
  delta?: number;
}

export default function StatsCard({ title, value, icon, color, delta }: Props) {
  const Icon = icons[icon] || BarChart2;
  return (
    <div className="bg-vault-card rounded-2xl border border-vault-border p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-vault-textSecondary text-sm">{title}</p>
        <p className="text-2xl font-display font-bold text-white mt-0.5">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {delta !== undefined && (
          <p className={`text-xs mt-0.5 ${delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {delta >= 0 ? '+' : ''}{delta}% this week
          </p>
        )}
      </div>
    </div>
  );
}
