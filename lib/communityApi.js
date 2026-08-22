import {
  api,
  apiMessage,
  setCommunityAuthToken,
} from './api';

import { setItem } from './storage';

const result = (data) => ({
  success: data?.success !== false,
  data:
    data?.posts ??
    data?.post ??
    data?.user ??
    data?.data ??
    data,
  message: data?.message,
});

const call = async (fn) => {
  try {
    const response = await fn();
    const data = response?.data;

    return result(data);
  } catch (error) {
    return {
      success: false,
      data: null,
      message: apiMessage(error),
    };
  }
};

export const fetchPosts = (params = {}) =>
  call(() => api.get('/community/posts', { params }));

export const createPost = (content) =>
  call(() => api.post('/community/posts', { content }));

export const likePost = (id) =>
  call(() => api.post(`/community/posts/${id}/like`));

export const reportPost = (id, reason) =>
  call(() =>
    api.post(`/community/posts/${id}/report`, { reason })
  );

export const deletePost = (id) =>
  call(() => api.delete(`/community/posts/${id}`));

export const registerUser = (data) =>
  call(() => api.post('/community/auth/register', data));

export const loginUser = async (username, password) => {
  try {
    const response = await api.post(
      '/community/auth/login',
      {
        username,
        password,
      }
    );

    const data = response?.data;

    if (data?.success && data?.token) {
      setCommunityAuthToken(data.token);

      await setItem(
        'lux-community-token',
        data.token
      );
    }

    return result(data);
  } catch (error) {
    return {
      success: false,
      data: null,
      message: apiMessage(error),
    };
  }
};

export const fetchMe = () =>
  call(() => api.get('/community/auth/me'));

export const updateProfile = (data) =>
  call(() =>
    api.put('/community/auth/profile', data)
  );

export const fetchReportedPosts = () =>
  call(() =>
    api.get('/community/admin/reports')
  );

export const moderatePost = (id, action) =>
  call(() =>
    api.put(
      `/community/admin/posts/${id}/moderate`,
      { action }
    )
  );

export const fetchUserPosts = (id) =>
  call(() =>
    api.get(`/community/users/${id}/posts`)
  );