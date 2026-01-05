import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = true,
  className 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-b border-white/10 pb-8 mb-8 last:border-0", className)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group py-2"
      >
        <h2 className="text-2xl font-bold group-hover:text-[var(--brand-primary)] transition-colors">{title}</h2>
        {isOpen ? (
          <ChevronUp className="w-6 h-6 text-[var(--muted-foreground)] group-hover:text-[var(--brand-primary)] transition-colors" />
        ) : (
          <ChevronDown className="w-6 h-6 text-[var(--muted-foreground)] group-hover:text-[var(--brand-primary)] transition-colors" />
        )}
      </button>
      
      <div 
        className={cn(
          "transition-all duration-300 overflow-hidden",
          isOpen ? "mt-8 opacity-100 max-h-[5000px]" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
