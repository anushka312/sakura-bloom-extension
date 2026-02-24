import React from 'react';
import { cn } from '../utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pixel';
}

export const Card = ({ children, className, variant = 'pixel', ...props }: CardProps) => {
  return (
    <div 
      className={cn(
        variant === 'pixel' ? 'pixel-card' : 'bg-white rounded-xl shadow-sm border border-gray-100 p-4',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'pixel';
}

export const Button = ({ children, className, variant = 'pixel', ...props }: ButtonProps) => {
  return (
    <button 
      className={cn(
        variant === 'pixel' ? 'pixel-button bg-[var(--color-primary)] text-white font-bold hover:opacity-90' : 'px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors',
        className
      )} 
      {...props}
    >
      {children}
    </button>
  );
};
