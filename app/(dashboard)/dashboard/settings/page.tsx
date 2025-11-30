"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { useSession } from "@/lib/auth/client";
import { User, Lock, Trash2, Loader2, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    delete: false,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, profile: true });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        toast.success("✅ Perfil atualizado com sucesso!");
        window.location.reload();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("⚠️ Erro ao atualizar perfil");
    } finally {
      setLoading({ ...loading, profile: false });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("⚠️ As senhas não coincidem");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("⚠️ A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading({ ...loading, password: true });

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        toast.success("✅ Senha alterada com sucesso!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao alterar senha");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("⚠️ Erro ao alterar senha");
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETAR") {
      toast.error('⚠️ Digite "DELETAR" para confirmar');
      return;
    }

    setLoading({ ...loading, delete: true });

    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("✅ Conta deletada com sucesso!");
        router.push("/login");
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao deletar conta");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("⚠️ Erro ao deletar conta");
    } finally {
      setLoading({ ...loading, delete: false });
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com gradiente moderno */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerencie suas preferências e informações pessoais
        </p>
      </div>

      {/* Grid de 2 colunas em desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aparência */}
        <Card className="bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="border-b border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-purple-600/10 to-pink-600/10 dark:from-purple-500/20 dark:to-pink-500/20">
            <CardTitle className="flex items-center gap-2">
              <Palette
                className="h-5 w-5 text-purple-600 dark:text-purple-400"
                aria-hidden="true"
              />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Aparência
              </span>
            </CardTitle>
            <CardDescription>
              Personalize a aparência do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Tema (Light/Dark) */}
            <div>
              <label className="text-sm font-medium mb-3 block">Tema</label>
              <ThemeSelector />
            </div>
          </CardContent>
        </Card>

        {/* Perfil */}
        <Card className="bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="border-b border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 dark:from-blue-500/20 dark:to-cyan-500/20">
            <CardTitle className="flex items-center gap-2">
              <User
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Perfil
              </span>
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  placeholder="Seu nome"
                  required
                  className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  placeholder="seu@email.com"
                  required
                  className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading.profile}
                className="w-full sm:w-auto"
              >
                {loading.profile ? (
                  <>
                    <Loader2
                      className="h-4 w-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Segurança - card largo */}
      <Card className="bg-gradient-to-br from-white/80 to-gray-50/60 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="border-b border-white/20 dark:border-gray-800/50 bg-gradient-to-r from-orange-600/10 to-amber-600/10 dark:from-orange-500/20 dark:to-amber-500/20">
          <CardTitle className="flex items-center gap-2">
            <Lock
              className="h-5 w-5 text-orange-600 dark:text-orange-400"
              aria-hidden="true"
            />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
              Segurança
            </span>
          </CardTitle>
          <CardDescription>Altere sua senha de acesso</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleChangePassword}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label htmlFor="current-password" className="text-sm font-medium">
                Senha atual
              </label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
                required
                className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="text-sm font-medium">
                Nova senha
              </label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Confirmar nova senha
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="md:col-span-3">
              <Button type="submit" disabled={loading.password}>
                {loading.password ? (
                  <>
                    <Loader2
                      className="h-4 w-4 mr-2 animate-spin"
                      aria-hidden="true"
                    />
                    Alterando...
                  </>
                ) : (
                  "Alterar senha"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="bg-gradient-to-br from-red-50/80 to-orange-50/60 dark:from-red-950/50 dark:to-orange-950/40 backdrop-blur-xl border-2 border-red-500/30 dark:border-red-500/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="border-b border-red-500/20 dark:border-red-500/30 bg-gradient-to-r from-red-600/10 to-orange-600/10 dark:from-red-500/20 dark:to-orange-500/20">
          <CardTitle className="flex items-center gap-2">
            <Trash2
              className="h-5 w-5 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
            <span className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
              Zona de Perigo
            </span>
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deletar sua conta removerá permanentemente todos os seus dados,
              incluindo transações, metas e configurações. Esta ação não pode
              ser desfeita.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Deletar conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar conta permanentemente</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os seus dados serão perdidos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <label htmlFor="delete-confirmation" className="text-sm block">
              Para confirmar, digite <strong>DELETAR</strong> no campo abaixo:
            </label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Digite DELETAR"
              className="bg-white/60 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmation("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading.delete || deleteConfirmation !== "DELETAR"}
            >
              {loading.delete ? (
                <>
                  <Loader2
                    className="h-4 w-4 mr-2 animate-spin"
                    aria-hidden="true"
                  />
                  Deletando...
                </>
              ) : (
                "Deletar permanentemente"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
