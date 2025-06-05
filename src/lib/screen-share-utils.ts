// File: lib/screen-share-utils.ts
// Utility functions for screen sharing and media streams

/**
 * Sends a media stream to an RTMP endpoint
 * This is a placeholder implementation that would need to be replaced with a real implementation
 * using a media server or WebRTC service
 * 
 * @param stream The MediaStream to send
 * @param rtmpUrl The RTMP URL to send the stream to
 * @returns Promise that resolves when the stream is connected
 */
export const sendStreamToRtmp = async (
  stream: MediaStream,
  rtmpUrl: string
): Promise<void> => {
  console.log('Sending stream to RTMP:', rtmpUrl);
  console.log('Stream tracks:', stream.getTracks().map(t => t.kind));
  
  // In a real implementation, you would:
  // 1. Use a media server like OBS, FFmpeg, or a cloud service
  // 2. Encode the stream using WebCodecs API
  // 3. Send the encoded stream to the RTMP endpoint
  
  // For example, with a hypothetical media server API:
  // await mediaServer.connect(rtmpUrl);
  // await mediaServer.attachStream(stream);
  // await mediaServer.startBroadcast();
  
  // For now, we'll just simulate success
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Stream connected to RTMP endpoint');
      resolve();
    }, 1000);
  });
};

/**
 * Stops all tracks in a media stream and releases resources
 * 
 * @param stream The MediaStream to clean up
 */
export const cleanupMediaStream = (stream: MediaStream | null): void => {
  if (!stream) return;
  
  stream.getTracks().forEach(track => {
    track.stop();
  });
};

/**
 * Creates a composite stream with picture-in-picture effect
 * 
 * @param screen The screen sharing MediaStream
 * @param camera The camera MediaStream
 * @param options Configuration options for the composite stream
 * @returns A new MediaStream with the composite video and audio
 */
export const createCompositeStream = (
  screen: MediaStream,
  camera: MediaStream,
  options: {
    pipWidth?: number;
    pipHeight?: number;
    pipPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    canvasWidth?: number;
    canvasHeight?: number;
    frameRate?: number;
  } = {}
): MediaStream => {
  // Set default options
  const {
    pipWidth = 320,
    pipHeight = 240,
    pipPosition = 'bottom-right',
    canvasWidth = 1920,
    canvasHeight = 1080,
    frameRate = 30
  } = options;
  
  // Create canvas and context
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Create video elements for each stream
  const screenVideo = document.createElement('video');
  const cameraVideo = document.createElement('video');
  
  screenVideo.srcObject = screen;
  cameraVideo.srcObject = camera;
  
  // Start playing the videos (needed for drawing to canvas)
  screenVideo.play();
  cameraVideo.play();
  
  // Calculate PiP position
  let pipX: number, pipY: number;
  switch (pipPosition) {
    case 'top-left':
      pipX = 20;
      pipY = 20;
      break;
    case 'top-right':
      pipX = canvasWidth - pipWidth - 20;
      pipY = 20;
      break;
    case 'bottom-left':
      pipX = 20;
      pipY = canvasHeight - pipHeight - 20;
      break;
    case 'bottom-right':
    default:
      pipX = canvasWidth - pipWidth - 20;
      pipY = canvasHeight - pipHeight - 20;
      break;
  }
  
  // Draw function that will be called for each frame
  const drawFrame = () => {
    // Draw screen share as main content
    ctx.drawImage(screenVideo, 0, 0, canvasWidth, canvasHeight);
    
    // Draw PiP background (semi-transparent black)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(pipX - 5, pipY - 5, pipWidth + 10, pipHeight + 10);
    
    // Draw camera feed as PiP
    ctx.drawImage(cameraVideo, pipX, pipY, pipWidth, pipHeight);
    
    // Schedule next frame
    requestAnimationFrame(drawFrame);
  };
  
  // Start the drawing loop
  drawFrame();
  
  // Create a stream from the canvas
  const compositeStream = canvas.captureStream(frameRate);
  
  // Add audio tracks from both streams (prioritizing screen audio)
  if (screen.getAudioTracks().length > 0) {
    screen.getAudioTracks().forEach(track => {
      compositeStream.addTrack(track);
    });
  } else if (camera.getAudioTracks().length > 0) {
    camera.getAudioTracks().forEach(track => {
      compositeStream.addTrack(track);
    });
  }
  
  return compositeStream;
};