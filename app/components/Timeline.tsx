import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import EventModal from './EventModal';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  useAnimatedGestureHandler,
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { PinchGestureHandler, GestureHandlerRootView, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { useTheme, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');
const currentYear = new Date().getFullYear();

interface TimelineProps {
  birthdate: Date;
}

type Granularity = 'hours' | 'days' | 'weeks' | 'months' | 'years';

interface TimelineMarker {
  id: number;
  date: Date;
  label: string;
  isCurrent: boolean;
  granularity: Granularity;
}

const ZOOM_LEVELS = {
  HOURS: { threshold: 1.8, value: 'hours' as Granularity },
  DAYS: { threshold: 1.5, value: 'days' as Granularity },
  WEEKS: { threshold: 1.2, value: 'weeks' as Granularity },
  MONTHS: { threshold: 0.9, value: 'months' as Granularity },
  YEARS: { threshold: 0, value: 'years' as Granularity },
};

export default function Timeline({ birthdate }: TimelineProps) {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [granularity, setGranularity] = useState<Granularity>('years');
  const [events, setEvents] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const lastValidScale = useSharedValue(1);

  // Calculate markers based on granularity
  const markers = useMemo(() => {
    const result: TimelineMarker[] = [];
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    // Calculate date range based on granularity
    switch (granularity) {
      case 'hours':
        startDate = new Date(now);
        startDate.setHours(startDate.getHours() - 12);
        endDate = new Date(now);
        endDate.setHours(endDate.getHours() + 12);
        break;
      case 'days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 15);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 15);
        break;
      case 'weeks':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 28);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 28);
        break;
      case 'months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      default: // years
        startDate = new Date(birthdate);
        endDate = new Date(birthdate);
        endDate.setFullYear(endDate.getFullYear() + 100);
    }

    let markerDate = new Date(startDate);
    let id = 0;

    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };

    while (markerDate <= endDate) {
      const isCurrent = markerDate.getFullYear() === now.getFullYear() &&
                       markerDate.getMonth() === now.getMonth() &&
                       markerDate.getDate() === now.getDate() &&
                       (granularity !== 'hours' || markerDate.getHours() === now.getHours());

      let label = '';
      let increment = 1;
      
      switch (granularity) {
        case 'hours':
          label = markerDate.toLocaleTimeString([], { hour: 'numeric' });
          markerDate.setHours(markerDate.getHours() + increment);
          break;
        case 'days':
          label = markerDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
          markerDate.setDate(markerDate.getDate() + increment);
          break;
        case 'weeks':
          label = `Week ${Math.ceil(markerDate.getDate() / 7)}`;
          markerDate.setDate(markerDate.getDate() + 7);
          break;
        case 'months':
          label = markerDate.toLocaleDateString([], { month: 'short' });
          markerDate.setMonth(markerDate.getMonth() + increment);
          break;
        case 'years':
          label = markerDate.getFullYear().toString();
          markerDate.setFullYear(markerDate.getFullYear() + increment);
          break;
      }

      result.push({
        id: id++,
        date: new Date(markerDate),
        label,
        isCurrent,
        granularity
      });
    }

    return result;
  }, [birthdate, granularity]);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync('events');
      if (saved) {
        setEvents(JSON.parse(saved));
      }
    })();
  }, []);

  // Scroll to current date when granularity changes
  useEffect(() => {
    if (scrollViewRef.current && !isZooming) {
      const currentMarkerIndex = markers.findIndex(marker => marker.isCurrent);
      if (currentMarkerIndex !== -1) {
        scrollViewRef.current.scrollTo({
          x: currentMarkerIndex * 80, // Approximate width of marker
          animated: true
        });
      }
    }
  }, [granularity, markers, isZooming]);

  const saveEvent = useCallback(async (date: Date, text: string) => {
    try {
      const dateKey = date.toISOString();
      const updated = { ...events, [dateKey]: text };
      await SecureStore.setItemAsync('events', JSON.stringify(updated));
      setEvents(updated);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  }, [events]);

  const updateGranularity = useCallback((newScale: number) => {
    let newGranularity: Granularity = 'years';
    
    if (newScale > ZOOM_LEVELS.HOURS.threshold) {
      newGranularity = ZOOM_LEVELS.HOURS.value;
    } else if (newScale > ZOOM_LEVELS.DAYS.threshold) {
      newGranularity = ZOOM_LEVELS.DAYS.value;
    } else if (newScale > ZOOM_LEVELS.WEEKS.threshold) {
      newGranularity = ZOOM_LEVELS.WEEKS.value;
    } else if (newScale > ZOOM_LEVELS.MONTHS.threshold) {
      newGranularity = ZOOM_LEVELS.MONTHS.value;
    }

    if (newGranularity !== granularity) {
      setGranularity(newGranularity);
    }
  }, [granularity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onStart: () => {
      baseScale.value = scale.value;
      runOnJS(setIsZooming)(true);
    },
    onActive: (event) => {
      const newScale = baseScale.value * Math.min(Math.max(event.scale, 0.5), 2);
      scale.value = newScale;
      lastValidScale.value = newScale;
      runOnJS(updateGranularity)(newScale);
    },
    onEnd: () => {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
      });
      runOnJS(setIsZooming)(false);
    },
  });

  const handleEventSave = useCallback(async (text: string) => {
    if (selectedDate && text.trim()) {
      await saveEvent(selectedDate, text);
    }
    setShowEventModal(false);
    setSelectedDate(null);
  }, [selectedDate, saveEvent]);

  const handleMarkerPress = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowEventModal(true);
  }, []);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PinchGestureHandler onGestureEvent={pinchHandler}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            removeClippedSubviews={true}
          >
            {markers.map((marker) => (
              <TouchableOpacity
                key={marker.id}
                style={styles.markerContainer}
                onPress={() => handleMarkerPress(marker.date)}
              >
                <View
                  style={[
                    styles.markerLine,
                    { backgroundColor: theme.colors.onBackground },
                    marker.isCurrent && styles.currentMarker,
                  ]}
                />
                <Text
                  variant="labelSmall"
                  style={[
                    styles.markerLabel,
                    { color: theme.colors.onBackground },
                    marker.isCurrent && styles.currentLabel,
                  ]}
                >
                  {marker.label}
                </Text>
                {events[marker.date.toISOString()] && (
                  <View style={[styles.speechBubble, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text variant="labelSmall" style={[styles.speechText, { color: theme.colors.onSurfaceVariant }]}>
                      {events[marker.date.toISOString()]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <EventModal
            visible={showEventModal}
            onSave={handleEventSave}
            onClose={() => {
              setShowEventModal(false);
              setSelectedDate(null);
            }}
            date={selectedDate || undefined}
          />
        </Animated.View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200, // Increased height for better visibility
    justifyContent: 'center',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  markerContainer: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  markerLine: {
    width: 2,
    height: 40,
    marginBottom: 5,
  },
  markerLabel: {
    fontSize: 12,
  },
  speechBubble: {
    padding: 5,
    borderRadius: 10,
    marginTop: 5,
    maxWidth: 100,
  },
  speechText: {
    fontSize: 10,
  },
  currentMarker: {
    backgroundColor: 'red',
    height: 50,
  },
  currentLabel: {
    color: 'red',
    fontWeight: 'bold',
  },
});