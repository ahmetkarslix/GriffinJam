import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Spade, Copy, Eye, EyeOff, RotateCcw, Loader2, SearchX } from 'lucide-react';
import { socket } from '../socket';
import { apiUrl } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import JoinModal from '../components/JoinModal';
import VoteCard from '../components/VoteCard';
import UserList from '../components/UserList';
import Results from '../components/Results';

const DECK_LABELS = {
  fibonacci: 'Fibonacci',
  tshirt: 'T-Shirt',
  hours: 'Hours',
  emoji: 'Emoji',
};

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [roomExists, setRoomExists] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  // Check if room exists
  useEffect(() => {
    fetch(apiUrl(`/api/rooms/${roomId}`))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setRoomExists(true))
      .catch(() => {
        setRoomExists(false);
        toast.error('Oda bulunamadı');
      });
  }, [roomId]);

  // Socket connection
  useEffect(() => {
    if (!joined) return;

    function onRoomUpdated(state) {
      setRoomState(state);
    }

    function onError({ message }) {
      toast.error(message);
    }

    function onReconnect() {
      if (!hasConnectedOnce) {
        setHasConnectedOnce(true);
        return;
      }
      // Re-join room after reconnection so server restores membership
      const userName = sessionStorage.getItem('griffinjam-name') || 'User';
      socket.emit('join-room', { roomId, userName, isSpectator: false });
      toast.success('Yeniden bağlandı!');
    }

    function onDisconnect(reason) {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
      toast.error('Bağlantı koptu, yeniden bağlanılıyor...');
    }

    socket.on('room-updated', onRoomUpdated);
    socket.on('error', onError);
    socket.on('connect', onReconnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('room-updated', onRoomUpdated);
      socket.off('error', onError);
      socket.off('connect', onReconnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [joined, roomId, hasConnectedOnce]);

  const handleJoin = useCallback(
    (name, isSpectator) => {
      sessionStorage.setItem('griffinjam-name', name);
      socket.connect();

      // Wait for actual connection before emitting join
      const doJoin = () => {
        socket.emit('join-room', { roomId, userName: name, isSpectator });
        setJoined(true);
      };

      if (socket.connected) {
        doJoin();
      } else {
        socket.once('connect', doJoin);
      }
    },
    [roomId],
  );

  function handleVote(value) {
    if (roomState?.revealed) return;
    const newVote = myVote === value ? null : value;
    setMyVote(newVote);
    socket.emit('vote', { value: newVote ?? value });
  }

  function handleReveal() {
    socket.emit('reveal-votes');
  }

  function handleReset() {
    socket.emit('reset-votes');
    setMyVote(null);
  }

  function handleSetTask(e) {
    e.preventDefault();
    socket.emit('set-task', { task: taskInput });
  }

  function handleChangeDeck(deckType) {
    socket.emit('change-deck', { deckType });
    setMyVote(null);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link kopyalandı!');
  }

  // Loading
  if (roomExists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Oda yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Not found
  if (roomExists === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-scale-in">
          <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-2xl flex items-center justify-center">
            <SearchX className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Oda bulunamadı</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">Bu oda artık mevcut değil veya geçersiz bir link.</p>
          <Button onClick={() => navigate('/')} className="mt-2">Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  // Join modal
  if (!joined) {
    return (
      <div className="min-h-screen">
        <JoinModal onJoin={handleJoin} />
      </div>
    );
  }

  const isSpectator = roomState?.users.find((u) => u.id === socket.id)?.isSpectator;
  const isCreator = roomState?.creatorId === socket.id;
  const votedCount = roomState?.votedCount || 0;
  const voterCount = roomState?.voterCount || 0;
  const voteProgress = voterCount > 0 ? (votedCount / voterCount) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Subtle background glow */}
      <div className="bg-glow bg-glow-primary w-[400px] h-[400px] -top-48 -right-48 opacity-30" />

      {/* Header */}
      <header className="border-b border-border/50 px-4 py-3 relative z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              <Spade className="w-4 h-4 text-primary-foreground" />
            </button>
            <div>
              <div className="text-sm font-semibold">GriffinJam</div>
              <div className="text-xs text-muted-foreground font-mono">
                {roomId.slice(0, 8)}...
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={roomState?.deckType || 'fibonacci'}
              onValueChange={handleChangeDeck}
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DECK_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleCopyLink} className="border-border/60">
              <Copy className="w-4 h-4" />
              Davet Et
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full relative z-10">
        {/* Main area */}
        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Task name */}
          <form onSubmit={handleSetTask} className="flex gap-2">
            <Input
              type="text"
              placeholder="Task adı veya açıklaması..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
            />
            <Button type="submit" variant="secondary">
              Kaydet
            </Button>
          </form>

          {roomState?.currentTask && (
            <div className="bg-primary/8 border border-primary/15 rounded-xl px-4 py-3 animate-slide-up-fade">
              <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                Aktif Task
              </div>
              <div className="font-medium">{roomState.currentTask}</div>
            </div>
          )}

          {/* Status bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {roomState?.revealed ? (
                <Badge variant="default" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                  Oylar açıklandı!
                </Badge>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <span className="text-primary font-semibold">{votedCount}</span>
                      {' / '}
                      <span>{voterCount}</span>
                      {' oy kullanıldı'}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {voterCount > 0 ? Math.round(voteProgress) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${voteProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {isCreator && (
              <div className="flex gap-2 shrink-0">
                {!roomState?.revealed ? (
                  <Button
                    onClick={handleReveal}
                    disabled={!roomState?.votedCount}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                  >
                    <EyeOff className="w-4 h-4" />
                    Oyları Göster
                  </Button>
                ) : (
                  <Button onClick={handleReset} className="shadow-lg shadow-primary/20">
                    <RotateCcw className="w-4 h-4" />
                    Yeni Oylama
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Cards */}
          {!isSpectator && (
            <div className="flex flex-wrap gap-3 justify-center py-4">
              {roomState?.deck?.values.map((value, i) => (
                <VoteCard
                  key={value}
                  value={value}
                  selected={myVote === value}
                  onClick={handleVote}
                  disabled={roomState?.revealed}
                />
              ))}
            </div>
          )}

          {isSpectator && !roomState?.revealed && (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-3 animate-slide-up-fade">
              <div className="w-14 h-14 bg-secondary/60 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <div className="font-medium text-foreground">Gözlemci Modu</div>
                <div className="text-sm mt-0.5">Oylamayı izliyorsun.</div>
              </div>
            </div>
          )}

          {/* Results */}
          {roomState?.revealed && <Results results={roomState.results} />}
        </main>

        {/* Sidebar - Users */}
        <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border/50 p-4 md:p-5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Katılımcılar ({roomState?.users.length || 0})
          </h3>
          <UserList users={roomState?.users || []} revealed={roomState?.revealed} creatorId={roomState?.creatorId} />
        </aside>
      </div>
    </div>
  );
}
