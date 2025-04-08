import React, { ReactNode } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ResponsiveContainerProps {
  children: ReactNode;
  scrollable?: boolean;
}

export default function ResponsiveContainer({ 
  children, 
  scrollable = false 
}: ResponsiveContainerProps) {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const isTablet = width > 768;
  
  const containerStyle = {
    backgroundColor: theme.colors.background,
    maxWidth: isTablet ? 768 : '100%',
    width: '100%',
  };

  const content = (
    <View 
      style={[styles.container, containerStyle]}
    >
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollViewContent}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    height: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
});