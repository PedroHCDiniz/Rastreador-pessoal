import { useState, useEffect } from 'react';
import { supabase, DeviceType, UserProfile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useDeviceProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDeviceType = async (deviceType: DeviceType) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          device_type: deviceType,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível configurar o dispositivo",
        });
        return false;
      }

      setProfile(prev => prev ? { ...prev, device_type: deviceType } : null);
      
      toast({
        title: "Dispositivo configurado!",
        description: `Este dispositivo foi configurado como ${deviceType === 'controller' ? 'Controlador' : 'Rastreadável'}`,
      });
      
      return true;
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
      return false;
    }
  };

  return {
    profile,
    loading,
    setDeviceType,
    refetch: fetchProfile,
  };
};