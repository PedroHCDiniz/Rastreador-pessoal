import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MapPin, 
  Battery, 
  Smartphone, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { useToast } from '@/hooks/use-toast';

const Tracker = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { user, signOut } = useAuth();
  const { location, loading, error, requestLocationPermission } = useLocation(user?.id, true);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      setPermissionGranted(hasPermission);
      
      if (!hasPermission) {
        toast({
          variant: "destructive",
          title: "Permissão necessária",
          description: "É necessário permitir acesso à localização sempre para o rastreamento funcionar",
        });
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getStatusColor = () => {
    if (error) return 'text-red-600';
    if (location && permissionGranted) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getStatusText = () => {
    if (error) return 'Erro na localização';
    if (location && permissionGranted) return 'Protegido e Ativo';
    if (loading) return 'Obtendo localização...';
    return 'Aguardando permissões';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-accent" />
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Dispositivo Rastreadável</h1>
                <p className="text-sm text-muted-foreground">Este dispositivo pode ser localizado</p>
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

      <div className="max-w-4xl mx-auto p-4">
        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Status do Rastreamento
                </CardTitle>
                <CardDescription>
                  Monitoramento da localização em tempo real
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {permissionGranted && location ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                )}
                <span className={`font-semibold ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-medium">
                    {location ? 'Ativa' : 'Aguardando...'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p className="font-medium">
                    {location ? formatTime(location.timestamp) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Battery className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Bateria</p>
                  <p className="font-medium">Monitorada</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Location Info */}
        {location && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localização Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">
                    {location.address || 'Endereço não disponível'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Precisão: </span>
                    <span className="font-medium">{Math.round(location.accuracy)}m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Horário: </span>
                    <span className="font-medium">{formatTime(location.timestamp)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Este dispositivo compartilha sua localização automaticamente a cada 15 segundos</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Apenas você pode ver a localização usando seu dispositivo controlador</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>O aplicativo funciona em segundo plano mesmo quando não está aberto</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p>Mantenha o aplicativo com permissões de localização "sempre permitir"</p>
              </div>
            </div>
            
            {!permissionGranted && (
              <div className="mt-4">
                <Button onClick={checkPermissions} className="gap-2">
                  <Shield className="h-4 w-4" />
                  Conceder Permissões
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mt-4 border-red-200">
            <CardContent className="text-center py-6">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                variant="outline" 
                onClick={checkPermissions} 
                className="mt-3"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Tracker;