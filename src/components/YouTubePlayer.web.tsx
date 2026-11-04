// Web: YouTube IFrame Player API directly.
import { createElement, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import type { PlayerHandle, PlayerProps, PlayerState } from './types';

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady?: () => void }
}

let apiPromise: Promise<any> | null = null;
function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return apiPromise;
}

const STATES: Record<number, PlayerState> = { [-1]: 'unstarted', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering' };

export const YouTubePlayer = forwardRef<PlayerHandle, PlayerProps>(
  ({ videoId, playing, height, onState }, ref) => {
    const host = useRef<HTMLDivElement | null>(null);
    const player = useRef<any>(null);
    const ready = useRef(false);
    const latest = useRef({ videoId, playing, onState });
    latest.current = { videoId, playing, onState };
    const loaded = useRef(videoId);

    useImperativeHandle(ref, () => ({
      seekTo: (s) => player.current?.seekTo?.(s, true),
      getCurrentTime: async () => player.current?.getCurrentTime?.() ?? 0,
      getDuration: async () => player.current?.getDuration?.() ?? 0,
    }));

    useEffect(() => {
      let cancelled = false;
      loadApi().then((YT) => {
        if (cancelled || !host.current) return;
        const el = document.createElement('div');
        host.current.appendChild(el);
        player.current = new YT.Player(el, {
          width: '100%',
          height: '100%',
          videoId: latest.current.videoId,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: latest.current.playing ? 1 : 0 },
          events: {
            onReady: () => { ready.current = true; if (latest.current.playing) player.current.playVideo(); },
            onStateChange: (e: any) => { const s = STATES[e.data]; if (s) latest.current.onState(s); },
          },
        });
      });
      return () => { cancelled = true; try { player.current?.destroy(); } catch {} };
    }, []);

    useEffect(() => {
      if (!ready.current) return;
      if (loaded.current !== videoId) {
        loaded.current = videoId;
        playing ? player.current.loadVideoById(videoId) : player.current.cueVideoById(videoId);
        return;
      }
      playing ? player.current.playVideo() : player.current.pauseVideo();
    }, [videoId, playing]);

    return (
      <View style={{ height, width: '100%', backgroundColor: '#000' }}>
        {createElement('div', { ref: host, style: { width: '100%', height: '100%' } })}
      </View>
    );
  }
);
