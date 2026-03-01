import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload, ImageIcon, Smile, Search, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api, getGuestSession, Photo } from '@/lib/api';

export default function GuestGallery() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = roomId ? getGuestSession(roomId) : null;

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [selectedFacePhotos, setSelectedFacePhotos] = useState<Photo[] | null>(null);
  const [selfieResults, setSelfieResults] = useState<Photo[] | null>(null);
  const [selfieLoading, setSelfieLoading] = useState(false);
  const [loadingFaceId, setLoadingFaceId] = useState<string | null>(null);

  const { data: photos = [] } = useQuery({
    queryKey: ['guest-photos', roomId],
    queryFn: () => api.photos.list(roomId!),
    enabled: !!roomId,
    refetchInterval: 8_000,
  });

  const { data: faces = [] } = useQuery({
    queryKey: ['guest-faces', roomId],
    queryFn: () => api.faces.list(roomId!),
    enabled: !!roomId,
    refetchInterval: 15_000,
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Session expired or invalid.</p>
          <Button onClick={() => navigate('/')} variant="outline">Go Home</Button>
        </div>
      </div>
    );
  }

  const handleUpload = async (files: FileList) => {
    if (!roomId) return;
    setUploading(true);
    let success = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
      try {
        // 1. Get presigned URL
        const { bucket, key, uploadUrl } = await api.photos.uploadUrl(roomId, {
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        });

        // 2. PUT directly to S3
        const s3Res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type, 'Content-Length': String(file.size) },
          body: file,
        });

        if (!s3Res.ok) throw new Error('S3 upload failed');

        // 3. Notify backend
        await api.photos.complete(roomId, {
          bucket,
          key,
          contentType: file.type,
          sizeBytes: file.size,
          originalFileName: file.name,
          guestToken: session.guestToken,
        });

        success++;
      } catch (e: any) {
        toast.error(`Failed to upload ${file.name}: ${e.message}`);
      }
    }

    setUploading(false);
    setUploadProgress('');
    if (success > 0) {
      toast.success(`${success} photo${success > 1 ? 's' : ''} uploaded!`);
      queryClient.invalidateQueries({ queryKey: ['guest-photos', roomId] });
    }
  };

  const handleSelfieMatch = async (file: File) => {
    if (!roomId) return;
    setSelfieLoading(true);
    setSelfieResults(null);
    try {
      const results = await api.faces.selfieMatch(roomId, file);
      setSelfieResults(results);
      if (results.length === 0) toast.info('No matching photos found.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSelfieLoading(false);
    }
  };

  const handleFaceClick = async (faceId: string) => {
    if (!roomId || loadingFaceId === faceId) return;
    setLoadingFaceId(faceId);
    setSelfieResults(null);
    try {
      const matched = await api.faces.byFace(roomId, faceId);
      setSelectedFacePhotos(matched);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingFaceId(null);
    }
  };

  const displayPhotos = selectedFacePhotos ?? selfieResults ?? photos;
  const isFiltered = selectedFacePhotos !== null || selfieResults !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Camera className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">{session.roomName}</span>
        </div>
        {session.displayName && (
          <span className="text-sm text-muted-foreground hidden sm:block">👋 {session.displayName}</span>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Upload button */}
        <div className="flex items-center gap-4">
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
            className="bg-primary text-background hover:bg-primary/90 gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? uploadProgress : 'Upload Photos'}
          </Button>
          <span className="text-sm text-muted-foreground">{photos.length} photo{photos.length !== 1 ? 's' : ''} in this room</span>
        </div>

        <Tabs defaultValue="gallery">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="gallery" className="gap-2">
              <ImageIcon className="w-4 h-4" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="faces" className="gap-2">
              <Smile className="w-4 h-4" /> Find by Face
            </TabsTrigger>
            <TabsTrigger value="selfie" className="gap-2">
              <Search className="w-4 h-4" /> My Photos
            </TabsTrigger>
          </TabsList>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="mt-4">
            {photos.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No photos yet. Upload the first one!</p>
              </div>
            ) : (
              <PhotoGrid photos={photos} />
            )}
          </TabsContent>

          {/* Faces Tab */}
          <TabsContent value="faces" className="mt-4 space-y-6">
            <p className="text-sm text-muted-foreground">Tap a face to see all photos with that person.</p>
            {faces.length === 0 ? (
              <div className="text-center py-12">
                <Smile className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Faces will appear after photos are processed.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                  {faces.map((face) => (
                    <button
                      key={face.id}
                      onClick={() => handleFaceClick(face.id)}
                      className={`aspect-square rounded-full overflow-hidden border-2 transition-colors focus:outline-none ${
                        selectedFacePhotos ? 'border-primary' : 'border-border hover:border-primary'
                      }`}
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
                      <h3 className="font-medium text-foreground">{selectedFacePhotos.length} matched photos</h3>
                      <button onClick={() => setSelectedFacePhotos(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear
                      </button>
                    </div>
                    {selectedFacePhotos.length === 0
                      ? <p className="text-muted-foreground text-sm">No photos found for this face.</p>
                      : <PhotoGrid photos={selectedFacePhotos} />
                    }
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Selfie Match Tab */}
          <TabsContent value="selfie" className="mt-4 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-4">
              <Smile className="w-10 h-10 text-primary mx-auto" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Find Your Photos</h3>
                <p className="text-sm text-muted-foreground">Upload a selfie and we'll find all photos with your face.</p>
              </div>
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/jpeg,image/png,image/heic"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSelfieMatch(e.target.files[0])}
              />
              <Button
                onClick={() => selfieInputRef.current?.click()}
                disabled={selfieLoading}
                className="bg-primary text-background hover:bg-primary/90 gap-2"
              >
                {selfieLoading ? (
                  <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> Searching...</>
                ) : (
                  <><Camera className="w-4 h-4" /> Upload Selfie</>
                )}
              </Button>
            </div>

            {selfieResults !== null && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{selfieResults.length} photos found</h3>
                  <button onClick={() => setSelfieResults(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>
                {selfieResults.length === 0
                  ? <p className="text-muted-foreground text-sm">No photos matched your selfie.</p>
                  : <PhotoGrid photos={selfieResults} />
                }
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="aspect-square bg-surface border border-border rounded-lg overflow-hidden">
          {photo.thumbnailUrl ? (
            <img src={photo.thumbnailUrl} alt="photo" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-muted-foreground">Processing</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
