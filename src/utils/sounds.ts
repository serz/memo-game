import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: Audio.Sound | null } = {};
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
      const soundFiles = {
        flip: require('../../assets/sounds/card-flip.mp3'),
        match: require('../../assets/sounds/match.mp3'),
      };

      for (const [key, file] of Object.entries(soundFiles)) {
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
          this.sounds[key] = sound;
        } catch (error) {
          console.log(`Sound ${key} not loaded yet:`, error);
          this.sounds[key] = null;
        }
      }
    } finally {
      this.isLoading = false;
    }
  }

  async playSound(soundName: 'flip' | 'match') {
    const sound = this.sounds[soundName];
    if (!sound) {
      console.log(`Sound ${soundName} not available`);
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(1.0);
        await sound.playAsync();
      } else {
        console.log(`Sound ${soundName} not properly loaded, trying to reload`);
        await this.loadSounds();
      }
    } catch (error) {
      console.error(`Error playing ${soundName} sound:`, error);
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
    this.sounds = {};
  }
}

export const soundManager = SoundManager.getInstance(); 