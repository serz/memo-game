import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { errorHandler, ErrorType } from './errorHandling';

// Define sound files as a frozen constant
const SOUND_FILES = Object.freeze({
  flip: require('../../assets/sounds/card-flip.mp3'),
  match: require('../../assets/sounds/match.mp3'),
  victory: require('../../assets/sounds/victory.mp3'),
}) as const;

// Define type for sound names based on the constant
type SoundName = keyof typeof SOUND_FILES;

class SoundManager {
  private static instance: SoundManager;
  private sounds: { [K in SoundName]?: Audio.Sound | null } = {};
  private isLoading = false;

  private constructor() {
    // Initialize audio mode for iOS
    this.initAudio();
  }

  private async initAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async loadSounds() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      for (const [key, file] of Object.entries(SOUND_FILES)) {
        const sound = new Audio.Sound();
        try {
          await sound.loadAsync(file, {
            shouldPlay: false,
            volume: 1.0,
            progressUpdateIntervalMillis: 50,
            positionMillis: 0,
            shouldCorrectPitch: true,
            playsInSilentModeIOS: true,
          });
          this.sounds[key as SoundName] = sound;
        } catch (error) {
          errorHandler.handleSoundError(error);
          this.sounds[key as SoundName] = null;
        }
      }
    } catch (error) {
      errorHandler.handleSoundError(error, false);
    } finally {
      this.isLoading = false;
    }
  }

  async playSound(soundName: SoundName) {
    const sound = this.sounds[soundName];
    if (!sound) {
      errorHandler.handleSoundError(new Error(`Sound ${soundName} not available`));
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(1.0);
        await sound.playAsync();
      } else {
        // Try to recover by reloading sounds
        await this.loadSounds();
        await this.playSound(soundName);
      }
    } catch (error) {
      errorHandler.handleSoundError(error);
      // Try to recover by reloading sounds
      this.loadSounds();
    }
  }

  async unloadSounds() {
    for (const sound of Object.values(this.sounds)) {
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading sound:', error);
        }
      }
    }
    this.sounds = {} as { [K in SoundName]?: Audio.Sound | null };
  }
}

export const soundManager = SoundManager.getInstance();
