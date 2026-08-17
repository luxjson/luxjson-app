import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useState } from 'react';
import { AppText, DisplayText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { sendContactEmail } from '../lib/email';
import { useLanguage } from '../context/LanguageContext';

export default function ContactSheet({ visible, onClose }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const submit = async () => {
    if (!form.name || !form.email || !form.message) { setStatus(t.requiredContact); return; }
    setStatus(t.sending);
    try { await sendContactEmail({ name: form.name, email: form.email, subject: form.subject, message: form.message }); setStatus(t.sent); setForm({ name: '', email: '', subject: '', message: '' }); }
    catch { setStatus(t.sendError); }
  };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}><View style={[styles.sheet, { backgroundColor: theme.surface }]}>
      <View style={styles.header}><DisplayText style={styles.title}>{t.contactTitle}</DisplayText><Pressable onPress={onClose}><MaterialIcons name="close" size={28} color={theme.onSurface} /></Pressable></View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {['name','email','subject'].map(key => <TextInput key={key} value={form[key]} onChangeText={value => setForm(p => ({ ...p, [key]: value }))} placeholder={key === 'name' ? t.name : key === 'email' ? t.email : t.subject} placeholderTextColor={theme.onSurfaceVariant} style={[styles.input, { color: theme.onSurface, borderColor: theme.surfaceVariant, backgroundColor: theme.card }]} autoCapitalize="none" />)}
        <TextInput multiline value={form.message} onChangeText={value => setForm(p => ({ ...p, message: value }))} placeholder={t.message} placeholderTextColor={theme.onSurfaceVariant} style={[styles.input, styles.message, { color: theme.onSurface, borderColor: theme.surfaceVariant, backgroundColor: theme.card }]} />
        {status ? <AppText muted style={styles.status}>{status}</AppText> : null}
        <Pressable onPress={submit} style={({ pressed }) => [styles.button, { backgroundColor: theme.primary }, pressed && { opacity: 0.85 }]}><AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>{t.send}</AppText></Pressable>
      </ScrollView>
    </View></View>
  </Modal>;
}
const styles = StyleSheet.create({ overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.62)', justifyContent: 'flex-end' }, sheet: { maxHeight: '92%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, title: { fontSize: 27 }, body: { gap: 12, paddingBottom: 30 }, input: { minHeight: 52, borderWidth: 1, borderRadius: 18, paddingHorizontal: 16, fontFamily: 'LuxFirsNeue' }, message: { minHeight: 140, paddingTop: 14, textAlignVertical: 'top' }, status: { textAlign: 'center', fontSize: 13 }, button: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' } });
