import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
  onApply: (settings: GameSettings) => void;
  onReset: () => void;
  initialSettings: GameSettings;
}

export interface GameSettings {
  playerCount: number;
  cardTheme: string;
}

const THEMES = ['Animals', 'Food', 'Random', 'Mixed'] as const;
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;

// Get screen height
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_DROPDOWN_HEIGHT = SCREEN_HEIGHT * 0.3; // 30% of screen height

export const Settings: React.FC<SettingsProps> = ({
  visible,
  onClose,
  onApply,
  onReset,
  initialSettings,
}) => {
  const [playerCount, setPlayerCount] = useState(initialSettings.playerCount);
  const [cardTheme, setCardTheme] = useState(initialSettings.cardTheme);
  const [showThemes, setShowThemes] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);
  const numberSlide = useSharedValue(0);
  const chevronRotate = useSharedValue(0);
  const resetScale = useSharedValue(1);
  const dropdownHeight = useSharedValue(0);

  // Move animations to useEffect
  useEffect(() => {
    if (showThemes) {
      chevronRotate.value = withTiming(180);
      dropdownHeight.value = withTiming(150);
    } else {
      chevronRotate.value = withTiming(0);
      dropdownHeight.value = withTiming(0);
    }
  }, [showThemes]);

  const toggleThemes = () => {
    setShowThemes(prev => !prev);
    // Remove the animation from here since it's now in useEffect
  };

  const handlePlayerCount = (increment: boolean) => {
    // Move animations to their own effect
    setPlayerCount(current => {
      const newCount = increment ? current + 1 : current - 1;
      return Math.min(Math.max(newCount, MIN_PLAYERS), MAX_PLAYERS);
    });
  };

  // Add effect for button animation
  useEffect(() => {
    buttonScale.value = withSequence(withSpring(0.9), withSpring(1));
  }, [playerCount]);

  // Add effect for number slide animation
  useEffect(() => {
    numberSlide.value = withSequence(
      withTiming(0),
      withTiming(playerCount > MIN_PLAYERS ? -20 : 20),
      withTiming(0)
    );
  }, [playerCount]);

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const numberAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: numberSlide.value }],
  }));

  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    height: dropdownHeight.value,
    opacity: interpolate(dropdownHeight.value, [0, 150], [0, 1]),
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotate.value}deg` }],
  }));

  const resetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resetScale.value }],
  }));

  const handleApply = () => {
    onApply({
      playerCount,
      cardTheme,
    });
  };

  const handleReset = () => {
    resetScale.value = withSpring(0.95);
    // Show confirmation alert
    Alert.alert(
      'Reset Game Data',
      'This will clear all game records, player names, and settings. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => (resetScale.value = withSpring(1)),
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetScale.value = withSpring(1);
            onReset();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>

          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Number of Players</Text>
            <View style={styles.playerControl}>
              <Animated.View style={buttonAnimatedStyle}>
                <Pressable
                  style={[
                    styles.controlButton,
                    playerCount <= MIN_PLAYERS && styles.controlButtonDisabled,
                  ]}
                  onPress={() => handlePlayerCount(false)}
                  disabled={playerCount <= MIN_PLAYERS}
                >
                  <Text style={styles.controlButtonText}>-</Text>
                </Pressable>
              </Animated.View>

              <Animated.Text style={[styles.playerCount, numberAnimatedStyle]}>
                {playerCount}
              </Animated.Text>

              <Animated.View style={buttonAnimatedStyle}>
                <Pressable
                  style={[
                    styles.controlButton,
                    playerCount >= MAX_PLAYERS && styles.controlButtonDisabled,
                  ]}
                  onPress={() => handlePlayerCount(true)}
                  disabled={playerCount >= MAX_PLAYERS}
                >
                  <Text style={styles.controlButtonText}>+</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>

          <View style={[styles.settingSection, styles.themeSection]}>
            <Text style={styles.sectionTitle}>Card Theme</Text>
            <Pressable style={styles.themeSelector} onPress={toggleThemes}>
              <Text style={styles.themeSelectorText}>{cardTheme}</Text>
              <Animated.View style={chevronAnimatedStyle}>
                <Ionicons name="chevron-down" size={24} color="#666" />
              </Animated.View>
            </Pressable>

            <View style={styles.themeDropdownContainer}>
              <Animated.View style={[styles.themeDropdown, dropdownAnimatedStyle]}>
                <ScrollView
                  bounces={false}
                  showsVerticalScrollIndicator={true}
                  style={styles.themeScrollView}
                >
                  {THEMES.map(theme => (
                    <Pressable
                      key={theme}
                      style={[
                        styles.themeOption,
                        theme === cardTheme && styles.themeOptionSelected,
                      ]}
                      onPress={() => {
                        setCardTheme(theme);
                        toggleThemes();
                      }}
                    >
                      <Text
                        style={[
                          styles.themeOptionText,
                          theme === cardTheme && styles.themeOptionTextSelected,
                        ]}
                      >
                        {theme}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Animated.View>
            </View>
          </View>

          <Animated.View style={resetAnimatedStyle}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset Game Data</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.modalButtons}>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.applyButton]} onPress={handleApply}>
              <Text style={styles.modalButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  applyButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  controlButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    padding: 12,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    maxWidth: 400,
    padding: 20,
    width: '85%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerControl: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'flex-start',
  },
  playerCount: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
    padding: 12,
  },
  resetButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  settingSection: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 2,
  },
  themeDropdown: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    maxHeight: MAX_DROPDOWN_HEIGHT,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  themeDropdownContainer: {
    position: 'relative',
    zIndex: 4,
  },
  themeOption: {
    backgroundColor: 'white',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    padding: 12,
  },
  themeOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  themeOptionText: {
    color: '#333',
    fontSize: 16,
  },
  themeOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  themeScrollView: {
    flexGrow: 0,
  },
  themeSection: {
    position: 'relative',
    zIndex: 3,
  },
  themeSelector: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  themeSelectorText: {
    color: '#333',
    fontSize: 16,
  },
});
