import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  Input,
  Label,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/ui";
import { Mail, Loader2, CheckCircle2, Lock, Utensils, ChevronLeft } from "lucide-react";
import { sessionApi } from "@/entities/session/api/sessionApi";
import { Link, useNavigate } from "react-router-dom";

const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
});

const resetPasswordSchema = z.object({
  otpCode: z.string().length(6, "Doğrulama kodu 6 haneli olmalıdır"),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"forgot" | "reset" | "success">("forgot");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onForgotSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await sessionApi.forgotPassword(data.email);
      setUserEmail(data.email);
      setStep("reset");
      setCountdown(60); // İlk gönderimde sayacı başlat
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        "İşlem sırasında bir hata oluştu. Lütfen e-postanızı kontrol edin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await sessionApi.resetPassword({
        email: userEmail,
        otpCode: data.otpCode,
        newPassword: data.newPassword,
      });
      setStep("success");
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        "Şifre sıfırlanamadı. Lütfen kodu ve yeni şifrenizi kontrol edin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    setError(null);
    try {
      // Şifre sıfırlama için forgot-password tekrar çağrılır.
      await sessionApi.forgotPassword(userEmail);
      setCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || "Kod gönderilemedi.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sol Panel - Görsel (Login sayfasıyla aynı tutarlılık için) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <img 
          src="/login-bg.png" 
          alt="Taze Sebzeler" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-end p-20 w-full">
          <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center mb-10">
            <Utensils className="text-white w-6 h-6" />
          </div>
          <blockquote className="text-4xl font-bold text-white mb-10 leading-tight">
            "Güvenli bir mutfak, güvenli bir şifreyle başlar. 
            Erişiminizi kolayca kurtarın."
          </blockquote>
        </div>
      </div>

      {/* Sağ Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-20 bg-background">
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            OleAI
          </Link>
          <Button variant="ghost" className="gap-2" onClick={() => navigate("/login")}>
            <ChevronLeft className="w-4 h-4" /> Girişe Dön
          </Button>
        </div>

        <div className="flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              {step === "forgot" && "Şifre Sıfırlama"}
              {step === "reset" && "Kodu Doğrula"}
              {step === "success" && "Tamamlandı!"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {step === "forgot" && "E-posta adresinizi girin, size bir doğrulama kodu gönderelim."}
              {step === "reset" && `${userEmail} adresine gönderilen 6 haneli kodu girin.`}
              {step === "success" && "Şifreniz başarıyla güncellendi."}
            </p>
          </div>

          {step === "success" ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="w-20 h-20 text-primary animate-in zoom-in duration-500" />
              </div>
              <p className="text-muted-foreground">Yeni şifrenizle giriş yapmaya hazırsınız.</p>
              <Button className="w-full h-14 rounded-xl text-lg font-bold" onClick={() => navigate("/login")}>
                Giriş Yap
              </Button>
            </div>
          ) : step === "forgot" ? (
            <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="chef@oleai.com"
                    className="pl-11 h-14 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
                    {...forgotForm.register("email")}
                  />
                </div>
                {forgotForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{forgotForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Doğrulama Kodu Gönder"}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <Label className="text-center block">Doğrulama Kodu</Label>
                <div className="flex justify-center">
                  <Controller
                    control={resetForm.control}
                    name="otpCode"
                    render={({ field }) => (
                      <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot key={i} index={i} className="rounded-xl border-2 h-14 w-14 text-xl" />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    )}
                  />
                </div>
                {resetForm.formState.errors.otpCode && (
                  <p className="text-xs text-destructive text-center">{resetForm.formState.errors.otpCode.message}</p>
                )}
                
                <div className="text-center">
                  <button 
                    type="button" 
                    className="text-sm font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                    onClick={handleResend}
                    disabled={resendLoading || countdown > 0}
                  >
                    {resendLoading ? "Gönderiliyor..." : countdown > 0 ? `${countdown}s sonra tekrar gönder` : "Yeni Kod Gönder"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-14 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
                    {...resetForm.register("newPassword")}
                  />
                </div>
                {resetForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Şifreyi Güncelle"}
              </Button>
              
              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center font-medium"
                onClick={() => setStep("forgot")}
              >
                E-postayı Değiştir
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 flex justify-between items-center text-xs text-muted-foreground">
          <p>© 2024 OleAI Inc.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">Gizlilik</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Şartlar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
