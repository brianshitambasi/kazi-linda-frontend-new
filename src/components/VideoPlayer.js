import React, { useRef, useState } from 'react';

const VideoPlayer = ({ url, className = '', style = {} }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
  };

  return (
    <div 
      className="video-container position-relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={{ background: 'black', borderRadius: '8px', overflow: 'hidden' }}
    >
      <video
        ref={videoRef}
        src={url}
        className={`w-100 ${className}`}
        style={{ ...style, maxHeight: '500px', objectFit: 'contain' }}
        preload="metadata"
        onClick={togglePlay}
      />
      {showControls && (
        <div className="video-controls position-absolute bottom-0 left-0 right-0 bg-dark bg-opacity-75 p-2">
          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={togglePlay} 
              className="btn btn-sm btn-light"
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
            >
              {isPlaying ? '‚è∏' : '‚ñ∂'}
            </button>
            <div className="flex-grow-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                style={{ width: '100%' }}
              />
            </div>
            <span className="text-white small">
              Ì¥ä {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}
      <style>{`
        .video-container video { cursor: pointer; }
        .video-controls { transition: opacity 0.3s ease; }
        .volume-slider { -webkit-appearance: none; background: #f39c12; height: 4px; border-radius: 2px; }
        .volume-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: white; border-radius: 50%; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
