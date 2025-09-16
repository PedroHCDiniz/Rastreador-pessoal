import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

export const useLocation = (userId: string | undefined, isTracking: boolean = false) => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getBatteryLevel = useCallback(async (): Promise<number> => {
    try {
      // @ts-ignore - Battery API might not be available in all browsers
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        return Math.round(battery.level * 100);
      }
    } catch (e) {
      console.warn('Battery API not available');
    }
    return 100; // Default fallback
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<LocationState | null> => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Try to get address from coordinates
          let address = null;
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
            );
            const data = await response.json();
            address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          } catch (e) {
            address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }

          const locationData: LocationState = {
            latitude,
            longitude,
            accuracy: accuracy || 0,
            timestamp: new Date().toISOString(),
            address,
          };

          resolve(locationData);
        },
        (error) => {
          setError(`Erro ao obter localização: ${error.message}`);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const saveLocationToDatabase = useCallback(async (locationData: LocationState) => {
    if (!userId) return;

    try {
      const batteryLevel = await getBatteryLevel();
      
      const { error } = await supabase
        .from('locations')
        .insert({
          user_id: userId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          battery_level: batteryLevel,
          timestamp: locationData.timestamp,
          address: locationData.address,
        });

      if (error) {
        console.error('Erro ao salvar localização:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
    }
  }, [userId, getBatteryLevel]);

  const updateLocation = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        
        if (isTracking) {
          await saveLocationToDatabase(currentLocation);
        }
      }
    } catch (error) {
      setError('Erro ao atualizar localização');
    } finally {
      setLoading(false);
    }
  }, [userId, isTracking, getCurrentLocation, saveLocationToDatabase]);

  // Auto-update location for tracking devices
  useEffect(() => {
    if (!isTracking || !userId) return;

    // Initial update
    updateLocation();

    // Set up interval for regular updates (every 15 seconds)
    const interval = setInterval(updateLocation, 15000);

    return () => clearInterval(interval);
  }, [isTracking, userId, updateLocation]);

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Geolocalização não suportada pelo navegador",
      });
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        toast({
          variant: "destructive",
          title: "Permissão negada",
          description: "É necessário permitir acesso à localização",
        });
        return false;
      }

      if (permission.state === 'prompt') {
        // Try to trigger permission request
        await getCurrentLocation();
      }

      return true;
    } catch (error) {
      console.warn('Permission API not available, trying direct access');
      // Fallback: try to get location directly
      const testLocation = await getCurrentLocation();
      return testLocation !== null;
    }
  }, [getCurrentLocation, toast]);

  return {
    location,
    loading,
    error,
    updateLocation,
    requestLocationPermission,
  };
};