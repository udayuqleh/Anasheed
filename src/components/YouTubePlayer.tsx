// Native (iPhone / Android): YouTube's official iframe player inside a WebView.
import { forwardRef, useImperativeHandle, useRef } from 'react';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import type { PlayerHandle, PlayerProps } from './types';

export const YouTubePlayer = forwardRef<PlayerHandle, PlayerProps>(
  ({ videoId, playing, height, onState }, ref) => {
    const yt = useRef<YoutubeIframeRef>(null);
    useImperativeHandle(ref, () => ({
      seekTo: (s) => yt.current?.seekTo(s, true),
      getCurrentTime: async () => (await yt.current?.getCurrentTime()) ?? 0,
      getDuration: async () => (await yt.current?.getDuration()) ?? 0,
    }));
    return (
      <YoutubePlayer
        ref={yt}
        height={height}
        videoId={videoId}
        play={playing}
        initialPlayerParams={{ rel: false, modestbranding: true }}
        webViewProps={{ allowsInlineMediaPlayback: true, mediaPlaybackRequiresUserAction: false }}
        onChangeState={(e: string) => {
          if (e === 'playing' || e === 'paused' || e === 'ended' || e === 'buffering' || e === 'unstarted') onState(e);
        }}
      />
    );
  }
);
