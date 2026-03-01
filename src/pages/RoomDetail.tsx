import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, ImageIcon, Smile, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api, Photo } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  EXPIRED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function RoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFacePhotos, setSelectedFacePhotos] = useState<Photo[] | null>(null);
  const [loadingFaceId, setLoadingFaceId] = useState<string | null>(null);

  const joinUrl = `${window.location.origin}/rooms/${roomId}/join`;

  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => api.rooms.get(roomId!),
    enabled: !!roomId,
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['photos', roomId],
    queryFn: () => api.photos.list(roomId!),
    enabled: !!roomId,
    refetchInterval: 10_000,
  });

  const { data: faces = [] } = useQuery({
    queryKey: ['faces', roomId],
    queryFn: () => api.faces.list(roomId!),
    enabled: !!roomId,
    refetchInterval: 15_000,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success('Join link copied!');
  };

  const handleUpload = async (files: FileList) => {
    if (!roomId) return;
    setUploading(true);
    let success = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { bucket, key, uploadUrl } = await api.photos.uploadUrl(roomId, {
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        });
        const s3Res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type, 'Content-Length': String(file.size) },
          body: file,
        });
        if (!s3Res.ok) throw new Error('S3 upload failed');
        await api.photos.complete(roomId, {
          bucket, key,
          contentType: file.type,
          sizeBytes: file.size,
          originalFileName: file.name,
        });
        success++;
      } catch (e: any) {
        toast.error(`Failed: ${file.name} — ${e.message}`);
      }
    }
    setUploading(false);
    if (success > 0) {
      toast.success(`${success} photo${success > 1 ? 's' : ''} uploaded!`);
      queryClient.invalidateQueries({ queryKey: ['photos', roomId] });
    }
  };

  const handleFaceClick = async (faceId: string) => {
    if (loadingFaceId === faceId) return;
    setLoadingFaceId(faceId);
    try {
      const matched = await api.faces.byFace(roomId!, faceId);
      setSelectedFacePhotos(matched);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingFaceId(null);
    }
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) return null;

  const joinUrlForQR = `${window.location.origin}/rooms/${room.code}/join`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="font-bold text-foreground text-lg">{room.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[room.status] ?? ''}`}>
            {room.status}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Room info + QR */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Room Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono font-bold text-primary">{room.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starts</span>
                <span className="text-foreground">{new Date(room.startsAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ends</span>
                <span className="text-foreground">{new Date(room.endsAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upload</span>
                <span className="text-foreground">{room.uploadPermission === 'PUBLIC' ? 'Public' : 'Approval Required'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Face Recognition</span>
                <span className="text-foreground">{room.faceRecognitionEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retention</span>
                <span className="text-foreground">{room.retentionDays} days</span>
              </div>
            </div>
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="w-full gap-2 border-border text-foreground hover:bg-surface">
              <Copy className="w-4 h-4" /> Copy Join Link
            </Button>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center gap-4">
            <h2 className="font-semibold text-foreground self-start">QR Code</h2>
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={joinUrlForQR} size={160} />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Guests scan this to join the room
            </p>
          </div>
        </div>

        {/* Tabs: Photos | Faces */}
        <Tabs defaultValue="photos">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="photos" className="gap-2">
              <ImageIcon className="w-4 h-4" /> Photos ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="faces" className="gap-2">
              <Smile className="w-4 h-4" /> Faces ({faces.length})
            </TabsTrigger>
          </TabsList>

          {/* Photos Tab */}
          <TabsContent value="photos" className="mt-4">
            <div className="flex justify-end mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
                className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </div>
            {photosLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No photos yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Photos appear here once guests upload them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {photos.map((photo) => (
                  <PhotoTile key={photo.id} photo={photo} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Faces Tab */}
          <TabsContent value="faces" className="mt-4">
            {faces.length === 0 ? (
              <div className="text-center py-16">
                <Smile className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No faces detected yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Faces appear after the worker processes uploaded photos.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {faces.map((face) => (
                    <button
                      key={face.id}
                      onClick={() => handleFaceClick(face.id)}
                      className="relative aspect-square rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors focus:outline-none"
                    >
                      <img src={face.faceThumbUrl} alt="face" className="w-full h-full object-cover" />
                      {loadingFaceId === face.id && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedFacePhotos !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">Matched Photos ({selectedFacePhotos.length})</h3>
                      <button onClick={() => setSelectedFacePhotos(null)} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                    </div>
                    {selectedFacePhotos.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No matching photos found.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {selectedFacePhotos.map((photo) => (
                          <PhotoTile key={photo.id} photo={photo} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PhotoTile({ photo }: { photo: Photo }) {
  return (
    <div className="aspect-square bg-surface border border-border rounded-lg overflow-hidden">
      {photo.thumbnailUrl ? (
        <img src={photo.thumbnailUrl} alt="photo" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-muted-foreground">Processing</span>
        </div>
      )}
    </div>
  );
}
