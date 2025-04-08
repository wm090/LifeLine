import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import Timeline from "./components/Timeline";
import BirthdayModal from "./components/BirthdayModal";
import { ThemeProvider, useThemeToggle } from "./contexts/ThemeContext";
import ResponsiveContainer from "./components/ResponsiveContainer";
import LoadingIndicator from "./components/LoadingIndicator";
import { Button } from "react-native-paper";

function AppContent() {
  const [birthdate, setBirthdate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { toggleTheme } = useThemeToggle();

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync("birthdate");
      if (saved) {
        setBirthdate(new Date(saved));
      } else {
        setShowModal(true);
      }
    })();
  }, []);

  const handleSaveBirthdate = async (date) => {
    await SecureStore.setItemAsync("birthdate", date.toISOString());
    setBirthdate(date);
    setShowModal(false);
  };

  if (!birthdate && !showModal) {
    return <LoadingIndicator />;
  }

  return (
    <ResponsiveContainer>
      <View style={styles.header}>
        <Button mode="contained" onPress={toggleTheme}>
          Toggle Theme
        </Button>
      </View>
      {birthdate && <Timeline birthdate={birthdate} />}
      <BirthdayModal visible={showModal} onSave={handleSaveBirthdate} />
    </ResponsiveContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
});
