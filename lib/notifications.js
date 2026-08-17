import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { API_URL } from '../constants/config';
import Constants from 'expo-constants';
import { getItem, setItem } from './storage';

export const BLOG_NOTIFICATION_TASK = 'luxjson-blog-notification-check';

const messages = {
  pt: { title: 'luxjson', body: 'Um novo post foi publicado!' },
  en: { title: 'luxjson', body: 'A new post has been published!' },
  es: { title: 'luxjson', body: '¡Se ha publicado una nueva publicación!' },
};

async function sendRemoteNotification(copy, postId) {
  try {
    const token = await getItem('lux-expo-push-token');
    if (!token) return false;
    const response = await fetch('https://exp.host/--/api/v2/push/send', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ to:token, title:copy.title, body:copy.body, data:{postId}, sound:'default' }) });
    return response.ok;
  } catch { return false; }
}

async function checkForNewPost({ notify = true } = {}) {
  if (notify && (await getItem('lux-notifications-enabled')) === 'false') return false;
  try {
    const response = await fetch(`${API_URL}/blog/posts?limit=1&publishedOnly=true`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return false;
    const data = await response.json();
    const post = Array.isArray(data) ? data[0] : data?.posts?.[0] || data?.data?.[0];
    if (!post) return false;
    const currentId = String(post.id ?? post.slug ?? post.published_at ?? '');
    const previousId = await getItem('lux-last-blog-post');
    if (!previousId) {
      await setItem('lux-last-blog-post', currentId);
      return false;
    }
    if (previousId === currentId) return false;
    await setItem('lux-last-blog-post', currentId);
    if (notify) {
      const language = (await getItem('lux-language')) || 'pt';
      const copy = messages[language] || messages.pt;
      const remoteSent = await sendRemoteNotification(copy, currentId);
      if (!remoteSent) {
        await Notifications.scheduleNotificationAsync({
          content: { title: copy.title, body: copy.body, data: { postId: currentId } },
          trigger: null,
        });
      }
    }
    return true;
  } catch {
    return false;
  }
}

TaskManager.defineTask(BLOG_NOTIFICATION_TASK, async () => {
  const changed = await checkForNewPost({ notify: true });
  return changed ? BackgroundTask.BackgroundTaskResult.Success : BackgroundTask.BackgroundTaskResult.Success;
});

export async function initializeNotifications() {
  if (Platform.OS === 'web') return { enabled: false };
  if ((await getItem('lux-notifications-enabled')) === 'false') return { enabled: false };
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
    await Notifications.setNotificationChannelAsync('blog', {
      name: 'Blog', importance: Notifications.AndroidImportance.DEFAULT,
    });
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      if (requested.status !== 'granted') return { enabled: false };
    }
    try {
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        if (projectId) {
          const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          if (pushToken) await setItem('lux-expo-push-token', pushToken);
        }
      } catch (error) {
        console.warn('[luxjson] push token:', error?.message || error);
      }
      await BackgroundTask.registerTaskAsync(BLOG_NOTIFICATION_TASK, { minimumInterval: 15, requiresNetworkConnectivity: true });
    } catch (error) {
      console.warn('[luxjson] background notification task:', error?.message || error);
    }
    await checkForNewPost({ notify: false });
    return { enabled: true };
  } catch (error) {
    console.warn('[luxjson] notifications unavailable:', error?.message || error);
    return { enabled: false };
  }
}

export async function checkBlogNow() {
  return checkForNewPost({ notify: true });
}

export async function setNotificationsEnabled(enabled) {
  await setItem('lux-notifications-enabled', enabled ? 'true' : 'false');
  if (enabled) return initializeNotifications();
  return { enabled: false };
}
