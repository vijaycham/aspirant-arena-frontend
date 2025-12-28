import React from 'react';

const Shimmer = ({ variant = 'card', className = '' }) => {
  const baseClass = "animate-shimmer bg-slate-100 rounded-2xl overflow-hidden";
  
  const variants = {
    card: "h-32 w-full",
    bar: "h-4 w-full",
    text: "h-3 w-3/4",
    circle: "h-12 w-12 rounded-full",
    stats: "h-20 w-32",
    pill: "h-8 w-24 rounded-full"
  };

  return (
    <div className={`${baseClass} ${variants[variant] || ''} ${className}`}>
      <div className="w-full h-full opacity-0"></div>
    </div>
  );
};

export default Shimmer;
