import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { AppText } from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../constants/config';

const ROUTES = [
  {
    method: 'GET',
    endpoint: '/blog/posts',
    display: '/blog/posts',
  },
  {
    method: 'GET',
    endpoint: '/blog/posts/welcome-to-the-blog',
    display: '/blog/posts/:slug',
  },
  {
    method: 'GET',
    endpoint: '/health',
    display: '/health',
  },
];

export default function ServerStatusCard() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [status, setStatus] = useState('checking');
  const [routes, setRoutes] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [latency, setLatency] = useState(null);

  const request = async (route) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const started = Date.now();

    try {
      const response = await fetch(`${API_URL}${route.endpoint}`, {
        method: route.method,
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      const elapsed = Date.now() - started;

      const live =
        response.status >= 200 &&
        response.status < 500;

      return {
        ...route,
        status: live ? 'live' : 'down',
        code: response.status,
        latency: elapsed,
      };
    } catch {
      return {
        ...route,
        status: 'down',
        code: null,
        latency: null,
      };
    } finally {
      clearTimeout(timer);
    }
  };

  const check = useCallback(async () => {
    setStatus('checking');
    setRoutes([]);
    setLatency(null);

    const started = Date.now();

    try {
      const results = await Promise.all(
        ROUTES.map((route) => request(route))
      );

      setRoutes(results);

      const failed = results.some(
        (route) => route.status === 'down'
      );

      setStatus(failed ? 'down' : 'live');
      setLatency(Date.now() - started);
    } catch {
      setRoutes([]);
      setStatus('down');
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const checking = status === 'checking';
  const live = status === 'live';

  const color = checking
    ? theme.onSurfaceVariant
    : live
      ? theme.success
      : theme.error;

  const label = checking
    ? t.checking
    : live
      ? t.live
      : t.down;

  const workingRoutes = routes.filter(
    (route) => route.status === 'live'
  ).length;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.surfaceVariant,
        },
      ]}
    >
      <View style={styles.top}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: checking
                ? theme.surfaceVariant
                : live
                  ? `${theme.success}20`
                  : `${theme.error}18`,
            },
          ]}
        >
          {checking ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
            />
          ) : (
            <MaterialIcons
              name={live ? 'cloud-done' : 'cloud-off'}
              size={22}
              color={color}
            />
          )}
        </View>

        <View style={styles.copy}>
          <AppText style={styles.title}>
            {t.serverStatus}
          </AppText>

          <AppText muted style={styles.endpoint}>
            {t.serverEndpoint}
          </AppText>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${color}18`,
            },
          ]}
        >
          <View
            style={[
              styles.dot,
              {
                backgroundColor: color,
              },
            ]}
          />

          <AppText
            style={{
              color,
              fontSize: 11,
            }}
          >
            {label}
          </AppText>
        </View>
      </View>

      <View style={styles.bottom}>
        <AppText
          muted
          style={styles.description}
        >
          {checking
            ? t.checking
            : `${workingRoutes}/${routes.length} ${t.routesChecked || 'rotas OK'}`}
        </AppText>

        {latency !== null ? (
          <AppText muted style={styles.latency}>
            {latency} ms
          </AppText>
        ) : null}

        <Pressable
          onPress={check}
          hitSlop={8}
          accessibilityLabel={t.refresh}
        >
          <MaterialIcons
            name="refresh"
            size={20}
            color={theme.primary}
          />
        </Pressable>

        <Pressable
          onPress={() => setExpanded((value) => !value)}
          hitSlop={8}
          accessibilityLabel={
            expanded
              ? t.hideRoutes
              : t.showRoutes
          }
        >
          <MaterialIcons
            name={
              expanded
                ? 'keyboard-arrow-up'
                : 'keyboard-arrow-down'
            }
            size={22}
            color={theme.primary}
          />
        </Pressable>
      </View>

      {expanded ? (
        <View
          style={[
            styles.routes,
            {
              borderTopColor: theme.surfaceVariant,
            },
          ]}
        >
          {routes.map((route) => {
            const routeLive = route.status === 'live';

            return (
              <View
                key={`${route.method}-${route.endpoint}`}
                style={[
                  styles.route,
                  {
                    backgroundColor:
                      `${theme.surfaceVariant}35`,
                  },
                ]}
              >
                <View style={styles.routeStatus}>
                  <View
                    style={[
                      styles.routeDot,
                      {
                        backgroundColor: routeLive
                          ? theme.success
                          : theme.error,
                      },
                    ]}
                  />

                  <AppText
                    style={[
                      styles.routeEndpoint,
                      {
                        color: theme.onSurface,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {route.display}
                  </AppText>
                </View>

                <AppText
                  style={{
                    color: routeLive
                      ? theme.success
                      : theme.error,
                    fontSize: 10,
                    fontWeight: '700',
                  }}
                >
                  {routeLive ? t.live : t.down}
                </AppText>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 17,
    gap: 13,
  },

  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  copy: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 15,
  },

  endpoint: {
    fontSize: 11,
  },

  badge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  description: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },

  latency: {
    fontSize: 10,
  },

  routes: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 7,
  },

  route: {
    minHeight: 42,
    borderRadius: 13,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  routeStatus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  routeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  routeEndpoint: {
    flex: 1,
    fontSize: 11,
  },
});