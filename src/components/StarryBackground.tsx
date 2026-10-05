// ==========================================
// Starry Night Animated Background for Dark Mode
// ==========================================

import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StarConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  group: number;
  isSparkle?: boolean;
}

export function StarryBackground() {
  const { isDark } = useTheme();

  // 3 independent animation channels for smooth natural twinkling
  const animTwinkle1 = useRef(new Animated.Value(0.4)).current;
  const animTwinkle2 = useRef(new Animated.Value(0.8)).current;
  const animTwinkle3 = useRef(new Animated.Value(0.5)).current;
  const animShootingStar = useRef(new Animated.Value(0)).current;

  // Generate fixed stars layout (persists across renders)
  const stars = useMemo<StarConfig[]>(() => {
    const starCount = 95;
    const generated: StarConfig[] = [];

    for (let i = 0; i < starCount; i++) {
      // Golden ratio pseudo-random dispersion for pleasing distribution
      const rawX = ((i * 137.5) % 360) / 360;
      const rawY = ((i * 269.3) % 360) / 360;

      const x = Math.round(rawX * (SCREEN_WIDTH - 24) + 12);
      const y = Math.round(rawY * (SCREEN_HEIGHT - 40) + 16);

      const sizeType = i % 8;
      const size = sizeType === 0 ? 3.5 : sizeType < 3 ? 2.6 : sizeType < 6 ? 2.0 : 1.4;
      const baseOpacity = 0.55 + ((i % 5) / 5) * 0.45; // High visibility (0.55 to 1.0)
      const group = i % 3;
      const isSparkle = i % 9 === 0;

      generated.push({
        id: i,
        x,
        y,
        size,
        baseOpacity,
        group,
        isSparkle,
      });
    }
    return generated;
  }, []);

  useEffect(() => {
    if (!isDark) return;

    // Continuous twinkling loops
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(animTwinkle1, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animTwinkle1, {
          toValue: 0.35,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(animTwinkle2, {
          toValue: 0.3,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animTwinkle2, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const loop3 = Animated.loop(
      Animated.sequence([
        Animated.timing(animTwinkle3, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(animTwinkle3, {
          toValue: 0.45,
          duration: 2300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Shooting star cycle every ~9 seconds
    const shootingLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(6000),
        Animated.timing(animShootingStar, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animShootingStar, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop1.start();
    loop2.start();
    loop3.start();
    shootingLoop.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loop3.stop();
      shootingLoop.stop();
    };
  }, [isDark]);

  if (!isDark) {
    return null;
  }

  const shootingX = animShootingStar.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.1],
  });

  const shootingY = animShootingStar.interpolate({
    inputRange: [0, 1],
    outputRange: [40, SCREEN_HEIGHT * 0.4],
  });

  const shootingOpacity = animShootingStar.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={[StyleSheet.absoluteFill, styles.bgContainer]} pointerEvents="none">
      {/* Soft Nebula Glow Orbs */}
      <View style={styles.nebulaTop} />
      <View style={styles.nebulaBottom} />
      <View style={styles.nebulaCenter} />

      {/* Stars Layer */}
      {stars.map((star) => {
        const anim =
          star.group === 0
            ? animTwinkle1
            : star.group === 1
            ? animTwinkle2
            : animTwinkle3;

        return (
          <View
            key={star.id}
            style={[
              styles.starPositioner,
              {
                left: star.x,
                top: star.y,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.starWrapper,
                {
                  opacity: Animated.multiply(anim, star.baseOpacity),
                },
              ]}
            >
              {star.isSparkle ? (
                // 4-point Diamond Sparkle Star (✨)
                <View style={[styles.sparkleContainer, { width: star.size * 3.2, height: star.size * 3.2 }]}>
                  <View style={[styles.sparkleVertical, { height: star.size * 3.2, width: 2 }]} />
                  <View style={[styles.sparkleHorizontal, { width: star.size * 3.2, height: 2 }]} />
                  <View
                    style={[
                      styles.sparkleCenter,
                      {
                        width: star.size * 1.2,
                        height: star.size * 1.2,
                        borderRadius: (star.size * 1.2) / 2,
                      },
                    ]}
                  />
                </View>
              ) : (
                // Round Glowing Star
                <View
                  style={[
                    styles.starDot,
                    {
                      width: star.size,
                      height: star.size,
                      borderRadius: star.size / 2,
                      backgroundColor:
                        star.size > 2.5
                          ? '#FFFFFF'
                          : star.id % 3 === 0
                          ? '#90CAFF' // icy blue star
                          : star.id % 5 === 0
                          ? '#FFE89E' // warm starlight
                          : '#FFFFFF',
                      shadowColor: star.id % 3 === 0 ? '#60A5FA' : '#FFFFFF',
                      shadowRadius: star.size > 2 ? 6 : 3,
                      shadowOpacity: 1,
                      elevation: 2,
                    },
                  ]}
                />
              )}
            </Animated.View>
          </View>
        );
      })}

      {/* Shooting Star trail */}
      <Animated.View
        style={[
          styles.shootingStar,
          {
            opacity: shootingOpacity,
            transform: [
              { translateX: shootingX },
              { translateY: shootingY },
              { rotate: '-35deg' },
            ],
          },
        ]}
      >
        <View style={styles.shootingStarHead} />
        <View style={styles.shootingStarTail} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bgContainer: {
    backgroundColor: '#090B10',
    zIndex: -1,
  },
  nebulaTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(10, 132, 255, 0.08)',
  },
  nebulaBottom: {
    position: 'absolute',
    bottom: 40,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(175, 82, 222, 0.06)',
  },
  nebulaCenter: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.4,
    right: -30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 188, 212, 0.06)',
  },
  starPositioner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starDot: {
    shadowOffset: { width: 0, height: 0 },
  },
  sparkleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleVertical: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#90CAFF',
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  sparkleHorizontal: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#90CAFF',
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  sparkleCenter: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowRadius: 6,
    shadowOpacity: 1,
  },
  shootingStar: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shootingStarHead: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#90CAFF',
    shadowRadius: 8,
    shadowOpacity: 1,
  },
  shootingStarTail: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 1,
  },
});
