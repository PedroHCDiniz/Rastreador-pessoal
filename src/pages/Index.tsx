import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useDeviceProfile(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (profileLoading) return;

    if (!profile?.device_type) {
      navigate('/setup');
      return;
    }

    // Redirect based on device type
    if (profile.device_type === 'controller') {
      navigate('/controller');
    } else if (profile.device_type === 'tracker') {
      navigate('/tracker');
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
