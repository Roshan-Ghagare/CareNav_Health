import React from 'react';
import { EvidenceStatus } from '../types';
import { CheckCircle2, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

interface EvidenceBadgeProps {
  status: EvidenceStatus;
  confidence?: number;
  className?: string;
  showIcon?: boolean;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  status,
  confidence,
  className = '',
  showIcon = true
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'FACT':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />,
          label: 'FACT',
          bgColor: 'bg-teal-50',
          textColor: 'text-teal-800',
          borderColor: 'border-teal-200',
          description: 'Explicitly supported by source text'
        };
      case 'UNCERTAIN':
        return {
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-700" />,
          label: 'UNCERTAIN',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          description: 'Ambiguous or incomplete in record'
        };
      case 'MISSING':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-700" />,
          label: 'MISSING',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-800',
          borderColor: 'border-rose-200',
          description: 'Administrative item absent from records'
        };
      case 'ASSUMPTION':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-indigo-700" />,
          label: 'ASSUMPTION',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-800',
          borderColor: 'border-indigo-200',
          description: 'AI inference requiring verification'
        };
      default:
        return {
          icon: null,
          label: status,
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
          description: ''
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      title={config.description}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      {typeof confidence === 'number' && (
        <span className="font-mono text-[11px] opacity-80 tabular-nums">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
};
