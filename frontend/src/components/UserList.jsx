import { Check, Eye, Crown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function UserList({ users, revealed, creatorId }) {
  const voters = users.filter((u) => !u.isSpectator);
  const spectators = users.filter((u) => u.isSpectator);

  return (
    <div className="space-y-5">
      {/* Voters */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Oylayanlar ({voters.length})
        </h4>
        <div className="space-y-1.5">
          {voters.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold border border-primary/20">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate max-w-[120px]">{user.name}</span>
                {user.id === creatorId && (
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center">
                {user.hasVoted ? (
                  revealed && user.vote !== null ? (
                    <Badge variant="secondary" className="bg-primary/15 text-primary font-bold border border-primary/20">
                      {user.vote}
                    </Badge>
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  )
                ) : (
                  <div className="w-8 h-8 rounded-md bg-secondary/60 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spectators */}
      {spectators.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Gözlemciler ({spectators.length})
          </h4>
          <div className="space-y-1.5">
            {spectators.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-muted/80 text-muted-foreground text-xs font-bold border border-border/50">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                  {user.name}
                </span>
                <Eye className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
