import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../../utils/supabase/info';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ShareButtonProps {
  type: 'movie' | 'tv' | 'person' | 'collection';
  id: number | string;
  title: string;
  className?: string;
}

export default function ShareButton({ type, id, title, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  // Construct the proxy URL
  // https://[project].supabase.co/functions/v1/make-server-188c0e85/share/[type]/[id]
  const shareUrl = `https://${projectId}.supabase.co/functions/v1/make-server-188c0e85/share/${type}/${id}`;

  const handleShare = async () => {
    try {
      if (navigator.share && /mobile/i.test(navigator.userAgent)) {
         // Use native share on mobile if available
         await navigator.share({
           title: title,
           url: shareUrl
         });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard", {
          description: "Use this link to share with social preview."
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to share", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className={`bg-white/10 hover:bg-white/20 border-white/10 text-white backdrop-blur-sm ${className}`}
          >
            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share with Social Preview</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
