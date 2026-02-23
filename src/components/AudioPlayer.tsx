"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  file: File;
}

export default function AudioPlayer({ file }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  }

  function onTimeUpdate() { setCurrentTime(audioRef.current?.currentTime ?? 0); }
  function onLoadedMetadata() { setDuration(audioRef.current?.duration ?? 0); }
  function onEnded() { setPlaying(false); setCurrentTime(0); }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
      {url && (
        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />
      )}

      {/* Play/pause */}
      <button
        onClick={toggle}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-900 hover:bg-gray-700 transition shrink-0"
      >
        {playing ? (
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Scrubber */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-8 text-right">{fmt(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={seek}
            className="flex-1 h-1.5 rounded-full accent-gray-900 cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-8">{fmt(duration)}</span>
        </div>
        <p className="text-xs text-gray-400 truncate pl-10">{file.name}</p>
      </div>
    </div>
  );
}
