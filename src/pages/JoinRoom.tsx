import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api, saveGuestSession } from '@/lib/api';

export default function JoinRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    try {
      const res = await api.rooms.join(code, { displayName: displayName || undefined });
      saveGuestSession(res.room.id, {
        guestToken: res.guestToken,
        sessionId: res.sessionId,
        displayName: displayName || undefined,
        roomName: res.room.name,
      });
      navigate(`/rooms/${res.room.id}/gallery`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <Camera className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-foreground">EventSnap</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Joining Room</div>
            <div className="text-3xl font-bold font-mono text-primary tracking-widest">{code}</div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name <span className="text-muted-foreground">(optional)</span></label>
              <Input
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-background border-border text-foreground h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-background hover:bg-primary/90 h-12 text-base font-medium gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Join Room <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
