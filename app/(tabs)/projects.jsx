import { FlatList, StyleSheet, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import SectionHeader from '../../components/SectionHeader';
import LoadingView from '../../components/LoadingView';
import ProjectCard from '../../components/ProjectCard';
import ProjectDetailsSheet from '../../components/ProjectDetailsSheet';
import { AppText, DisplayText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchGithubProfile,
  getGithubConnection,
} from '../../lib/github';
import { openExternal } from '../../lib/external';
import BrandIconButton from '../../components/BrandIconButton';
import IconButton from '../../components/IconButton';
import InfoSheet from '../../components/InfoSheet';

export default function Projects() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [repos, setRepos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [info, setInfo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const username = await getGithubConnection();
      const result = await fetchGithubProfile(username);

      setProfile(result?.profile ?? null);

      setRepos(
        Array.isArray(result?.repos)
          ? result.repos
              .filter((repo) => !repo.fork)
              .sort(
                (a, b) =>
                  new Date(b?.pushed_at || 0).getTime() -
                  new Date(a?.pushed_at || 0).getTime()
              )
          : []
      );
    } catch {
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderFooter = () => (
    <View style={styles.footer}>
      <DisplayText style={styles.socialTitle}>
        {t.appName}
      </DisplayText>

      <AppText muted style={styles.footerDescription}>
        {t.homeShort}
      </AppText>

      <View style={styles.socialRow}>
        <BrandIconButton
          icon="github"
          onPress={() =>
            openExternal('https://github.com/luxjson')
          }
          accessibilityLabel="GitHub"
        />

        <BrandIconButton
          icon="instagram"
          onPress={() =>
            openExternal('https://instagram.com/luxjson')
          }
          accessibilityLabel="Instagram"
        />

        <BrandIconButton
          icon="linkedin"
          onPress={() =>
            openExternal(
              'https://www.linkedin.com/company/luxjson'
            )
          }
          accessibilityLabel="LinkedIn"
        />

        <IconButton
          icon="info-outline"
          onPress={() => setInfo(true)}
          accessibilityLabel={t.info}
        />
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={repos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AppHeader title={t.projects} />

            <SectionHeader
              title={t.projects}
              description={t.projectsDesc}
            />

            {profile ? (
              <View
                style={[
                  styles.stats,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.surfaceVariant,
                  },
                ]}
              >
                <Stat
                  label={t.repositories}
                  value={profile?.public_repos}
                  theme={theme}
                />

                <Stat
                  label={t.followers}
                  value={profile?.followers}
                  theme={theme}
                />

                <Stat
                  label={t.following}
                  value={profile?.following}
                  theme={theme}
                />
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loading}>
              <LoadingView label={t.loadingProjects} />
            </View>
          ) : (
            <View style={styles.empty}>
              <MaterialIcons
                name="code-off"
                size={42}
                color={theme.onSurfaceVariant}
              />
              <AppText muted>{t.noProjects}</AppText>
            </View>
          )
        }
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <ProjectCard
            repo={item}
            onPress={() => setSelected(item)}
          />
        )}
      />

      <ProjectDetailsSheet
        visible={!!selected}
        project={selected}
        onClose={() => setSelected(null)}
      />

      <InfoSheet
        visible={info}
        onClose={() => setInfo(false)}
      />
    </Screen>
  );
}

function Stat({ label, value, theme }) {
  return (
    <View style={styles.stat}>
      <AppText muted style={styles.statLabel}>
        {label}
      </AppText>

      <AppText
        style={{
          color: theme.onSurface,
          fontFamily: 'LuxFirsNeue',
          fontSize: 24,
          lineHeight: 29,
        }}
      >
        {String(value ?? 0)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 130,
  },

  stats: {
    borderWidth: 1,
    borderRadius: 1600,
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },

  stat: {
    flex: 1,
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  loading: {
    height: 220,
  },

  empty: {
    alignItems: 'center',
    gap: 12,
    padding: 45,
  },

  footer: {
    alignItems: 'center',
    gap: 7,
    paddingVertical: 16,
    marginTop: 4,
  },

  socialTitle: {
    fontSize: 31,
  },

  footerDescription: {
    textAlign: 'center',
  },

  socialRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 6,
  },
});