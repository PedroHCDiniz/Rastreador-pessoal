import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message,
        });
        return false;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Meu Rastreador Pessoal",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Erro no login",
        description: "Ocorreu um erro inesperado",
      });
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: error.message,
        });
        return false;
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Faça login para continuar",
      });
      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro", 
        description: "Ocorreu um erro inesperado",
      });
      return false;
    }
  };

  const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast({
      variant: "destructive",
      title: "Erro ao sair",
      description: error.message,
    });
  } else {
    window.location.href = '/auth'; // Adicione esta linha
  }
};

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};