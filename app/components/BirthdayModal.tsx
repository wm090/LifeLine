import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BirthdayModalProps {
  visible: boolean;
  onSave: (date: Date) => void;
}

export default function BirthdayModal({ visible, onSave }: BirthdayModalProps) {
  const theme = useTheme();
  const [date, setDate] = useState(new Date());

  // Set initial date to 30 years ago
  useState(() => {
    const initialDate = new Date();
    initialDate.setFullYear(initialDate.getFullYear() - 30);
    setDate(initialDate);
  });

  const handleChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    onSave(date);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={[styles.centeredView, { backgroundColor: theme.colors.backdrop }]}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to LifeLine!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Please enter your birthdate to get started:
          </Text>
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChange}
            maximumDate={new Date()}
          />
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            Save
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    minWidth: 120,
  },
});