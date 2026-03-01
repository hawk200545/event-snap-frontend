import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, LogOut, Trash2, Eye, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api, Room } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  EXPIRED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  DELETED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function toDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function CreateRoomDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [startsAt, setStartsAt] = useState(() => toDateTimeLocal(new Date()));
  const [endsAt, setEndsAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4);
    return toDateTimeLocal(d);
  });
  const [uploadPermission, setUploadPermission] = useState<'PUBLIC' | 'APPROVAL_REQUIRED'>('PUBLIC');
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(true);
  const [retentionDays, setRetentionDays] = useState(7);

  const mutation = useMutation({
    mutationFn: () =>
      api.rooms.create({
        name,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        uploadPermission,
        faceRecognitionEnabled,
        retentionDays,
      }),
    onSuccess: () => {
      toast.success('Room created!');
      setOpen(false);
      setName('');
      setStartsAt(toDateTimeLocal(new Date()));
      const d = new Date(); d.setHours(d.getHours() + 4);
      setEndsAt(toDateTimeLocal(d));
      onCreated();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-background hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" /> New Room
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event Room</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4 mt-2"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        >
          <div className="space-y-1">
            <label className="text-sm font-medium">Event Name</label>
            <Input
              placeholder="Wedding Reception"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Starts At</label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className="bg-background border-border text-foreground"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Ends At</label>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                required
                className="bg-background border-border text-foreground"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Upload Permission</label>
            <select
              value={uploadPermission}
              onChange={(e) => setUploadPermission(e.target.value as any)}
              className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground text-sm"
            >
              <option value="PUBLIC">Public — anyone can upload</option>
              <option value="APPROVAL_REQUIRED">Approval Required</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Face Recognition</label>
            <button
              type="button"
              onClick={() => setFaceRecognitionEnabled(!faceRecognitionEnabled)}
              className={`w-11 h-6 rounded-full transition-colors ${faceRecognitionEnabled ? 'bg-primary' : 'bg-border'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${faceRecognitionEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Retention Days</label>
            <Input
              type="number"
              min={1}
              max={365}
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="bg-background border-border"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-background hover:bg-primary/90"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Create Room'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: api.rooms.list,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.rooms.delete(id),
    onSuccess: () => {
      toast.success('Room deleted');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleDelete = (room: Room) => {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(room.id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-foreground">EventSnap</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Rooms</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {rooms.length} event{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <CreateRoomDialog onCreated={() => queryClient.invalidateQueries({ queryKey: ['rooms'] })} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No rooms yet. Create your first event room.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground leading-tight">{room.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${STATUS_COLORS[room.status] ?? ''}`}>
                    {room.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono text-xs bg-background px-2 py-0.5 rounded">{room.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(room.startsAt).toLocaleDateString()} — {new Date(room.endsAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 gap-1.5"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(room)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
