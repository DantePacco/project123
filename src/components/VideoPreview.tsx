import React, { useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, RotateCcw } from 'lucide-react';
import { Video, TextOverlay } from '../types';

interface VideoPreviewProps {
  video: Video | null;
  textOverlays: TextOverlay[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  maxDuration: number;
}

export default function VideoPreview({
  video,
  textOverlays,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onPlayPause,
  maxDuration
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && maxDuration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * maxDuration;
      onTimeUpdate(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVisibleOverlays = () => {
    return textOverlays.filter(overlay => 
      currentTime >= overlay.startTime && currentTime <= overlay.endTime
    );
  };

  if (!video) {
    return (
      <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
            <Play className="w-8 h-8" />
          </div>
          <p>Select a video to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              onTimeUpdate(0);
            }
          }}
        />
        
        {/* Text Overlays */}
        {getVisibleOverlays().map((overlay) => (
          <div
            key={overlay.id}
            className="absolute pointer-events-none"
            style={{
              left: `${overlay.position.x}%`,
              top: `${overlay.position.y}%`,
              fontSize: `${overlay.fontSize}px`,
              color: overlay.color,
              fontWeight: overlay.fontWeight,
              textAlign: overlay.textAlign as any,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {overlay.text}
          </div>
        ))}

        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
          <button
            onClick={onPlayPause}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-800">
        {/* Progress Bar */}
        <div 
          className="w-full h-2 bg-gray-700 rounded-full cursor-pointer mb-4"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: maxDuration > 0 ? `${(currentTime / maxDuration) * 100}%` : '0%' }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onPlayPause}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            
            <button className="text-white hover:text-blue-400 transition-colors">
              <Volume2 className="w-6 h-6" />
            </button>

            <button 
              onClick={() => onTimeUpdate(0)}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(maxDuration)}
            </span>
            
            <button className="text-white hover:text-blue-400 transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}