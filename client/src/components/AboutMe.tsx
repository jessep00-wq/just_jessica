import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { AuthorBio } from '../../../drizzle/schema';

interface AboutMeProps {
  bio: AuthorBio | null;
  isAdmin?: boolean;
}

export function AboutMe({ bio, isAdmin = false }: AboutMeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(bio?.bio || '');
  const [photoUrl, setPhotoUrl] = useState(bio?.photoUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const updateBioMutation = trpc.blog.updateAuthorBio.useMutation();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // For now, we'll use a placeholder URL
      // In production, you'd upload to your storage service
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
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update About Me');
    }
  };

  if (isEditing && isAdmin) {
    return (
      <section className="border border-border rounded-sm p-6 md:p-8 bg-card mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-6">
          Edit About Me
        </h2>

        <div className="space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Profile Photo
            </label>
            {photoUrl && (
              <div className="mb-4">
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-sm object-cover"
                />
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-sm cursor-pointer hover:bg-muted transition-colors">
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

          {/* Bio Text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <Textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Tell your story..."
              rows={6}
              className="rounded-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={updateBioMutation.isPending}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {updateBioMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!bio?.bio && !bio?.photoUrl) {
    return isAdmin ? (
      <section className="border border-border rounded-sm p-6 md:p-8 bg-card mb-8 text-center">
        <p className="text-muted-foreground mb-4">No About Me section yet</p>
        <Button
          onClick={() => setIsEditing(true)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Add About Me
        </Button>
      </section>
    ) : null;
  }

  return (
    <section className="border border-border rounded-sm p-6 md:p-8 bg-card mb-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Photo */}
        {bio?.photoUrl && (
          <div className="flex-shrink-0">
            <img
              src={bio.photoUrl}
              alt="Jessica"
              className="w-32 h-32 md:w-40 md:h-40 rounded-sm object-cover"
            />
          </div>
        )}

        {/* Bio Content */}
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-4">
            About Me
          </h2>
          <div className="text-foreground space-y-4 leading-relaxed">
            {bio?.bio?.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {isAdmin && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              className="mt-4 text-accent hover:text-accent/80 p-0 h-auto font-medium"
            >
              Edit
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
