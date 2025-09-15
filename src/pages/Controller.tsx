import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  RefreshCw, 
  Navigation, 
  Battery, 
  Clock, 
  Settings,
  Shield,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { supabase, LocationData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Controller = () => {
  const [trackedLocation, setTrackedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Fetch latest location from tracker device
  const fetchTrackerLocation = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível obter a localização",
        });
        return;
      }

      if (data && data.length > 0) {
        setTrackedLocation(data[0]);
      } else {
        toast({
          title: "Nenhuma localização encontrada",
          description: "O dispositivo rastreadável ainda não enviou sua localização",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao buscar a localização",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh location every 15 seconds
  useEffect(() => {
    fetchTrackerLocation();
    const interval = setInterval(fetchTrackerLocation, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const openNavigation = () => {
    if (!trackedLocation) return;

    const { latitude, longitude } = trackedLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <Smartphone className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Controlador</h1>
                <p className="text-sm text-muted-foreground">Rastreando seus dispositivos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {user?.email?.split('@')[0]}
              </Badge>
              <Button variant="outline" size="sm" onClick={signOut}>
                <Settings className="h-4 w-4 mr-1" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <Button 
            onClick={fetchTrackerLocation} 
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Atualizando...' : 'Atualizar Agora'}
          </Button>
        </div>

        {/* Location Card */}
        {trackedLocation ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-accent" />
                      Localização do Dispositivo
                    </CardTitle>
                    <CardDescription>
                      Última atualização: {formatDate(trackedLocation.timestamp)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Ativo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">
                    {trackedLocation.address || 'Endereço não disponível'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {trackedLocation.latitude.toFixed(6)}, {trackedLocation.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-card border rounded-lg">
                    <Clock className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Horário</p>
                      <p className="text-sm font-medium">{formatTime(trackedLocation.timestamp)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-card border rounded-lg">
                    <Battery className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bateria</p>
                      <p className="text-sm font-medium">
                        {trackedLocation.battery_level ? `${trackedLocation.battery_level}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-card border rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Precisão</p>
                      <p className="text-sm font-medium">{Math.round(trackedLocation.accuracy)}m</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-card border rounded-lg">
                    <Smartphone className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium text-green-600">Online</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Button */}
                <Button 
                  onClick={openNavigation} 
                  className="w-full gap-2"
                  size="lg"
                >
                  <Navigation className="h-4 w-4" />
                  Navegar até o Dispositivo
                </Button>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Mapa</CardTitle>
                <CardDescription>
                  Visualização da localização em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={openNavigation}
                >
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">
                      Clique para abrir no Google Maps
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trackedLocation.latitude.toFixed(6)}, {trackedLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aguardando localização</h3>
              <p className="text-muted-foreground mb-4">
                O dispositivo rastreadável ainda não enviou sua localização.
                Certifique-se de que o aplicativo está ativo no outro dispositivo.
              </p>
              <Button onClick={fetchTrackerLocation} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Controller;