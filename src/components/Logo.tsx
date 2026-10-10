import React from 'react';
import { Apple, Leaf } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-nutri-600 to-nutri-400 text-white shadow-md shadow-nutri-500/20">
        <Apple className={iconSizes[size]} strokeWidth={2.2} />
        <Leaf className="w-3.5 h-3.5 absolute -top-1 -right-1 text-emerald-200 fill-emerald-300" />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-slate-800 ${textSizes[size]}`}>
          Nutri<span className="text-nutri-600">full</span>
        </span>
        <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 -mt-1">
          Gestão Nutricional
        </span>
      </div>
    </div>
  );
};
