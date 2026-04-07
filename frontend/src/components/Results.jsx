import { BarChart3, TrendingUp, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Results({ results }) {
  if (!results) return null;

  // Group votes by value for distribution bars
  const voteGroups = {};
  const totalVotes = results.votes.length;
  results.votes.forEach((v) => {
    if (!voteGroups[v.value]) {
      voteGroups[v.value] = { value: v.value, count: 0, users: [] };
    }
    voteGroups[v.value].count++;
    voteGroups[v.value].users.push(v.userName);
  });
  const distribution = Object.values(voteGroups).sort((a, b) => b.count - a.count);
  const maxCount = distribution.length > 0 ? distribution[0].count : 1;

  return (
    <Card className="animate-scale-in border-border/50 shadow-xl shadow-black/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          Sonuçlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {results.average !== null && (
            <div className="relative overflow-hidden rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative">
                <div className="text-3xl font-bold text-primary">{results.average}</div>
                <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  Ortalama
                </div>
              </div>
            </div>
          )}
          {results.mostVoted && (
            <div className="relative overflow-hidden rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
              <div className="relative">
                <div className="text-3xl font-bold text-emerald-400">{results.mostVoted.value}</div>
                <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1.5">
                  <Trophy className="w-3 h-3" />
                  En Çok ({results.mostVoted.count} oy)
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="opacity-50" />

        {/* Vote Distribution - Visual Bar Chart */}
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Dağılım
          </div>
          <div className="space-y-2.5">
            {distribution.map((group, i) => {
              const percentage = Math.round((group.count / totalVotes) * 100);
              const barWidth = Math.round((group.count / maxCount) * 100);
              const isMostVoted = results.mostVoted && group.value === results.mostVoted.value;
              return (
                <div key={group.value} className={`animate-slide-up-fade stagger-${i + 1}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold min-w-[2rem] ${isMostVoted ? 'text-primary' : 'text-foreground'}`}>
                        {group.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {group.users.join(', ')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium tabular-nums">
                      {group.count} oy ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full animate-bar-fill transition-all ${
                        isMostVoted
                          ? 'bg-gradient-to-r from-primary to-primary/70'
                          : 'bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
