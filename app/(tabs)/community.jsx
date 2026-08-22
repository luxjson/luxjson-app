import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { confirmAlert, showAlert } from '../../lib/ui';

import Screen from '../../components/Screen';
import AppHeader from '../../components/AppHeader';
import LoadingView from '../../components/LoadingView';
import { AppText, DisplayText } from '../../components/AppText';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

import {
  fetchPosts,
  createPost,
  likePost,
  reportPost,
  deletePost,
} from '../../lib/communityApi';

const relative = (date, locale, t) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  if (
    diff < 86400000 &&
    d.toDateString() === now.toDateString()
  ) {
    return `${t.todayAt} ${d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === yesterday.toDateString()) {
    return t.yesterday;
  }

  return d.toLocaleDateString(locale);
};

export default function Community() {
  const { theme } = useTheme();
  const { t, locale } = useLanguage();

  const {
    currentUser,
    userRole,
    isUserAuthenticated,
    isAuthenticated,
  } = useAuth();

  const router = useRouter();

  const logged = Boolean(
    isUserAuthenticated || isAuthenticated
  );

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetchPosts();

      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const publish = async () => {
    const text = content.trim();

    if (!text || text.length > 500) {
      return;
    }

    setBusy(true);

    try {
      const response = await createPost(text);

      if (!response.success) {
        showAlert(
          t.error,
          response.message || t.publishError
        );
        return;
      }

      setContent('');
      setModal(false);

      await load();
    } catch (error) {
      console.error('Erro ao publicar:', error);

      showAlert(
        t.error,
        t.publishError
      );
    } finally {
      setBusy(false);
    }
  };

  const actLike = async (post) => {
    if (!logged) {
      router.push('/login');
      return;
    }

    try {
      const response = await likePost(post.id);

      if (response.success) {
        setPosts((currentPosts) =>
          currentPosts.map((item) =>
            item.id === post.id
              ? {
                  ...item,
                  liked_by_me: response.data?.liked,
                  likes_count: response.data?.likes_count,
                }
              : item
          )
        );
      } else {
        showAlert(
          t.error,
          response.message || t.likeError
        );
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);

      showAlert(
        t.error,
        t.likeError
      );
    }
  };

  const report = async (post) => {
    if (!logged) {
      router.push('/login');
      return;
    }

    try {
      const confirmed = await confirmAlert(
        t.reportPost,
        t.reportConfirm,
        {
          confirmText: t.reportPost,
          cancelText: t.cancel,
        }
      );

      if (!confirmed) {
        return;
      }

      const response = await reportPost(post.id);

      if (response.success) {
        setPosts((currentPosts) =>
          currentPosts.filter(
            (item) => item.id !== post.id
          )
        );

        showAlert(
          t.reported,
          t.reportSuccess
        );

        return;
      }

      showAlert(
        t.error,
        response.message || t.reportError
      );
    } catch (error) {
      console.error('Erro ao denunciar:', error);

      showAlert(
        t.error,
        t.reportError
      );
    }
  };

  const remove = async (post) => {
    if (!logged) {
      router.push('/login');
      return;
    }

    try {
      const confirmed = await confirmAlert(
        t.deletePost,
        t.deleteConfirm,
        {
          confirmText: t.deletePost || 'Excluir',
          cancelText: t.cancel,
        }
      );

      if (!confirmed) {
        return;
      }

      const response = await deletePost(post.id);

      if (response.success) {
        setPosts((currentPosts) =>
          currentPosts.filter(
            (item) => item.id !== post.id
          )
        );

        showAlert(
          t.deleted || t.deletePost,
          t.deleteSuccess
        );

        return;
      }

      showAlert(
        t.error,
        response.message || t.deleteErrorCommunity
      );
    } catch (error) {
      console.error('Erro ao excluir:', error);

      showAlert(
        t.error,
        t.deleteErrorCommunity
      );
    }
  };

  const renderPost = ({ item: post }) => {
    const authorName = String(
      post.author_name || '?'
    );

    const initial = authorName
      .charAt(0)
      .toUpperCase();

    const canDelete =
      userRole === 'admin' ||
      (
        userRole === 'user' &&
        Number(post.author_user_id) ===
          Number(currentUser?.id)
      );

    return (
      <View
        style={[
          styles.post,
          {
            backgroundColor: theme.card,
            borderColor: theme.surfaceVariant,
          },
        ]}
      >
        <View style={styles.top}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  theme.primaryContainer,
              },
            ]}
          >
            <AppText
              style={{
                color: theme.primary,
                fontWeight: '800',
              }}
            >
              {initial}
            </AppText>
          </View>

          <View style={styles.author}>
            <View style={styles.nameRow}>
              <AppText
                style={styles.name}
                numberOfLines={1}
              >
                {post.author_name ||
                  t.unknownUser}
              </AppText>

              {post.is_admin_post ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        theme.primary,
                    },
                  ]}
                >
                  <AppText
                    style={{
                      color: theme.onPrimary,
                      fontSize: 9,
                      fontWeight: '800',
                    }}
                  >
                    ADMIN
                  </AppText>
                </View>
              ) : (
                <AppText
                  muted
                  style={styles.tag}
                >
                  #{post.registration_number || ''}
                </AppText>
              )}
            </View>

            <AppText
              muted
              style={styles.date}
            >
              {relative(
                post.created_at,
                locale,
                t
              )}
            </AppText>
          </View>
        </View>

        <AppText style={styles.content}>
          {post.content || ''}
        </AppText>

        <View style={styles.actions}>
          <Pressable
            onPress={() => actLike(post)}
            style={styles.action}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              t.like || 'Curtir'
            }
          >
            <MaterialIcons
              name={
                post.liked_by_me
                  ? 'favorite'
                  : 'favorite-border'
              }
              size={21}
              color={
                post.liked_by_me
                  ? theme.primary
                  : theme.onSurfaceVariant
              }
            />

            <AppText muted>
              {post.likes_count || 0}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => report(post)}
            style={styles.action}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              t.reportPost ||
              'Denunciar post'
            }
          >
            <MaterialIcons
              name="flag"
              size={20}
              color={theme.onSurfaceVariant}
            />
          </Pressable>

          {canDelete ? (
            <Pressable
              onPress={() => remove(post)}
              style={styles.action}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t.deletePost}
            >
              <MaterialIcons
                name="delete-outline"
                size={21}
                color={theme.error}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.headerContainer}>
        <AppHeader title={t.community} />
      </View>

      {!logged ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor:
                theme.primaryContainer,
              borderColor:
                theme.surfaceVariant,
            },
          ]}
        >
          <MaterialIcons
            name="people"
            size={24}
            color={theme.primary}
          />

          <View style={styles.bannerCopy}>
            <AppText
              style={{
                fontWeight: '700',
              }}
            >
              {t.loginRequired}
            </AppText>

            <AppText
              muted
              style={{
                fontSize: 11,
              }}
            >
              {t.loginToInteract}
            </AppText>
          </View>

          <Pressable
            onPress={() => router.push('/login')}
            style={[
              styles.smallButton,
              {
                backgroundColor:
                  theme.primary,
              },
            ]}
          >
            <AppText
              style={{
                color: theme.onPrimary,
                fontWeight: '700',
              }}
            >
              {t.login}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <LoadingView />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(post) =>
            String(post.id)
          }
          renderItem={renderPost}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons
                name="forum"
                size={44}
                color={theme.onSurfaceVariant}
              />

              <AppText muted>
                {t.noPosts}
              </AppText>
            </View>
          }
        />
      )}

      {logged ? (
        <Pressable
          onPress={() => setModal(true)}
          style={[
            styles.fab,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
        >
          <MaterialIcons
            name="add"
            size={28}
            color={theme.onPrimary}
          />
        </Pressable>
      ) : null}

      <Modal
        visible={modal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModal(false)
        }
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.composer,
              {
                backgroundColor: theme.card,
                borderColor:
                  theme.surfaceVariant,
              },
            ]}
          >
            <DisplayText
              style={{
                fontSize: 25,
              }}
            >
              {t.publish}
            </DisplayText>

            <TextInput
              multiline
              maxLength={500}
              value={content}
              onChangeText={setContent}
              placeholder={t.postPlaceholder}
              placeholderTextColor={
                theme.onSurfaceVariant
              }
              style={[
                styles.textarea,
                {
                  color: theme.onSurface,
                  borderColor:
                    theme.surfaceVariant,
                  backgroundColor:
                    theme.surface,
                },
              ]}
            />

            <View style={styles.composerBottom}>
              <AppText muted>
                {content.length}/500
              </AppText>

              <View style={styles.row}>
                <Pressable
                  onPress={() =>
                    setModal(false)
                  }
                  style={[
                    styles.cancel,
                    {
                      backgroundColor:
                        theme.surfaceVariant,
                    },
                  ]}
                >
                  <AppText>
                    {t.cancel}
                  </AppText>
                </Pressable>

                <Pressable
                  disabled={
                    busy ||
                    !content.trim()
                  }
                  onPress={publish}
                  style={[
                    styles.publish,
                    {
                      backgroundColor:
                        theme.primary,
                      opacity:
                        busy ||
                        !content.trim()
                          ? 0.5
                          : 1,
                    },
                  ]}
                >
                  <AppText
                    style={{
                      color:
                        theme.onPrimary,
                      fontWeight: '700',
                    }}
                  >
                    {busy
                      ? t.publishing
                      : t.publish}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    fontSize: 25,
  },

  banner: {
    marginHorizontal: 18,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  bannerCopy: {
    flex: 1,
    gap: 2,
  },

  smallButton: {
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    padding: 18,
    paddingBottom: 130,
    gap: 12,
  },

  post: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 17,
    gap: 13,
  },

  top: {
    flexDirection: 'row',
    gap: 11,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  author: {
    flex: 1,
    gap: 2,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  name: {
    fontWeight: '800',
    flexShrink: 1,
  },

  tag: {
    fontSize: 11,
  },

  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  date: {
    fontSize: 10,
  },

  content: {
    fontSize: 15,
    lineHeight: 22,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 32,
  },

  actionLabel: {
    fontSize: 10,
  },

  empty: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 60,
  },

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 95,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 18,
  },

  composer: {
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    gap: 15,
  },

  textarea: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    textAlignVertical: 'top',
  },

  composerBottom: {
    gap: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  cancel: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  publish: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});