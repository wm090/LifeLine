import React, { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText?: string;
  date?: Date;
}

export default function EventModal({ 
  visible, 
  onClose, 
  onSave, 
  initialText = '', 
  date 
}: EventModalProps) {
  const theme = useTheme();
  const [text, setText] = useState(initialText);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
      setText('');
    }
  };

  const handleClose = () => {
    setText(initialText);
    onClose();
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={[styles.centeredView, { backgroundColor: theme.colors.backdrop }]}>
        <View style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineSmall" style={styles.title}>
            {initialText ? 'Edit Event' : 'Add Event'}
          </Text>
          {date && (
            <Text variant="bodyLarge" style={styles.dateText}>
              {formatDate(date)}
            </Text>
          )}
          <TextInput
            label="Event"
            value={text}
            onChangeText={setText}
            style={styles.input}
            multiline
            mode="outlined"
          />
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={handleClose} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.button}>
              Save
            </Button>
          </View>
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
  dateText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    minWidth: 100,
  },
});