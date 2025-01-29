import React from 'react';
import { StyleSheet, Text, Dimensions, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

interface CardProps {
  onPress: () => void;
  isFlipped: boolean;
  emoji: string;
  isMatched?: boolean;
  showMatchAnimation?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 4;

export const Card: React.FC<CardProps> = ({
  onPress,
  isFlipped,
  emoji,
  isMatched = false,
  showMatchAnimation = false,
}) => {
  const spin = useSharedValue(isFlipped ? 180 : 0);
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  React.useEffect(() => {
    spin.value = withTiming(isFlipped ? 180 : 0, { duration: 300 });
  }, [isFlipped]);

  React.useEffect(() => {
    if (showMatchAnimation) {
      scale.value = withSequence(withSpring(1.2), withSpring(1));
    }
  }, [showMatchAnimation]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${spin.value + 180}deg` }],
    opacity: interpolate(spin.value, [0, 90, 180], [0, 0, 1]),
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${spin.value}deg` }],
    opacity: interpolate(spin.value, [0, 90, 180], [1, 0, 0]),
  }));

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        <Animated.View style={[styles.cardContainer, styles.cardBack, backAnimatedStyle]}>
          <View style={styles.cardContent}>
            <Text style={styles.pattern}>🎴</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardContainer,
            styles.cardFront,
            frontAnimatedStyle,
            isMatched && styles.matchedCard,
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardBack: {
    backgroundColor: '#2196F3',
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 5,
    height: '100%',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%',
  },
  cardContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  cardFront: {
    backgroundColor: '#FFF',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  cardWrapper: {
    height: '100%',
    width: '100%',
  },
  container: {
    height: CARD_SIZE,
    margin: 5,
    width: CARD_SIZE,
  },
  emoji: {
    fontSize: CARD_SIZE * 0.5,
  },
  matchedCard: {
    backgroundColor: '#E8E8E8',
    borderColor: '#BDBDBD',
    borderWidth: 2,
  },
  pattern: {
    fontSize: CARD_SIZE * 0.4,
  },
});
