import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { AppText, DisplayText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { openExternal } from '../lib/external';

export default function InfoSheet({ visible, onClose }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceVariant }]}>
          <View style={styles.header}>
            <View style={[styles.icon, { backgroundColor: theme.primaryContainer }]}>
              <MaterialIcons name="info" size={24} color={theme.primary} />
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={25} color={theme.onSurface} />
            </Pressable>
          </View>
          <DisplayText style={styles.title}>luxjson</DisplayText>
          <AppText muted style={styles.text}>{t.infoText}</AppText>
          <View style={[styles.version, { backgroundColor: theme.primaryContainer }]}>
            <AppText style={{ color: theme.primary, fontWeight: '700' }}>v1.0.0 · Android</AppText>
          </View>
          <Pressable onPress={() => openExternal('https://github.com/luxjson/luxjson-app')} style={[styles.button, { backgroundColor: theme.primary }]}>
            <AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>{t.repository}</AppText>
            <MaterialIcons name="open-in-new" size={19} color={theme.onPrimary} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.62)', justifyContent: 'center', padding: 18 },
  card: { borderWidth: 1, borderRadius: 30, padding: 22, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 38 },
  text: { fontSize: 14, lineHeight: 21 },
  version: { alignSelf: 'flex-start', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  button: { minHeight: 52, borderRadius: 26, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
