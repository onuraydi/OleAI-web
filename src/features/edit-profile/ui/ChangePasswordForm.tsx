import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sessionApi } from "@/entities/session";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const ChangePasswordForm = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: sessionApi.changePassword,
    onSuccess: () => {
      toast.success("Şifren başarıyla güncellendi.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Şifre güncellenirken bir hata oluştu.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }

    mutation.mutate({
      oldPassword,
      newPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Old Password */}
        <div>
          <label className="block text-sm font-bold mb-2">Mevcut Şifre</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <KeyRound className="w-5 h-5" />
            </div>
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 bg-background border-2 border-muted rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="Mevcut şifreni gir"
              required
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showOld ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-bold mb-2">Yeni Şifre</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <KeyRound className="w-5 h-5" />
            </div>
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 bg-background border-2 border-muted rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="Yeni şifreni gir"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm font-bold mb-2">Yeni Şifre (Tekrar)</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <KeyRound className="w-5 h-5" />
            </div>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 bg-background border-2 border-muted rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="Yeni şifreni tekrar gir"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-muted/40">
        <button
          type="submit"
          disabled={mutation.isPending || !oldPassword || !newPassword || !confirmPassword}
          className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Güncelleniyor...
            </>
          ) : (
            "Şifreyi Güncelle"
          )}
        </button>
      </div>
    </form>
  );
};
