// A simple audio service to provide sound feedback.

// This is a global cache to avoid re-creating AudioContexts and re-fetching files.
const audioContext =
  typeof window !== "undefined"
    ? new (window.AudioContext || (window as any).webkitAudioContext)()
    : null;
const audioBufferCache: { [key: string]: AudioBuffer } = {};

/**
 * Plays a sound from a given URL.
 * Caches the decoded audio buffer for subsequent plays.
 * @param url The path to the sound file.
 * @param volume The volume to play the sound at (0.0 to 1.0).
 */
const playSound = async (url: string, volume = 1.0) => {
  if (!audioContext) {
    console.warn("AudioContext not supported.");
    return;
  }
  // If a user action hasn't occurred yet, the audio context might be suspended.
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  try {
    if (!audioBufferCache[url]) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      audioBufferCache[url] = await audioContext.decodeAudioData(arrayBuffer);
    }

    const buffer = audioBufferCache[url];
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.error(`Error playing sound from ${url}:`, error);
  }
};

// The service provides specific methods for different game sounds.
// Assumes sound files are located in `/sounds/`.
export const audioService = {
  playScanSuccess: () => playSound("/sounds/success.mp3", 0.7),
  playScanFailure: () => playSound("/sounds/error.mp3", 0.7),
  playUIClick: () => playSound("/sounds/click.mp3", 0.5),
};

export default audioService;
