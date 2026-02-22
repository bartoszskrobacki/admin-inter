import { useState, useEffect } from 'react';
import { promotionAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImagePreviewDialogProps {
  promotionId: string;
  onClose: () => void;
}

export function ImagePreviewDialog({ promotionId, onClose }: ImagePreviewDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const data = await promotionAPI.getOne(promotionId);
        setImageUrl(data.image);
      } catch (error) {
        console.error('Failed to load image:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [promotionId]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Promotion Image Preview</DialogTitle>
          <DialogDescription>Generated Facebook post image</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <img src={imageUrl} alt="Promotion preview" className="max-w-full h-auto rounded-lg" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
