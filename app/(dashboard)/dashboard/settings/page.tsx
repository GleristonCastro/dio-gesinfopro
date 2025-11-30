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
      <h1 className="text-3xl font-bold">Configurações</h1>

      {/* Aparência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" aria-hidden="true" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência do aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tema (Light/Dark) */}
          <div>
            <label className="text-sm font-medium mb-3 block">Tema</label>
            <ThemeSelector />
          </div>
        </CardContent>
      </Card>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" aria-hidden="true" />
            Perfil
          </CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent>
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
              />
            </div>

            <Button type="submit" disabled={loading.profile}>
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

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" aria-hidden="true" />
            Segurança
          </CardTitle>
          <CardDescription>Altere sua senha de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
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
              />
            </div>

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
          </form>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
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
