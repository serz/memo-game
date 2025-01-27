import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface ScoreChangeProps {
  value: number;
}

export const ScoreChange: React.FC<ScoreChangeProps> = ({ value }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = 1;
    translateY.value = 0;
    
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 800 })
    );
    
    translateY.value = withSpring(-30);
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.score, animatedStyle]}>
      +1
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  score: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
}); 