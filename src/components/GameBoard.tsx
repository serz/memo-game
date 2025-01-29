import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Card } from './Card';
import { ScoreChange } from './animations/ScoreChange';
import { Celebration } from './animations/Celebration';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BestTimeAnimation } from './animations/BestTimeAnimation';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Settings, GameSettings } from './Settings';
import { soundManager } from '../utils/sounds';
import { errorHandler } from '../utils/errorHandling';

const EMOJI_SETS = {
  Animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐯'],
  Food: ['🍕', '🍔', '🌭', '🍟', '🌮', '🍜', '🍱', '🍎', '🍫', '🍦'],
  Random: 'random', // Will randomly select one of the sets
  Mixed: 'mixed', // Will mix emojis from all sets
} as const;

interface CardType {
  id: number;
  isFlipped: boolean;
  isMatched: boolean;
  emoji: string;
}

interface Player {
  id: number;
  name: string;
  score: number;
}

interface GameStats {
  bestTime: number | null;
  lastGameTime: number | null;
}

const INITIAL_PLAYERS: Player[] = [{ id: 1, name: 'Player 1', score: 0 }];

const getThemeEmojis = (theme: string): string[] => {
  // Helper function to shuffle array
  const shuffle = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // For Random theme - select one set randomly
  if (theme === 'Random') {
    const themes = ['Animals', 'Food'];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    return EMOJI_SETS[randomTheme as keyof typeof EMOJI_SETS] as string[];
  }

  // For Mixed theme - combine all sets and select random emojis
  if (theme === 'Mixed') {
    const allEmojis = [...EMOJI_SETS.Animals, ...EMOJI_SETS.Food];
    return shuffle(allEmojis).slice(0, 10); // Take 10 random emojis from all sets
  }

  // For specific themes
  return (EMOJI_SETS[theme as keyof typeof EMOJI_SETS] as string[]) || EMOJI_SETS.Animals;
};

const createCardPairs = (theme: string): CardType[] => {
  const themeEmojis = getThemeEmojis(theme);
  const pairs = [...themeEmojis, ...themeEmojis];
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      isFlipped: false,
      isMatched: false,
      emoji,
    }));
};

const STORAGE_KEY = 'memo-game-players';
const STORAGE_KEY_STATS = 'memo-game-stats';
const STORAGE_KEY_SETTINGS = 'memo-game-settings';

const PlayerInfo: React.FC<{
  player: Player;
  isCurrentPlayer: boolean;
  onNameClick: (player: Player) => void;
  style: any;
}> = ({ player, isCurrentPlayer, onNameClick, style }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const nameScale = useSharedValue(1);

  useEffect(() => {
    if (isCurrentPlayer) {
      scale.value = withSequence(withSpring(1.1), withSpring(1));
      opacity.value = withTiming(1);
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(0.7);
    }
  }, [isCurrentPlayer]);

  const animateName = () => {
    nameScale.value = withSequence(withSpring(1.2), withSpring(1));
  };

  // Add effect to animate name when it changes
  useEffect(() => {
    animateName();
  }, [player.name]);

  const nameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nameScale.value }],
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, isCurrentPlayer && styles.currentPlayer, animatedStyle]}>
      <Pressable onPress={() => onNameClick(player)}>
        <Animated.Text
          style={[
            { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
            isCurrentPlayer && { color: '#FFF' },
            nameStyle,
          ]}
        >
          {player.name}
        </Animated.Text>
      </Pressable>
      <Text style={[{ fontSize: 14, color: '#666' }, isCurrentPlayer && { color: '#FFF' }]}>
        Score: {player.score}
      </Text>
    </Animated.View>
  );
};

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10); // Only show centiseconds
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

export const GameBoard: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>(
    () => createCardPairs('Animals') // Default theme
  );
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [matchedPair, setMatchedPair] = useState<number[]>([]);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [gameDuration, setGameDuration] = useState<number>(0);
  const [gameStats, setGameStats] = useState<GameStats>({ bestTime: null, lastGameTime: null });
  const [isNewBestTime, setIsNewBestTime] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    playerCount: 2,
    cardTheme: 'Animals',
  });

  // Move dynamic styles into the component
  const dynamicStyles = {
    header: {
      flexDirection: 'row' as const,
      justifyContent: players.length === 1 ? 'center' : 'space-around',
      alignItems: 'center',
      padding: 20,
      paddingRight: 70,
      backgroundColor: '#FFF',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      position: 'relative' as const,
    },
    playerInfo: {
      padding: 15,
      borderRadius: 15,
      alignItems: 'center' as const,
      backgroundColor: '#F5F5F5',
      minWidth: players.length === 1 ? 160 : 120,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 2,
    },
  };

  // Load sounds on mount
  useEffect(() => {
    soundManager.loadSounds();
    return () => {
      soundManager.unloadSounds();
    };
  }, []);

  // Extract card matching logic
  const handleCardsMatch = (firstIndex: number, secondIndex: number) => {
    soundManager.playSound('match');
    setShowScoreAnimation(true);
    setTimeout(() => setShowScoreAnimation(false), 1000);

    setMatchedPair([firstIndex, secondIndex]);
    setTimeout(() => setMatchedPair([]), 500);

    // Update matched cards and player score in one batch
    setCards(prevCards =>
      prevCards.map((card, index) =>
        index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card
      )
    );

    setPlayers(prevPlayers =>
      prevPlayers.map((player, index) =>
        index === currentPlayerIndex ? { ...player, score: player.score + 1 } : player
      )
    );

    setFlippedIndexes([]);
  };

  // Extract mismatch handling
  const handleCardsMismatch = (firstIndex: number, secondIndex: number) => {
    const triggerHaptic = async () => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        errorHandler.handleGameStateError(error);
      }
    };
    triggerHaptic();

    // Use a single setTimeout to batch state updates
    setTimeout(() => {
      setCards(prevCards =>
        prevCards.map((card, index) =>
          index === firstIndex || index === secondIndex ? { ...card, isFlipped: false } : card
        )
      );
      setFlippedIndexes([]);
      setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    }, 1000);
  };

  // Extract game completion handling
  const handleGameCompletion = async (duration: number) => {
    if (players.length === 1) {
      await handleSinglePlayerWin(duration);
    } else {
      handleMultiPlayerWin();
    }
  };

  // Extract single player win logic
  const handleSinglePlayerWin = async (duration: number) => {
    try {
      const savedStats = await AsyncStorage.getItem(STORAGE_KEY_STATS);
      const currentStats = savedStats
        ? JSON.parse(savedStats)
        : { bestTime: null, lastGameTime: null };

      const isBestTime = !currentStats.bestTime || duration < currentStats.bestTime;
      const newStats = {
        bestTime: isBestTime ? duration : currentStats.bestTime,
        lastGameTime: duration,
      };

      setIsNewBestTime(isBestTime);
      setGameStats(newStats);
      await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(newStats));

      if (isBestTime) {
        await soundManager.playSound('victory');
      }
    } catch (error) {
      errorHandler.handleGameStateError(error);
    }
  };

  // Extract multiplayer win logic
  const handleMultiPlayerWin = () => {
    const maxScore = Math.max(...players.map(p => p.score));
    const winners = players.filter(p => p.score === maxScore);

    if (winners.length === 1) {
      soundManager.playSound('victory');
    }
  };

  // Update the main effect with extracted functions
  useEffect(() => {
    if (flippedIndexes.length !== 2) return;

    const [firstIndex, secondIndex] = flippedIndexes;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (firstCard.emoji === secondCard.emoji) {
      handleCardsMatch(firstIndex, secondIndex);
    } else {
      handleCardsMismatch(firstIndex, secondIndex);
    }
  }, [flippedIndexes]);

  // Update game completion effect
  useEffect(() => {
    const allMatched = cards.every(card => card.isMatched);
    if (!allMatched || !startTime) return;

    const endTime = Date.now();
    const duration = endTime - startTime;

    setGameDuration(duration);
    setIsGameOver(true);
    setShowCelebration(true);

    handleGameCompletion(duration);

    // Cleanup celebration
    const celebrationTimer = setTimeout(() => {
      setShowCelebration(false);
    }, 5000);

    // Cleanup timer on unmount
    return () => clearTimeout(celebrationTimer);
  }, [cards, startTime]);

  // Initialize start time when component mounts or game resets
  useEffect(() => {
    if (!startTime && !isGameOver) {
      setStartTime(Date.now());
    }
  }, [startTime, isGameOver]);

  // Load game stats
  useEffect(() => {
    const loadGameStats = async () => {
      try {
        const savedStats = await AsyncStorage.getItem(STORAGE_KEY_STATS);
        if (savedStats) {
          setGameStats(JSON.parse(savedStats));
        }
      } catch (error) {
        console.error('Error loading game stats:', error);
      }
    };
    loadGameStats();
  }, []);

  const getWinner = () => {
    if (players.length === 1) {
      return 'Game Complete!';
    }
    const maxScore = Math.max(...players.map(p => p.score));
    const winners = players.filter(p => p.score === maxScore);
    return winners.length > 1 ? "It's a tie!" : `${winners[0].name} wins!`;
  };

  const getWinnerDisplay = () => {
    if (players.length === 1) {
      return <Text style={styles.modalScores}>{`Pairs Found: ${players[0].score}`}</Text>;
    }

    const maxScore = Math.max(...players.map(p => p.score));
    const winners = players.filter(p => p.score === maxScore);
    const isTie = winners.length > 1;

    return (
      <Text style={styles.modalScores}>
        {players.map(
          player =>
            `${player.score === maxScore && !isTie ? '🏆 ' : ''}${player.name}: ${player.score}\n`
        )}
      </Text>
    );
  };

  // Load saved player names
  useEffect(() => {
    const loadSavedPlayers = async () => {
      try {
        const savedPlayers = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedPlayers) {
          const parsedPlayers = JSON.parse(savedPlayers);
          setPlayers(prevPlayers =>
            prevPlayers.map(p => ({
              ...p,
              name: parsedPlayers.find((sp: Player) => sp.id === p.id)?.name || p.name,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading player names:', error);
      }
    };

    loadSavedPlayers();
  }, []);

  // Load saved settings on mount
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          setCards(createCardPairs(parsedSettings.cardTheme));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSavedSettings();
  }, []);

  const resetGame = () => {
    setCards(createCardPairs(settings.cardTheme));
    setFlippedIndexes([]);
    setPlayers(prevPlayers => prevPlayers.map(p => ({ ...p, score: 0 })));
    setCurrentPlayerIndex(0);
    setIsGameOver(false);
    setStartTime(Date.now());
    setGameDuration(0);
    setShowCelebration(false);
  };

  const handleCardPress = async (index: number) => {
    if (flippedIndexes.length >= 2 || cards[index].isMatched) return;
    if (cards[index].isFlipped) return;

    await soundManager.playSound('flip');

    setCards(prevCards =>
      prevCards.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
    );

    setFlippedIndexes(prev => [...prev, index]);
  };

  const handlePlayerNameClick = (player: Player) => {
    setEditingPlayer(player);
    setNewPlayerName(player.name);
  };

  const handleSavePlayerName = async () => {
    if (!editingPlayer || !newPlayerName.trim()) return;

    const updatedPlayers = players.map(p =>
      p.id === editingPlayer.id ? { ...p, name: newPlayerName.trim() } : p
    );

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlayers));
      setPlayers(updatedPlayers);
      setEditingPlayer(null);
    } catch (error) {
      errorHandler.handleStorageError(error, async () => {
        // Retry action
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlayers));
        setPlayers(updatedPlayers);
        setEditingPlayer(null);
      });
    }
  };

  const handleApplySettings = (newSettings: GameSettings) => {
    // First, update settings
    setSettings(newSettings);

    // Create new cards with new theme before resetting game
    const newCards = createCardPairs(newSettings.cardTheme);

    // Update players if needed
    if (newSettings.playerCount !== players.length) {
      const newPlayers: Player[] = Array(newSettings.playerCount)
        .fill(0)
        .map((_, index) => ({
          id: index + 1,
          name: `Player ${index + 1}`,
          score: 0,
        }));
      setPlayers(newPlayers);
    }

    // Update cards and start new game
    setCards(newCards);
    setFlippedIndexes([]);
    setCurrentPlayerIndex(0);
    setIsGameOver(false);
    setStartTime(Date.now());
    setGameDuration(0);
    setShowCelebration(false);

    setIsSettingsVisible(false);

    // Save settings to storage (fixed Async to AsyncStorage)
    AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings)).catch(error =>
      console.error('Error saving settings:', error)
    );
  };

  const handleResetGame = async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY, STORAGE_KEY_STATS, STORAGE_KEY_SETTINGS]);

      // Reset all state
      setCards(createCardPairs('Animals'));
      setFlippedIndexes([]);
      setPlayers(INITIAL_PLAYERS);
      setCurrentPlayerIndex(0);
      setIsGameOver(false);
      setStartTime(null);
      setGameDuration(0);
      setGameStats({ bestTime: null, lastGameTime: null });
      setIsNewBestTime(false);
      setSettings({
        playerCount: 1,
        cardTheme: 'Animals',
      });

      Alert.alert('Success', 'All game data has been reset!');
    } catch (error) {
      console.error('Error resetting game data:', error);
      Alert.alert('Error', 'Failed to reset game data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={dynamicStyles.header}>
        {players.map((player, index) => (
          <View key={player.id} style={styles.playerWrapper}>
            <PlayerInfo
              player={player}
              isCurrentPlayer={currentPlayerIndex === index}
              onNameClick={handlePlayerNameClick}
              style={dynamicStyles.playerInfo}
            />
            {showScoreAnimation && currentPlayerIndex === index && <ScoreChange value={1} />}
          </View>
        ))}
        <Pressable style={styles.settingsButton} onPress={() => setIsSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={28} color="#666" />
        </Pressable>
      </View>
      <View style={styles.board}>
        {cards.map((card, index) => (
          <Card
            key={card.id}
            isFlipped={card.isFlipped || card.isMatched}
            emoji={card.emoji}
            onPress={() => handleCardPress(index)}
            isMatched={card.isMatched}
            showMatchAnimation={matchedPair.includes(index)}
          />
        ))}
      </View>
      {showCelebration && <Celebration />}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isGameOver}
        onRequestClose={() => setIsGameOver(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over!</Text>
            <Text style={styles.modalText}>{getWinner()}</Text>
            {getWinnerDisplay()}
            <Text style={styles.modalTime}>Time: {formatDuration(gameDuration)}</Text>

            {/* Only show best time section for single player */}
            {players.length === 1 && (
              <View style={styles.bestTimeContainer}>
                {isNewBestTime ? (
                  <>
                    <BestTimeAnimation />
                    {gameStats.lastGameTime !== gameStats.bestTime && (
                      <Text style={[styles.modalTime, styles.previousBestTime]}>
                        Previous Best: {formatDuration(gameStats.bestTime!)}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.modalTime}>
                      Best Time: {formatDuration(gameStats.bestTime!)}
                    </Text>
                  </>
                )}
              </View>
            )}

            <Pressable style={styles.playAgainButton} onPress={resetGame}>
              <Text style={styles.playAgainText}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={!!editingPlayer}
        onRequestClose={() => setEditingPlayer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Player Name</Text>
            <TextInput
              style={styles.nameInput}
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              placeholder="Enter new name"
              maxLength={20}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingPlayer(null)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePlayerName}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Settings
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onApply={handleApplySettings}
        onReset={handleResetGame}
        initialSettings={{
          playerCount: players.length,
          cardTheme: settings.cardTheme,
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bestTimeContainer: {
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    position: 'relative',
  },
  board: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  currentPlayer: {
    backgroundColor: '#2196F3',
    elevation: 5,
    shadowOpacity: 0.25,
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    margin: 8,
    padding: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalScores: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    color: '#666',
    fontSize: 18,
    marginBottom: 15,
  },
  modalTime: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nameInput: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 20,
    padding: 12,
    width: '100%',
  },
  newBestTime: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playAgainButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  playAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  previousBestTime: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  settingsButton: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    right: 20,
  },
});
