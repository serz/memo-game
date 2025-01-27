import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#gold', '#silver'];

interface ConfettiPieceProps {
  delay: number;
  color: string;
  size: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ delay, color, size }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(SCREEN_HEIGHT, { duration: 3000 })
      )
    );

    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(
          (Math.random() - 0.5) * SCREEN_WIDTH,
          { duration: 3000 }
        )
      )
    );

    rotate.value = withDelay(
      delay,
      withSequence(
        withTiming(360 * 8, { duration: 3000 })
      )
    );

    opacity.value = withDelay(
      delay + 2500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.confetti, 
        animatedStyle, 
        { 
          backgroundColor: color,
          width: size,
          height: size,
        }
      ]} 
    />
  );
};

export const Confetti: React.FC = () => {
  const createConfettiWave = (waveDelay: number) => {
    return Array(30).fill(0).map((_, index) => (
      <ConfettiPiece
        key={`${waveDelay}-${index}`}
        delay={waveDelay + Math.random() * 1000}
        color={CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}
        size={Math.random() * 15 + 10}
      />
    ));
  };

  return (
    <>
      {createConfettiWave(0)}
      {createConfettiWave(1000)}
      {createConfettiWave(2000)}
    </>
  );
};

const styles = StyleSheet.create({
  confetti: {
    position: 'absolute',
    top: -20,
    borderRadius: 3,
  },
}); 