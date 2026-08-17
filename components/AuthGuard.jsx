import { Redirect, Slot } from 'expo-router';
import LoadingView from './LoadingView';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard() {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return <LoadingView />;
  if (!isAuthenticated) return <Redirect href="/login" />;
  return <Slot />;
}
