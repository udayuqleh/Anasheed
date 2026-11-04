export type PlayerState = 'playing' | 'paused' | 'ended' | 'buffering' | 'unstarted';

export type PlayerHandle = {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
};

export type PlayerProps = {
  videoId: string;
  playing: boolean;
  height: number;
  onState: (s: PlayerState) => void;
};
