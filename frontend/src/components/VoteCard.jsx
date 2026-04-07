import { cn } from '@/lib/utils';

export default function VoteCard({ value, selected, onClick, disabled }) {
  return (
    <button
      onClick={() => onClick(value)}
      disabled={disabled}
      className={cn(
        'relative w-[4.5rem] h-[6.5rem] md:w-22 md:h-32 rounded-xl border-2 font-bold text-lg',
        'transition-all duration-200 cursor-pointer',
        'flex items-center justify-center',
        'active:scale-95',
        selected
          ? 'border-primary bg-primary/15 text-primary -translate-y-2 shadow-xl shadow-primary/25 ring-1 ring-primary/30'
          : disabled
            ? 'border-border/50 bg-secondary/30 text-muted-foreground/60 cursor-not-allowed'
            : 'border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10',
      )}
    >
      <span className={cn(
        'transition-transform duration-200',
        selected && 'scale-110',
      )}>
        {value}
      </span>
      {selected && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-primary shadow-sm shadow-primary/50" />
      )}
    </button>
  );
}
