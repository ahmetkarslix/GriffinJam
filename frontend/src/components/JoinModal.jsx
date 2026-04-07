import { useState } from 'react';
import { Spade } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function JoinModal({ onJoin }) {
  const [name, setName] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin(name.trim(), isSpectator);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Background glow */}
      <div className="bg-glow bg-glow-primary w-[300px] h-[300px] top-1/3 left-1/2 -translate-x-1/2 opacity-40" />

      <Card className="w-full max-w-md animate-scale-in glass-card border-border/50 shadow-2xl shadow-black/30 relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-primary/30 animate-float">
            <Spade className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Odaya Katıl</CardTitle>
          <CardDescription>Adını gir ve oturuma katıl</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Adın..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={30}
              className="h-12"
            />

            <Label
              htmlFor="spectator"
              className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors border border-transparent hover:border-border/50"
            >
              <Checkbox
                id="spectator"
                checked={isSpectator}
                onCheckedChange={setIsSpectator}
              />
              <div>
                <div className="text-sm font-medium">Gözlemci olarak katıl</div>
                <div className="text-xs text-muted-foreground">Oy kullanmadan izle</div>
              </div>
            </Label>

            <Button
              type="submit"
              disabled={!name.trim()}
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30"
              size="lg"
            >
              Katıl
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
