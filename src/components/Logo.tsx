import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NutritionEmblemWhite: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Haste central e ponta superior */}
    <path d="M48.5 6h3a1.5 1.5 0 0 1 1.5 1.5V18h-6V7.5A1.5 1.5 0 0 1 48.5 6z" />
    <circle cx="50" cy="5" r="3" />

    {/* Braço horizontal da balança */}
    <path d="M19 23c0-1.6 1.4-3 3-3h56c1.6 0 3 1.4 3 3s-1.4 3-3 3H22c-1.6 0-3-1.4-3-3z" />
    <circle cx="21" cy="23" r="2.5" />
    <circle cx="79" cy="23" r="2.5" />

    {/* Coluna / Haste Central */}
    <path d="M47.5 24h5v48h-5z" />

    {/* Prato Esquerdo - Cordas e Prato */}
    <path d="M21 23L12 55h2l8-29 8 29h2l-9-32z" />
    <path d="M11 55c0 10 9 15 19 15s19-5 19-15H11z" />

    {/* Prato Direito - Cordas e Prato */}
    <path d="M79 23L70 55h2l8-29 8 29h2l-9-32z" />
    <path d="M69 55c0 10 9 15 19 15s19-5 19-15H69z" />

    {/* Serpente enrolada em volta da haste central */}
    {/* Cabeça da serpente voltada para a esquerda no topo */}
    <path d="M44 14c-4-2-7 1-10 1-2 0-3-1-3-1s1 3 3 3c3 0 6-1 8 0 3 1.5 5 5 5 8h4c0-4-3-8.5-7-11z" />
    <circle cx="34" cy="14" r="1.2" fill="#16a34a" />

    {/* Curvas do corpo da serpente (ondulações e espirais) */}
    <path
      d="M54 26c4 3 6 8 4 13-2 4-6 6-9 8s-5 4-5 8c0 5 4 8 9 9 3 0.6 6-0.5 8-2l2 3c-3 2.5-7 3.5-11 2.5-7-1.5-12-6.5-12-13 0-5 3.5-9 7-11.5s7-5 8-8c1.5-3.5 0-6.5-2.5-8.5l2.5-3z"
    />
    <path
      d="M44 49c-4 2.5-6 6-6 10 0 6 5 11 11 11 3.5 0 6.5-1.5 8.5-4l-2.5-2.5c-1.5 1.8-3.8 2.8-6 2.8-4.5 0-7.5-3.5-7.5-7.5 0-3 1.5-5.5 4-7.5l-1.5-2.3z"
    />
    {/* Cauda da serpente na base */}
    <path d="M50 71c3 1.5 7 4 10 9l-3 2c-3-4.5-6-6.5-9-8l2-3z" />

    {/* Base escalonada clássica */}
    <path d="M38 72h24v4H38z" />
    <path d="M33 76h34v4H33z" />
    <path d="M26 80h48v6H26z" />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const boxSizes = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const emblemSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`flex items-center justify-center bg-gradient-to-tr from-nutri-600 to-nutri-400 text-white shadow-md shadow-nutri-500/25 ${boxSizes[size]}`}>
        <NutritionEmblemWhite className={emblemSizes[size]} />
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
