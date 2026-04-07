import { Check, Eye, Crown, EyeOff, RotateCcw } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

function UserSeat({ user, revealed, creatorId }) {
  const hasVoted = user.hasVoted;
  const isSpectator = user.isSpectator;

  return (
    <div className="flex flex-col items-center gap-1.5 w-20 md:w-24">
      {/* Mini card */}
      <div
        className={`w-10 h-14 md:w-12 md:h-16 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          isSpectator
            ? 'border-border/30 bg-secondary/20'
            : revealed && user.vote !== null
              ? 'border-primary bg-primary/15 text-primary shadow-md shadow-primary/20'
              : hasVoted
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-md shadow-emerald-500/10'
                : 'border-border/40 bg-secondary/30'
        }`}
      >
        {isSpectator ? (
          <Eye className="w-3.5 h-3.5 text-muted-foreground/40" />
        ) : revealed && user.vote !== null ? (
          <span className="animate-scale-in">{user.vote}</span>
        ) : hasVoted ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
        )}
      </div>

      {/* Avatar + Name */}
      <Avatar className="w-8 h-8 md:w-9 md:h-9">
        <AvatarFallback
          className={`text-xs font-bold border ${
            isSpectator
              ? 'bg-muted/80 text-muted-foreground border-border/50'
              : 'bg-primary/15 text-primary border-primary/20'
          }`}
        >
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground truncate max-w-[4.5rem] md:max-w-[5.5rem] text-center">
          {user.name}
        </span>
        {user.id === creatorId && (
          <Crown className="w-3 h-3 text-amber-400 shrink-0" />
        )}
      </div>
    </div>
  );
}

export default function PokerTable({
  users,
  revealed,
  creatorId,
  isCreator,
  votedCount,
  voterCount,
  onReveal,
  onReset,
}) {
  const voters = users.filter((u) => !u.isSpectator);
  const spectators = users.filter((u) => u.isSpectator);
  const allSeated = [...voters, ...spectators];

  // Split users into top and bottom rows
  const half = Math.ceil(allSeated.length / 2);
  const topRow = allSeated.slice(0, half);
  const bottomRow = allSeated.slice(half);

  const voteProgress = voterCount > 0 ? (votedCount / voterCount) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-6 py-4 md:py-8">
      {/* Top row users */}
      <div className="flex justify-center gap-3 md:gap-5 flex-wrap">
        {topRow.map((user) => (
          <UserSeat key={user.id} user={user} revealed={revealed} creatorId={creatorId} />
        ))}
      </div>

      {/* Table */}
      <div className="relative w-full max-w-lg md:max-w-xl">
        <div className="glass-card border border-border/40 rounded-[2rem] md:rounded-[3rem] px-8 py-10 md:px-12 md:py-14 flex flex-col items-center justify-center gap-4 shadow-xl shadow-black/20">
          {/* Vote progress */}
          {!revealed && (
            <div className="w-full max-w-[200px] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <span className="text-primary font-semibold">{votedCount}</span> / {voterCount} oy
                </span>
                <span className="tabular-nums">{voterCount > 0 ? Math.round(voteProgress) : 0}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${voteProgress}%` }}
                />
              </div>
            </div>
          )}

          {revealed && (
            <span className="text-sm font-medium text-emerald-400">Oylar açıklandı!</span>
          )}

          {/* Reveal / Reset buttons */}
          {isCreator && (
            <div>
              {!revealed ? (
                <Button
                  onClick={onReveal}
                  disabled={!votedCount}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 h-12 px-8 text-base"
                >
                  <EyeOff className="w-5 h-5" />
                  Oyları Göster
                </Button>
              ) : (
                <Button
                  onClick={onReset}
                  size="lg"
                  className="shadow-lg shadow-primary/20 h-12 px-8 text-base"
                >
                  <RotateCcw className="w-5 h-5" />
                  Yeni Oylama
                </Button>
              )}
            </div>
          )}

          {!isCreator && !revealed && (
            <p className="text-sm text-muted-foreground">Oylar bekleniyor...</p>
          )}
        </div>
      </div>

      {/* Bottom row users */}
      {bottomRow.length > 0 && (
        <div className="flex justify-center gap-3 md:gap-5 flex-wrap">
          {bottomRow.map((user) => (
            <UserSeat key={user.id} user={user} revealed={revealed} creatorId={creatorId} />
          ))}
        </div>
      )}
    </div>
  );
}
