// Jitsi Meeting Component
// Embeds Jitsi video conferencing in the app

import { useEffect, useRef, useState } from 'react';
import { VideoMeeting } from '@/types/organization';
import { useAuth } from '@/contexts/AuthContext';
import { getJitsiConfig, joinMeeting, leaveMeeting, startMeeting, endMeeting } from '@/lib/videoMeetingService';
import { Button } from '@/components/ui/button';
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff, Users, Settings } from 'lucide-react';

// Jitsi Meet External API types
declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: JitsiMeetOptions) => JitsiMeetAPI;
  }
}

interface JitsiMeetOptions {
  roomName: string;
  width: string | number;
  height: string | number;
  parentNode: HTMLElement;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: {
    displayName?: string;
    email?: string;
  };
  jwt?: string;
  onload?: () => void;
}

interface JitsiMeetAPI {
  executeCommand: (command: string, ...args: unknown[]) => void;
  addEventListener: (event: string, listener: (data: unknown) => void) => void;
  removeEventListener: (event: string, listener: (data: unknown) => void) => void;
  dispose: () => void;
  getNumberOfParticipants: () => number;
  isAudioMuted: () => Promise<boolean>;
  isVideoMuted: () => Promise<boolean>;
}

interface JitsiMeetingProps {
  meeting: VideoMeeting;
  onMeetingEnd?: () => void;
  onParticipantJoined?: (participant: unknown) => void;
  onParticipantLeft?: (participant: unknown) => void;
}

// Jitsi domain - can be customized for self-hosted instances
const JITSI_DOMAIN = 'meet.jit.si';

export function JitsiMeeting({
  meeting,
  onMeetingEnd,
  onParticipantJoined,
  onParticipantLeft,
}: JitsiMeetingProps) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  useEffect(() => {
    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = initJitsi;
    script.onerror = () => {
      setError('Failed to load video conferencing');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initJitsi = async () => {
    if (!containerRef.current || !user) {
      setError('Unable to initialize video');
      setIsLoading(false);
      return;
    }

    try {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest';
      const config = getJitsiConfig(meeting, userName, user.email || undefined);

      const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        ...config,
        parentNode: containerRef.current,
        onload: () => {
          setIsLoading(false);
        },
      });

      apiRef.current = api;

      // Event listeners
      api.addEventListener('videoConferenceJoined', async () => {
        // Mark meeting as started if host
        if (meeting.host_id === user.id && meeting.status === 'scheduled') {
          await startMeeting(meeting.id);
        }
        await joinMeeting(meeting.id);
      });

      api.addEventListener('videoConferenceLeft', async () => {
        await leaveMeeting(meeting.id);
        // End meeting if host leaves
        if (meeting.host_id === user.id) {
          await endMeeting(meeting.id);
          onMeetingEnd?.();
        }
      });

      api.addEventListener('participantJoined', (participant) => {
        setParticipantCount(api.getNumberOfParticipants());
        onParticipantJoined?.(participant);
      });

      api.addEventListener('participantLeft', (participant) => {
        setParticipantCount(api.getNumberOfParticipants());
        onParticipantLeft?.(participant);
      });

      api.addEventListener('audioMuteStatusChanged', async () => {
        const muted = await api.isAudioMuted();
        setIsAudioMuted(muted);
      });

      api.addEventListener('videoMuteStatusChanged', async () => {
        const muted = await api.isVideoMuted();
        setIsVideoMuted(muted);
      });

      api.addEventListener('readyToClose', () => {
        onMeetingEnd?.();
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Jitsi:', err);
      setError('Failed to start video conference');
      setIsLoading(false);
    }
  };

  const toggleAudio = () => {
    apiRef.current?.executeCommand('toggleAudio');
  };

  const toggleVideo = () => {
    apiRef.current?.executeCommand('toggleVideo');
  };

  const hangUp = () => {
    apiRef.current?.executeCommand('hangup');
  };

  const toggleChat = () => {
    apiRef.current?.executeCommand('toggleChat');
  };

  const toggleTileView = () => {
    apiRef.current?.executeCommand('toggleTileView');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
        <VideoOff className="h-16 w-16 mb-4 text-red-400" />
        <h3 className="text-xl font-semibold mb-2">Unable to Connect</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-white">Connecting to meeting...</p>
        </div>
      )}

      {/* Jitsi container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Custom controls overlay (optional - Jitsi has its own) */}
      {!isLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isAudioMuted ? 'bg-red-500/20 text-red-400' : 'text-white'}`}
            onClick={toggleAudio}
          >
            {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isVideoMuted ? 'bg-red-500/20 text-red-400' : 'text-white'}`}
            onClick={toggleVideo}
          >
            {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white"
            onClick={toggleTileView}
          >
            <Users className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white"
            onClick={toggleChat}
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full"
            onClick={hangUp}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>

          {/* Participant count */}
          <div className="ml-2 px-3 py-1 bg-gray-700 rounded-full text-sm text-white flex items-center gap-1">
            <Users className="h-4 w-4" />
            {participantCount}
          </div>
        </div>
      )}
    </div>
  );
}
