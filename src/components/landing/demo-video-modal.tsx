"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  X,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
} from "lucide-react";

interface DemoVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Video configuration
const VIDEO_CONFIG = {
  // Primary: Self-hosted video (rendered with Remotion)
  selfHosted: "/videos/explainer.mp4",
  // Fallback: YouTube embed (if self-hosted not available)
  youtube: null as string | null, // e.g., "dQw4w9WgXcQ" for YouTube ID
  // Fallback: External URL
  external: null as string | null,
  // Poster image for loading state
  poster: "/images/video-poster.jpg",
};

export function DemoVideoModal({ open, onOpenChange }: DemoVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setProgress(0);
      setHasEnded(false);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [open]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setHasEnded(true);
      setIsPlaying(false);
    };

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
      setHasEnded(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Render YouTube embed if self-hosted fails and YouTube ID is available
  if (videoError && VIDEO_CONFIG.youtube) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-4xl p-0 overflow-hidden bg-black gap-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Dealer OS Explainer Video</DialogTitle>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* YouTube Embed */}
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_CONFIG.youtube}?autoplay=1&rel=0`}
              title="Dealer OS Explainer Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl p-0 overflow-hidden bg-black gap-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Dealer OS Explainer Video</DialogTitle>

        {/* Video Container */}
        <div
          className="relative aspect-video cursor-pointer"
          onMouseMove={handleMouseMove}
          onClick={handlePlayPause}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={VIDEO_CONFIG.poster}
            playsInline
            preload="metadata"
          >
            <source src={VIDEO_CONFIG.selfHosted} type="video/mp4" />
            Ihr Browser unterstützt keine Videos.
          </video>

          {/* Play Button Overlay (when paused) */}
          {!isPlaying && !hasEnded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button
                onClick={handlePlayPause}
                className="w-20 h-20 rounded-full bg-sky-600 hover:bg-sky-700 flex items-center justify-center transition-all transform hover:scale-110 shadow-2xl"
              >
                <Play className="h-8 w-8 text-white ml-1" fill="white" />
              </button>
            </div>
          )}

          {/* End Screen with CTA */}
          {hasEnded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/80 animate-fadeIn">
              <div className="text-center px-8">
                <h3 className="text-3xl font-bold text-white mb-3">
                  Bereit für mehr Übersicht?
                </h3>
                <p className="text-lg text-slate-300 mb-8">
                  14 Tage kostenlos testen · Keine Kreditkarte nötig
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReplay}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nochmal ansehen
                  </Button>
                  <Button
                    size="lg"
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                    asChild
                  >
                    <Link href="/register">
                      Jetzt gratis starten
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div
              className="h-1 bg-white/30 rounded-full mb-3 cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-sky-500 rounded-full relative transition-all group-hover:h-1.5"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleMuteToggle}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </button>

                <span className="text-sm text-white/80">
                  {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFullscreen}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Maximize className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Trigger Button Component
export function DemoVideoButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        variant="outline"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Play className="h-4 w-4" />
        Video ansehen
      </Button>
      <DemoVideoModal open={open} onOpenChange={setOpen} />
    </>
  );
}
