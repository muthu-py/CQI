import React from 'react';

type FilterSelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  widthClass?: string;
  disabled?: boolean;
};

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  widthClass = "w-40",
  disabled = false
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      <select 
        className={`block ${widthClass} bg-surface-container-lowest border-none rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-primary/20 shadow-sm font-medium disabled:opacity-50 transition-shadow`}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function FilterPanel({ children, actions }: { children: React.ReactNode, actions?: React.ReactNode }) {
  return (
    <section className="bg-surface-container-low p-5 rounded-xl flex flex-wrap gap-6 items-end">
      {children}
      {actions && (
        <div className="ml-auto flex items-center self-end pb-1 gap-2">
           {actions}
        </div>
      )}
    </section>
  );
}
