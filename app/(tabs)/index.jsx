import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import BrandIconButton from '../../components/BrandIconButton';
import IconButton from '../../components/IconButton';
import InfoSheet from '../../components/InfoSheet';
import { AppText, DisplayText } from '../../components/AppText';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { openExternal } from '../../lib/external';
import { fetchGithubProfile, getGithubConnection } from '../../lib/github';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [info, setInfo] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const username = await getGithubConnection();
      const result = await fetchGithubProfile(username);

      setProfile(result.profile);

      setRepos(
        Array.isArray(result.repos)
          ? result.repos
              .filter((repo) => !repo.fork)
              .sort(
                (a, b) =>
                  new Date(b.pushed_at).getTime() -
                  new Date(a.pushed_at).getTime()
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

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <AppHeader title={t.appName} />

        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.primaryContainer,
            },
          ]}
        >
          <View style={styles.heroContent}>
            <DisplayText style={styles.heroTitle}>
              {t.hero}
            </DisplayText>

            <AppText muted style={styles.heroDesc}>
              {t.desc}
            </AppText>

            <Pressable
              onPress={() => router.push('/(tabs)/projects')}
              style={({ pressed }) => [
                styles.primary,
                {
                  backgroundColor: theme.primary,
                },
                pressed && styles.pressed,
              ]}
            >
              <AppText
                style={{
                  color: theme.onPrimary,
                  fontWeight: '700',
                }}
              >
                {t.projects}
              </AppText>

              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={theme.onPrimary}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <DisplayText style={styles.sectionTitle}>
              {t.quickAccess}
            </DisplayText>
          </View>
        </View>

        <View style={styles.grid}>
          <Quick
            icon="code"
            title={t.projects}
            desc={t.projectsDesc}
            onPress={() => router.push('/(tabs)/projects')}
            theme={theme}
          />

          <Quick
            icon="people"
            title={t.community}
            desc={t.communityDesc}
            onPress={() => router.push('/(tabs)/community')}
            theme={theme}
          />

          <Quick
            icon="article"
            title={t.blog}
            desc={t.blogDesc}
            onPress={() => router.push('/(tabs)/blog')}
            theme={theme}
          />

          <Quick
            icon="tune"
            title={t.settings}
            desc={t.settingsDesc}
            onPress={() => router.push('/(tabs)/settings')}
            theme={theme}
          />
        </View>

        <View
          style={[
            styles.overview,
            {
              backgroundColor: theme.card,
              borderColor: theme.surfaceVariant,
            },
          ]}
        >
          <View style={styles.overviewHeader}>
            <View style={styles.overviewHeaderText}>
              <DisplayText style={styles.overviewTitle}>
                {t.builtWithPurpose}
              </DisplayText>
            </View>

            <View
              style={[
                styles.overviewIcon,
                {
                  backgroundColor: theme.primaryContainer,
                },
              ]}
            >
              <MaterialIcons
                name="auto-awesome"
                size={23}
                color={theme.primary}
              />
            </View>
          </View>

          <AppText muted style={styles.overviewDescription}>
            {t.overviewDesc}
          </AppText>

          {/* SOMENTE 2 CARDS */}
          <View style={styles.statsGrid}>
            <Stat
              icon="code"
              value={profile?.public_repos ?? 0}
              label={t.projectsStat}
              theme={theme}
            />

            <Stat
              icon="article"
              value="03"
              label={t.postsStat}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <DisplayText style={styles.sectionTitle}>
              {t.ideasIntoReality}
            </DisplayText>
          </View>
        </View>

        <View style={styles.buildList}>
          <BuildItem
            icon="terminal"
            title={t.software}
            description={t.softwareDesc}
            number="01"
            theme={theme}
          />

          <BuildItem
            icon="people"
            title={t.communityBuild}
            description={t.communityBuildDesc}
            number="02"
            theme={theme}
          />

          <BuildItem
            icon="language"
            title={t.web}
            description={t.webDesc}
            number="03"
            theme={theme}
          />
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/projects')}
          style={({ pressed }) => [
            styles.featured,
            {
              backgroundColor: theme.onSurface,
            },
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.featuredTop}>
            <View
              style={[
                styles.featuredIcon,
                {
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <MaterialIcons
                name="rocket-launch"
                size={23}
                color={theme.onPrimary}
              />
            </View>

            <MaterialIcons
              name="arrow-outward"
              size={22}
              color={theme.surface}
            />
          </View>

          <DisplayText
            style={[
              styles.featuredTitle,
              {
                color: theme.surface,
              },
            ]}
          >
            {t.seeWhatBuilding}
          </DisplayText>

          <AppText
            style={[
              styles.featuredDescription,
              {
                color: theme.surfaceVariant,
              },
            ]}
          >
            {t.featuredDesc}
          </AppText>

          <View
            style={[
              styles.featuredLine,
              {
                backgroundColor: theme.surfaceVariant,
              },
            ]}
          />
        </Pressable>

        <View style={styles.footer}>
          <DisplayText style={styles.socialTitle}>
            {t.appName}
          </DisplayText>

          <AppText
            muted
            style={styles.footerDescription}
          >
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
      </ScrollView>

      <InfoSheet
        visible={info}
        onClose={() => setInfo(false)}
      />
    </Screen>
  );
}

function Quick({
  icon,
  title,
  desc,
  onPress,
  theme,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quick,
        {
          backgroundColor: theme.card,
          borderColor: theme.surfaceVariant,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.quickIcon,
          {
            backgroundColor: theme.primaryContainer,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={21}
          color={theme.primary}
        />
      </View>

      <AppText style={styles.quickTitle}>
        {title}
      </AppText>

      <AppText
        muted
        numberOfLines={2}
        style={styles.quickDesc}
      >
        {desc}
      </AppText>

      <View style={styles.quickArrow}>
        <MaterialIcons
          name="arrow-outward"
          size={18}
          color={theme.primary}
        />
      </View>
    </Pressable>
  );
}

function Stat({
  icon,
  value,
  label,
  theme,
}) {
  return (
    <View
      style={[
        styles.stat,
        {
          borderColor: theme.surfaceVariant,
        },
      ]}
    >
      <View style={styles.statTop}>
        <MaterialIcons
          name={icon}
          size={17}
          color={theme.primary}
        />

        <AppText muted style={styles.statLabel}>
          {label}
        </AppText>
      </View>

      <DisplayText style={styles.statValue}>
        {value}
      </DisplayText>
    </View>
  );
}

function BuildItem({
  icon,
  title,
  description,
  number,
  theme,
}) {
  return (
    <View
      style={[
        styles.buildItem,
        {
          borderBottomColor: theme.surfaceVariant,
        },
      ]}
    >
      <View
        style={[
          styles.buildIcon,
          {
            backgroundColor: theme.primaryContainer,
          },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={21}
          color={theme.primary}
        />
      </View>

      <View style={styles.buildContent}>
        <AppText style={styles.buildTitle}>
          {title}
        </AppText>

        <AppText
          muted
          style={styles.buildDescription}
        >
          {description}
        </AppText>
      </View>

      <AppText muted style={styles.buildNumber}>
        {number}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 125,
    gap: 22,
  },

  hero: {
    borderRadius: 32,
    padding: 24,
    minHeight: 350,
    justifyContent: 'flex-end',
    gap: 14,
    overflow: 'hidden',
  },

  heroContent: {
    gap: 12,
  },

  heroBadge: {
    position: 'absolute',
    top: 22,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
  },

  heroBadgeText: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
  },

  eyebrow: {
    letterSpacing: 2,
    fontSize: 12,
  },

  heroTitle: {
    fontSize: 42,
    lineHeight: 45,
  },

  heroDesc: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
  },

  primary: {
    minHeight: 54,
    borderRadius: 27,
    paddingHorizontal: 20,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  sectionEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 27,
    lineHeight: 31,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  quick: {
    width: '48%',
    minHeight: 165,
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    gap: 8,
  },

  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickTitle: {
    fontSize: 17,
  },

  quickDesc: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },

  quickArrow: {
    alignSelf: 'flex-end',
  },

  overview: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 21,
    gap: 16,
  },

  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  overviewHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

  overviewTitle: {
    fontSize: 27,
    lineHeight: 31,
  },

  overviewIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewDescription: {
    fontSize: 13,
    lineHeight: 20,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 9,
  },

  stat: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 13,
    minHeight: 91,
    justifyContent: 'space-between',
  },

  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  statLabel: {
    fontSize: 11,
  },

  statValue: {
    fontSize: 27,
    lineHeight: 29,
  },

  buildList: {
    gap: 0,
  },

  buildItem: {
    minHeight: 88,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  buildIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buildContent: {
    flex: 1,
    gap: 3,
  },

  buildTitle: {
    fontSize: 16,
  },

  buildDescription: {
    fontSize: 12,
    lineHeight: 17,
  },

  buildNumber: {
    fontSize: 11,
  },

  featured: {
    borderRadius: 30,
    padding: 22,
    minHeight: 230,
    justifyContent: 'space-between',
    gap: 15,
  },

  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  featuredTitle: {
    fontSize: 31,
    lineHeight: 35,
    maxWidth: 300,
  },

  featuredDescription: {
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 310,
  },

  featuredLine: {
    height: 1,
    width: '100%',
    opacity: 0.35,
  },

  footer: {
    alignItems: 'center',
    gap: 7,
    marginTop: 20,
    paddingVertical: 16,
  },

  socialTitle: {
    fontSize: 31,
  },

  footerDescription: {
    textAlign: 'center',
    maxWidth: 290,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 6,
  },

  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
});