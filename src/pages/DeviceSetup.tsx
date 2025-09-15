import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, MapPin, Shield, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

const DeviceSetup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { setDeviceType } = useDeviceProfile(user?.id);

  const handleDeviceSelection = async (type: 'controller' | 'tracker') => {
    setLoading(true);
    const success = await setDeviceType(type);
    
    if (success) {
      // Redirect based on device type
      if (type === 'controller') {
        navigate('/controller');
      } else {
        navigate('/tracker');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <Smartphone className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configuração do Dispositivo</h1>
          <p className="text-muted-foreground mb-4">
            Escolha a função deste dispositivo no seu sistema de rastreamento
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Logado como: {user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Monitor className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Dispositivo Controlador</CardTitle>
              <CardDescription>
                Este é o celular que você usará para rastrear o outro dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Visualiza a localização em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>Interface com mapa interativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Controla o sistema de rastreamento</span>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => handleDeviceSelection('controller')}
                disabled={loading}
              >
                {loading ? 'Configurando...' : 'Configurar como Controlador'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-accent/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                <Smartphone className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Dispositivo Rastreadável</CardTitle>
              <CardDescription>
                Este é o celular que será rastreado pelo dispositivo controlador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Compartilha localização automaticamente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>Funciona em segundo plano</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Interface simples e discreta</span>
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleDeviceSelection('tracker')}
                disabled={loading}
              >
                {loading ? 'Configurando...' : 'Configurar como Rastreadável'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2 text-foreground">Importante:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Você precisa configurar esta mesma conta nos dois seus celulares</li>
            <li>• Um dispositivo deve ser "Controlador" e o outro "Rastreadável"</li>
            <li>• Apenas você pode rastrear seus dispositivos com esta conta</li>
            <li>• O rastreamento funciona apenas entre seus próprios dispositivos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeviceSetup;