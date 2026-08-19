import { useState } from 'react';
import { Upload, Loader2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import type { AuthorBio } from '../../../drizzle/schema';

interface AboutMeProps {
  bio?: AuthorBio | null;
}

const FALLBACK_AUTHOR_PORTRAIT =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80';

export function AboutMe({ bio }: AboutMeProps) {
  const { user } = useAuth();
  const { data: authorBio } = trpc.blog.getAuthorBio.useQuery() as any;
  const [isOpen, setIsOpen] = useState(false);
  const [bioText, setBioText] = useState(authorBio?.bio || '');
  const [photoUrl, setPhotoUrl] = useState(authorBio?.photoUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const updateBioMutation = trpc.blog.updateAuthorBio.useMutation();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPhotoUrl(dataUrl);
        toast.success('Photo uploaded');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateBioMutation.mutateAsync({
        bio: bioText,
        photoUrl: photoUrl,
      });
      toast.success('About Me updated successfully');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update About Me');
    }
  };

  const displayBio = authorBio || bio;

  if (!displayBio?.bio && !displayBio?.photoUrl) {
    return user?.role === 'admin' ? (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No About Me section yet</p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Add About Me
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add About Me</DialogTitle>
            </DialogHeader>
            <EditAboutMeForm
              bioText={bioText}
              setBioText={setBioText}
              photoUrl={photoUrl}
              setPhotoUrl={setPhotoUrl}
              isUploading={isUploading}
              handlePhotoUpload={handlePhotoUpload}
              handleSave={handleSave}
              isPending={updateBioMutation.isPending}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
        {/* Photo */}
        <div className="flex-shrink-0 w-full md:w-auto">
          {displayBio?.photoUrl ? (
            <img
              src={displayBio.photoUrl}
              alt="Jessica"
              className="w-full md:w-48 h-auto md:h-64 object-cover rounded-lg shadow-xl glow-plum"
            />
          ) : (
            <img
              src={FALLBACK_AUTHOR_PORTRAIT}
              alt="Jessica portrait"
              className="w-full md:w-48 h-auto md:h-64 object-cover rounded-lg shadow-xl glow-plum"
              loading="lazy"
            />
          )}
        </div>

        {/* Bio Content */}
        <div className="flex-1 space-y-4">
          <h2 className="editorial-title text-foreground">About Me</h2>
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            {displayBio?.bio?.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="text-base md:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Edit Button (Admin Only) */}
          {user?.role === 'admin' && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-6">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit About Me</DialogTitle>
                </DialogHeader>
                <EditAboutMeForm
                  bioText={bioText}
                  setBioText={setBioText}
                  photoUrl={photoUrl}
                  setPhotoUrl={setPhotoUrl}
                  isUploading={isUploading}
                  handlePhotoUpload={handlePhotoUpload}
                  handleSave={handleSave}
                  isPending={updateBioMutation.isPending}
                  onCancel={() => setIsOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}

function EditAboutMeForm({
  bioText,
  setBioText,
  photoUrl,
  setPhotoUrl,
  isUploading,
  handlePhotoUpload,
  handleSave,
  isPending,
  onCancel,
}: {
  bioText: string;
  setBioText: (text: string) => void;
  photoUrl: string;
  setPhotoUrl: (url: string) => void;
  isUploading: boolean;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium mb-3">Profile Photo</label>
        {photoUrl && (
          <div className="mb-4">
            <img
              src={photoUrl}
              alt="Preview"
              className="w-32 h-40 rounded-lg object-cover"
            />
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Upload Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        {isUploading && <span className="text-xs text-muted-foreground ml-2">Uploading...</span>}
      </div>

      {/* Photo URL (alternative) */}
      <div>
        <label className="block text-sm font-medium mb-2">Or paste photo URL</label>
        <Input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Bio Text */}
      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        <Textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          placeholder="Tell your story..."
          rows={6}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </div>
  );
}
