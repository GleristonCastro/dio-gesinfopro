"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn, signUp } from "@/lib/auth/client";
import { toast } from "sonner";
import { Mail, Lock, User } from "lucide-react";
import Lottie from "lottie-react";
import logoAnimation from "@/public/animations/logo.json";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsFlipping(false);
    }, 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email: loginEmail,
        password: loginPassword,
      });

      if (result.error) {
        toast.error("Email ou senha incorretos");
      } else {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== confirmPassword) {
      toast.error("⚠️ As senhas não coincidem");
      return;
    }

    if (signupPassword.length < 8) {
      toast.error("⚠️ A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp.email({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
      });

      if (result.error) {
        toast.error("Erro ao criar conta. Email já cadastrado?");
      } else {
        toast.success("✅ Conta criada com sucesso! Bem-vindo!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 gap-6">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3">
        <Lottie
          animationData={logoAnimation}
          loop={true}
          style={{ width: 64, height: 64 }}
          aria-hidden="true"
        />
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          GesFinPro
        </h1>
      </div>

      {/* Card com animação de flip */}
      <div
        className="w-full max-w-md transition-all duration-300 ease-in-out"
        style={{
          transform: isFlipping ? "rotateY(90deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {isLogin ? (
          // Login Form
          <Card className="w-full bg-linear-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl">
            <CardHeader className="space-y-1 border-b border-white/20 dark:border-gray-800/50 bg-linear-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-500/20">
              <CardTitle className="text-2xl font-bold text-center">
                <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Entrar
                </span>
              </CardTitle>
              <CardDescription className="text-center">
                Entre com seu email e senha para acessar sua conta
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="login-email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Senha
                  </Label>
                  <PasswordInput
                    id="login-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="font-medium text-primary hover:underline"
                  >
                    Criar conta
                  </button>
                </p>
              </CardFooter>
            </form>
          </Card>
        ) : (
          // Signup Form
          <Card className="w-full bg-linear-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl">
            <CardHeader className="space-y-1 border-b border-white/20 dark:border-gray-800/50 bg-linear-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-500/20 dark:to-pink-500/20">
              <CardTitle className="text-2xl font-bold text-center">
                <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Criar conta
                </span>
              </CardTitle>
              <CardDescription className="text-center">
                Preencha os dados abaixo para criar sua conta
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-name"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nome
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    autoComplete="name"
                    className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Senha
                  </Label>
                  <PasswordInput
                    id="signup-password"
                    placeholder="Mínimo 8 caracteres"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Confirmar senha
                  </Label>
                  <PasswordInput
                    id="confirm-password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={handleFlip}
                    className="font-medium text-primary hover:underline"
                  >
                    Entrar
                  </button>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
