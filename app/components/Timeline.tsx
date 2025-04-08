import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import EventModal from './EventModal';
import Animated from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme, Text, Button } from 'react-native-paper';

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
  HOURS: { value: 'hours' as Granularity, label: 'Hours' },
  DAYS: { value: 'days' as Granularity, label: 'Days' },
  WEEKS: { value: 'weeks' as Granularity, label: 'Weeks' },
  MONTHS: { value: 'months' as Granularity, label: 'Months' },
  YEARS: { value: 'years' as Granularity, label: 'Years' },
};

export default function Timeline({ birthdate }: TimelineProps) {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [granularity, setGranularity] = useState<Granularity>('years');
  const [events, setEvents] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  
  // Ref to prevent auto-scrolling after modal interaction
  const isUserInteracting = useRef(false);
  const modalJustClosed = useRef(false);

  // Calculate markers based on granularity
  const markers = useMemo(() => {
    const result: TimelineMarker[] = [];
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    // If we have a focused date, use it as a reference point instead of now
    const referenceDate = focusedDate || now;

    // Calculate date range based on granularity
    switch (granularity) {
      case 'hours':
        startDate = new Date(referenceDate);
        // For hours, center around the focused day and hour
        if (focusedDate) {
          startDate = new Date(
            focusedDate.getFullYear(), 
            focusedDate.getMonth(), 
            focusedDate.getDate(),
            Math.max(0, focusedDate.getHours() - 12)
          );
          endDate = new Date(
            focusedDate.getFullYear(), 
            focusedDate.getMonth(), 
            focusedDate.getDate(),
            Math.min(23, focusedDate.getHours() + 12)
          );
        } else {
          startDate.setHours(startDate.getHours() - 12);
          endDate = new Date(referenceDate);
          endDate.setHours(endDate.getHours() + 12);
        }
        break;
      case 'days':
        // For days, if we have a focused date, center around the focused month
        if (focusedDate) {
          const daysInMonth = new Date(
            focusedDate.getFullYear(), 
            focusedDate.getMonth() + 1, 
            0
          ).getDate();
          
          startDate = new Date(
            focusedDate.getFullYear(), 
            focusedDate.getMonth(), 
            1
          );
          endDate = new Date(
            focusedDate.getFullYear(), 
            focusedDate.getMonth(), 
            daysInMonth
          );
        } else {
          startDate = new Date(referenceDate);
          startDate.setDate(startDate.getDate() - 15);
          endDate = new Date(referenceDate);
          endDate.setDate(endDate.getDate() + 15);
        }
        break;
      case 'weeks':
        startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - 28);
        endDate = new Date(referenceDate);
        endDate.setDate(endDate.getDate() + 28);
        break;
      case 'months':
        startDate = new Date(referenceDate);
        // If coming from a year view, set to January of that year
        if (focusedDate && granularity === 'months') {
          startDate = new Date(focusedDate.getFullYear(), 0, 1);
          endDate = new Date(focusedDate.getFullYear(), 11, 31);
        } else {
          startDate.setMonth(startDate.getMonth() - 6);
          endDate = new Date(referenceDate);
          endDate.setMonth(endDate.getMonth() + 6);
        }
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
      const currentMarkerDate = new Date(markerDate); // Create a copy of the current date before incrementing
      
      const isCurrent = currentMarkerDate.getFullYear() === now.getFullYear() &&
                       currentMarkerDate.getMonth() === now.getMonth() &&
                       currentMarkerDate.getDate() === now.getDate() &&
                       (granularity !== 'hours' || currentMarkerDate.getHours() === now.getHours());

      // Check if this marker corresponds to our focused date
      const isFocused = focusedDate && 
                        currentMarkerDate.getFullYear() === focusedDate.getFullYear() && 
                        (granularity === 'years' || currentMarkerDate.getMonth() === focusedDate.getMonth()) &&
                        (granularity === 'years' || granularity === 'months' || currentMarkerDate.getDate() === focusedDate.getDate()) &&
                        (granularity === 'years' || granularity === 'months' || granularity === 'days' || granularity === 'weeks' || 
                         currentMarkerDate.getHours() === focusedDate.getHours());

      let label = '';
      let increment = 1;
      
      switch (granularity) {
        case 'hours':
          label = currentMarkerDate.toLocaleTimeString([], { hour: 'numeric' });
          markerDate.setHours(markerDate.getHours() + increment);
          break;
        case 'days':
          label = currentMarkerDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
          markerDate.setDate(markerDate.getDate() + increment);
          break;
        case 'weeks':
          label = `Week ${Math.ceil(currentMarkerDate.getDate() / 7)}`;
          markerDate.setDate(markerDate.getDate() + 7);
          break;
        case 'months':
          label = currentMarkerDate.toLocaleDateString([], { month: 'short' });
          markerDate.setMonth(markerDate.getMonth() + increment);
          break;
        case 'years':
          label = currentMarkerDate.getFullYear().toString();
          markerDate.setFullYear(markerDate.getFullYear() + increment);
          break;
      }

      result.push({
        id: id++,
        date: currentMarkerDate,
        label,
        isCurrent,
        granularity
      });
    }

    return result;
  }, [birthdate, granularity, focusedDate]);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync('events');
      if (saved) {
        setEvents(JSON.parse(saved));
      }
    })();
  }, []);

  // Effect for the modal closed state
  useEffect(() => {
    if (modalJustClosed.current) {
      modalJustClosed.current = false;
    }
  }, [showEventModal]);

  // Scroll to focused date or current date when granularity changes
  useEffect(() => {
    // Don't auto-scroll when modal just closed or user is interacting
    if (scrollViewRef.current && !isUserInteracting.current && !modalJustClosed.current) {
      // If we have a focused date, try to find a marker that matches it
      let targetMarkerIndex = -1;
      
      if (focusedDate) {
        targetMarkerIndex = markers.findIndex(marker => {
          const markerDate = marker.date;
          
          // Match based on granularity
          if (granularity === 'years') {
            return markerDate.getFullYear() === focusedDate.getFullYear();
          } else if (granularity === 'months') {
            return markerDate.getMonth() === focusedDate.getMonth() && 
                   markerDate.getFullYear() === focusedDate.getFullYear();
          } else if (granularity === 'weeks') {
            // For weeks, compare the week number within the month
            const markerWeek = Math.ceil(markerDate.getDate() / 7);
            const focusedWeek = Math.ceil(focusedDate.getDate() / 7);
            return markerWeek === focusedWeek && 
                   markerDate.getMonth() === focusedDate.getMonth() && 
                   markerDate.getFullYear() === focusedDate.getFullYear();
          } else if (granularity === 'days') {
            return markerDate.getDate() === focusedDate.getDate() &&
                   markerDate.getMonth() === focusedDate.getMonth() && 
                   markerDate.getFullYear() === focusedDate.getFullYear();
          } else { // hours
            return markerDate.getHours() === focusedDate.getHours() &&
                   markerDate.getDate() === focusedDate.getDate() &&
                   markerDate.getMonth() === focusedDate.getMonth() && 
                   markerDate.getFullYear() === focusedDate.getFullYear();
          }
        });
      }
      
      // If no focused date or couldn't find matching marker, fall back to current date
      if (targetMarkerIndex === -1) {
        targetMarkerIndex = markers.findIndex(marker => marker.isCurrent);
      }
      
      if (targetMarkerIndex !== -1) {
        // Add a small delay to ensure the scroll happens after rendering
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: targetMarkerIndex * 80, // Approximate width of marker
              animated: true
            });
          }
        }, 50);
      }
    }
  }, [granularity, markers, focusedDate]);

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

  // Function to handle granularity change when a zoom button is clicked
  const handleZoomChange = useCallback((newGranularity: Granularity) => {
    isUserInteracting.current = true;
    setGranularity(newGranularity);
    
    // Reset the flag after a short delay to allow for animations
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 500);
  }, []);

  const handleEventSave = useCallback(async (text: string) => {
    if (selectedDate && text.trim()) {
      await saveEvent(selectedDate, text);
    }
    modalJustClosed.current = true;
    setShowEventModal(false);
    setSelectedDate(null);
  }, [selectedDate, saveEvent]);

  // Handle marker press - set focused date and show event modal
  const handleMarkerPress = useCallback((date: Date) => {
    isUserInteracting.current = true;
    setSelectedDate(date);
    setFocusedDate(date);
    setShowEventModal(true);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 500);
  }, []);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.zoomControls}>
        {Object.values(ZOOM_LEVELS).map((level) => (
          <Button
            key={level.value}
            mode={granularity === level.value ? "contained" : "outlined"}
            onPress={() => handleZoomChange(level.value)}
            style={styles.zoomButton}
            labelStyle={styles.zoomButtonLabel}
          >
            {level.label}
          </Button>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          removeClippedSubviews={true}
          onScrollBeginDrag={() => {
            isUserInteracting.current = true;
          }}
          onScrollEndDrag={() => {
            setTimeout(() => {
              isUserInteracting.current = false;
            }, 500);
          }}
        >
          {markers.map((marker) => {
            // Check if this marker corresponds to our focused date
            const isFocused = focusedDate && 
                             marker.date.getFullYear() === focusedDate.getFullYear() && 
                             (granularity === 'years' || marker.date.getMonth() === focusedDate.getMonth()) &&
                             (granularity === 'years' || granularity === 'months' || 
                              marker.date.getDate() === focusedDate.getDate()) &&
                             (granularity === 'years' || granularity === 'months' || 
                              granularity === 'days' || granularity === 'weeks' || 
                              marker.date.getHours() === focusedDate.getHours());
            
            return (
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
                    isFocused && styles.focusedMarker,
                  ]}
                />
                <Text
                  variant="labelSmall"
                  style={[
                    styles.markerLabel,
                    { color: theme.colors.onBackground },
                    marker.isCurrent && styles.currentLabel,
                    isFocused && styles.focusedLabel,
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
            );
          })}
        </ScrollView>
        <EventModal
          visible={showEventModal}
          onSave={handleEventSave}
          onClose={() => {
            modalJustClosed.current = true;
            setShowEventModal(false);
            setSelectedDate(null);
            // We intentionally don't reset focusedDate here to maintain position context
          }}
          date={selectedDate || undefined}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250, // Increased height to accommodate zoom buttons
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
  focusedMarker: {
    backgroundColor: 'blue',
    height: 50,
  },
  focusedLabel: {
    color: 'blue',
    fontWeight: 'bold',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  zoomButton: {
    marginHorizontal: 4,
    padding: 0,
  },
  zoomButtonLabel: {
    fontSize: 10,
    marginHorizontal: 4,
  }
});