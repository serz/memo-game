import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, Alert } from 'react-native';
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

const THEMES = ['Animals', 'Food', 'Random'];
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;

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
  const dropdownHeight = useSharedValue(0);
  const chevronRotate = useSharedValue(0);
  const resetScale = useSharedValue(1);

  const handlePlayerCount = (increment: boolean) => {
    // Button press animation
    buttonScale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );

    // Number slide animation
    numberSlide.value = withSequence(
      withTiming(increment ? -20 : 20),
      withTiming(0)
    );

    setPlayerCount(current => {
      const newCount = increment ? current + 1 : current - 1;
      const validCount = Math.min(Math.max(newCount, MIN_PLAYERS), MAX_PLAYERS);
      return validCount;
    });
  };

  const toggleThemes = () => {
    setShowThemes(prev => {
      chevronRotate.value = withTiming(prev ? 0 : 180);
      dropdownHeight.value = withTiming(prev ? 0 : 150);
      return !prev;
    });
  };

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
      "Reset Game Data",
      "This will clear all game records, player names, and settings. Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resetScale.value = withSpring(1)
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetScale.value = withSpring(1);
            onReset();
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Settings</Text>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Number of Players</Text>
            <View style={styles.playerControl}>
              <Animated.View style={buttonAnimatedStyle}>
                <Pressable 
                  style={[styles.controlButton, playerCount <= MIN_PLAYERS && styles.controlButtonDisabled]}
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
                  style={[styles.controlButton, playerCount >= MAX_PLAYERS && styles.controlButtonDisabled]}
                  onPress={() => handlePlayerCount(true)}
                  disabled={playerCount >= MAX_PLAYERS}
                >
                  <Text style={styles.controlButtonText}>+</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>

          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Card Theme</Text>
            <Pressable 
              style={styles.themeSelector}
              onPress={toggleThemes}
            >
              <Text style={styles.themeSelectorText}>{cardTheme}</Text>
              <Animated.View style={chevronAnimatedStyle}>
                <Ionicons name="chevron-down" size={24} color="#666" />
              </Animated.View>
            </Pressable>
            
            <Animated.View style={[styles.themeDropdown, dropdownAnimatedStyle]}>
              {THEMES.map((theme) => (
                <Pressable
                  key={theme}
                  style={[styles.themeOption, theme === cardTheme && styles.themeOptionSelected]}
                  onPress={() => {
                    setCardTheme(theme);
                    toggleThemes();
                  }}
                >
                  <Text style={[styles.themeOptionText, theme === cardTheme && styles.themeOptionTextSelected]}>
                    {theme}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          </View>

          <Animated.View style={resetAnimatedStyle}>
            <Pressable 
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset Game Data</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.modalButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  settingSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
  playerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 15,
  },
  controlButton: {
    width: 36,
    height: 36,
    backgroundColor: '#2196F3',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerCount: {
    fontSize: 20,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  themeSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#f44336',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  themeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 1000,
    elevation: 5,
  },
  themeOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  themeOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  themeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  themeOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
}); 