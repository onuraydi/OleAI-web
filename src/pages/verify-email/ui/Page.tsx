import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/ui";
import { Loader2, CheckCircle2, Utensils, ArrowRight, Mail } from "lucide-react";
import { sessionApi } from "@/entities/session/api/sessionApi";
import { useSessionStore } from "@/entities/session";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

const verifySchema = z.object({
  otpCode: z.string().length(6, "Doğrulama kodu 6 haneli olmalıdır"),
});

type VerifyValues = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useSessionStore((state) => state.setAuth);
  
  const email = searchParams.get("email") || "";
  const password = location.state?.password;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: VerifyValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await sessionApi.verifyEmail({
        email,
        otpCode: data.otpCode,
      });
      
      // Eğer password elimizdeyse otomatik giriş yap
      if (password) {
        const loginResponse = await sessionApi.login({
          request: { email, password }
        });
        setAuth(true, loginResponse.user);
        setIsSuccess(true);
        setTimeout(() => navigate("/onboarding"), 1500);
      } else {
        // Password yoksa (sayfa yenilendiyse vb.) login'e yönlendir
        setIsSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Doğrulama başarısız. Lütfen kodu kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResendLoading(true);
    setError(null);
    try {
      await sessionApi.resendOtp(email);
      setCountdown(60); // 1 dakika bekleme
    } catch (err: any) {
      setError(err.response?.data?.message || "Kod gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sol Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <img 
          src="/login-bg.png" 
          alt="Taze Sebzeler" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-20 w-full">
          <blockquote className="text-4xl font-bold text-white mb-6 leading-tight">
            "OleAI ailesine hoş geldiniz! Hesabınızı doğrulamak için son bir adım kaldı."
          </blockquote>
        </div>
      </div>

      {/* Sağ Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-20 bg-background">
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            OleAI
          </Link>
        </div>

        <div className="flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">E-postanızı Doğrulayın</h1>
            <p className="text-muted-foreground text-lg">
              <span className="font-bold text-foreground">{email}</span> adresine 6 haneli bir doğrulama kodu gönderdik.
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="w-20 h-20 text-primary animate-in zoom-in duration-500" />
              </div>
              <h2 className="text-2xl font-bold">Doğrulama Başarılı!</h2>
              <p className="text-muted-foreground">Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Controller
                    control={control}
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
                {errors.otpCode && (
                  <p className="text-xs text-destructive text-center">{errors.otpCode.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    Doğrula ve Devam Et <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Kod gelmedi mi?{" "}
                  <button 
                    type="button" 
                    className="font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                    onClick={handleResend}
                    disabled={resendLoading || countdown > 0}
                  >
                    {resendLoading ? "Gönderiliyor..." : countdown > 0 ? `${countdown}s bekleyin` : "Tekrar Gönder"}
                  </button>
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="w-4 h-4" /> E-postayı Değiştir
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="mt-12 text-xs text-muted-foreground">
          © 2024 OleAI Inc.
        </div>
      </div>
    </div>
  );
}
