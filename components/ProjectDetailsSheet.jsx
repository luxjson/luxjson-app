import { Modal, Pressable, ScrollView, StyleSheet, View, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText, DisplayText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { openExternal } from '../lib/external';

export default function ProjectDetailsSheet({ project, visible, onClose, onInsomnia }) {
  const { theme } = useTheme();
  const { t, locale } = useLanguage();
  if (!project) return null;

  const updated = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString(locale)
    : '—';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <AppText muted style={[styles.eyebrow, { color: theme.primary }]}>{t.project}</AppText>
              <DisplayText style={styles.title}>{project.name.replace(/-/g, ' ')}</DisplayText>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
              <MaterialIcons name="close" size={25} color={theme.onSurface} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            <Image source={{ uri: `https://opengraph.githubassets.com/1/${project.full_name}` }} style={styles.image} />
            <AppText muted style={styles.description}>
              {project.description || t.descriptionUnavailable}
            </AppText>

            <View style={styles.stats}>
              <Stat icon="star" value={project.stargazers_count || 0} label={t.stars} theme={theme} />
              <Stat icon="fork-right" value={project.forks_count || 0} label={t.forks} theme={theme} />
              <Stat icon="bug-report" value={project.open_issues_count || 0} label={t.issues} theme={theme} />
            </View>

            <View style={[styles.metaCard, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
              <Row label={t.languageField} value={project.language || 'Code'} theme={theme} />
              <Row label={t.updated} value={updated} theme={theme} />
            </View>

            <Pressable
              onPress={() => project.name.toLowerCase().includes('insomnia') ? onInsomnia() : openExternal(project.html_url)}
              style={({ pressed }) => [styles.primary, { backgroundColor: theme.primary }, pressed && styles.pressed]}
            >
              <AppText style={{ color: theme.onPrimary, fontWeight: '700' }}>
                {project.name.toLowerCase().includes('insomnia') ? t.openInsomnia : t.openProject}
              </AppText>
              <MaterialIcons name="open-in-new" size={20} color={theme.onPrimary} />
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Stat({ icon, value, label, theme }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.surfaceVariant }]}>
      <MaterialIcons name={icon} size={20} color={theme.primary} />
      <DisplayText style={styles.statValue}>{String(value)}</DisplayText>
      <AppText muted style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

function Row({ label, value, theme }) {
  return <View style={styles.row}><AppText muted>{label}</AppText><AppText style={styles.rowValue}>{value}</AppText></View>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.62)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontFamily: 'LuxPoppinsBold' },
  title: { fontSize: 30, lineHeight: 35, marginTop: 3, textTransform: 'capitalize' },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  body: { gap: 16, paddingBottom: 28 },
  image: { width: '100%', height: 190, borderRadius: 22, backgroundColor: '#222' },
  description: { fontSize: 15, lineHeight: 23 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 20, padding: 13, gap: 4 },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 11 },
  metaCard: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  rowValue: { fontWeight: '700', textAlign: 'right' },
  primary: { minHeight: 54, borderRadius: 27, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
});
