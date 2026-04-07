import React from 'react';

type MetricCardProps = {
  label: string;
  value: string | number;
  subValue?: string | React.ReactNode;
  isActive?: boolean;
  valueColorClass?: string;
  subValueColorClass?: string;
  borderHoverClass?: string;
};

export function MetricCard({
  label,
  value,
  subValue,
  isActive = false,
  valueColorClass = "text-on-background",
  subValueColorClass = "text-on-surface-variant font-medium",
  borderHoverClass = "hover:border-primary-dim transition-colors border-l-4 border-transparent"
}: MetricCardProps) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-5 flex-1 flex flex-col justify-center relative ${!isActive ? borderHoverClass : ''}`}>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 bg-primary rounded-r"></div>
      )}
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl lg:text-4xl font-manrope font-black ${valueColorClass}`}>
          {value}
        </span>
        {subValue && (
          <span className={`text-xs md:text-sm ${subValueColorClass}`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
