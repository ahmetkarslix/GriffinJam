import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Spade, Users, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { apiUrl } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DECK_OPTIONS = [
  { value: 'fibonacci', label: 'Fibonacci', preview: '0, 1, 2, 3, 5, 8, 13, 21...', icon: '🔢' },
  { value: 'tshirt', label: 'T-Shirt Sizes', preview: 'XS, S, M, L, XL, XXL', icon: '👕' },
  { value: 'hours', label: 'Hours', preview: '1, 2, 4, 8, 16, 24, 40', icon: '⏱️' },
  { value: 'emoji', label: 'Emoji', preview: '☕ 👍 🤔 😰 🔥 💀', icon: '🎭' },
];

export default function Home() {
  const [deckType, setDeckType] = useState('fibonacci');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/rooms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckType }),
      });
      const data = await res.json();
      navigate(`/room/${data.roomId}`);
    } catch {
      toast.error('Oda oluşturulamadı');
    } finally {
      setLoading(false);
    }
  }

  function handleJoin(e) {
    e.preventDefault();
    const id = joinRoomId.trim();
    if (!id) return;
    const match = id.match(/\/room\/([^/?]+)/);
    const roomId = match ? match[1] : id;
    navigate(`/room/${roomId}`);
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="bg-glow bg-glow-primary w-[500px] h-[500px] -top-40 -left-40 opacity-60" />
      <div className="bg-glow bg-glow-accent w-[400px] h-[400px] -bottom-32 -right-32 opacity-40" />
      <div className="bg-glow bg-glow-primary w-[300px] h-[300px] top-1/2 right-1/4 opacity-20" />

      {/* Header */}
      <header className="border-b border-border/50 px-6 py-4 relative z-10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Spade className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">GriffinJam</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="max-w-2xl w-full space-y-10">
          <div className="text-center space-y-4 animate-slide-up-fade">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Kayıt gerektirmez
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Planning Poker
              <span className="block text-gradient-primary mt-2">Made Simple</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              Tek tıkla oturum oluştur. Ekibinle gerçek zamanlı efor tahminleri yap.
            </p>
          </div>

          {/* Create Room */}
          <Card className="animate-slide-up-fade stagger-2 glass-card border-border/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                  <Spade className="w-4 h-4 text-primary" />
                </div>
                Yeni Oda Oluştur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DECK_OPTIONS.map((deck) => (
                  <button
                    key={deck.value}
                    onClick={() => setDeckType(deck.value)}
                    className={`group relative p-3 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                      deckType === deck.value
                        ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                        : 'border-border/60 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/60'
                    }`}
                  >
                    <div className="font-medium text-sm">{deck.label}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{deck.preview}</div>
                    {deckType === deck.value && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full shadow-sm shadow-primary/50" />
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleCreate}
                disabled={loading}
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  'Oda Oluştur'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="animate-slide-up-fade stagger-3 glass-card border-border/50 shadow-xl shadow-black/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                Odaya Katıl
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Oda ID veya link yapıştır..."
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="h-12"
                />
                <Button type="submit" variant="secondary" size="lg" className="h-12 px-6">
                  Katıl
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-4 text-center text-muted-foreground text-sm relative z-10 backdrop-blur-sm">
        GriffinJam &mdash; Planning Poker
      </footer>
    </div>
  );
}
