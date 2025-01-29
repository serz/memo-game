import { Alert } from 'react-native';

export enum ErrorType {
  STORAGE = 'STORAGE',
  SOUND = 'SOUND',
  GAME_STATE = 'GAME_STATE',
  SETTINGS = 'SETTINGS',
}

interface ErrorConfig {
  readonly type: ErrorType;
  readonly message: string;
  readonly silent?: boolean;
  readonly retryAction?: () => Promise<void>;
}

class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  async handleError({ 
    type, 
    message, 
    silent = false, 
    retryAction 
  }: Readonly<ErrorConfig>): Promise<void> {
    // Log error for debugging
    console.error(`[${type}] ${message}`);

    // For silent errors, just log and return
    if (silent) return;

    if (retryAction) {
      // Show alert with retry option
      Alert.alert(
        'Something went wrong',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: async () => {
              try {
                await retryAction();
              } catch (error) {
                // If retry fails, show final error
                await this.handleError({
                  type,
                  message: 'Unable to recover. Please restart the app.',
                  silent: false,
                });
              }
            },
          },
        ]
      );
    } else {
      // Show simple alert for non-recoverable errors
      Alert.alert('Error', message);
    }
  }

  // Helper for storage errors
  async handleStorageError(error: unknown, retryAction?: () => Promise<void>): Promise<void> {
    await this.handleError({
      type: ErrorType.STORAGE,
      message: 'Unable to save game data. Your progress might be lost.',
      retryAction,
    });
  }

  // Helper for sound errors
  async handleSoundError(error: unknown, silent = true): Promise<void> {
    await this.handleError({
      type: ErrorType.SOUND,
      message: 'Sound playback failed',
      silent,
    });
  }

  // Helper for game state errors
  async handleGameStateError(error: unknown, retryAction?: () => Promise<void>): Promise<void> {
    await this.handleError({
      type: ErrorType.GAME_STATE,
      message: 'Game state corrupted. Try resetting the game.',
      retryAction,
    });
  }
}

export const errorHandler = ErrorHandler.getInstance(); 