import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { Button, Input, Checkbox, Label } from "@/shared/ui";
import { Mail, Lock, Eye, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSessionStore, sessionApi } from "@/entities/session";
import { useNavigate, Link } from "react-router-dom";
import { userApi } from "@/entities/user/api/userApi";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useSessionStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await sessionApi.login({
        request: {
          email: data.email,
          password: data.password,
        },
      });
      
      const userData = await userApi.getProfile();
      setAuth(true, userData);
      
      if (userData.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        const hasCompletedOnboarding = localStorage.getItem(`onboarding_${userData.id}`);
        if (!hasCompletedOnboarding) {
          navigate("/onboarding");
        } else {
          navigate("/home");
        }
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const errorData = err.response?.data;
        // Backend PascalCase veya camelCase dönebilir, ikisini de kontrol et
        const errorCode = errorData?.errorCode || errorData?.ErrorCode;
        const errorMessage = errorData?.detail || errorData?.Detail || errorData?.message;

        // Eğer e-posta doğrulanmamışsa (ErrorCode üzerinden kontrol), doğrulama sayfasına yönlendir
        if (errorCode === "EMAIL_NOT_VERIFIED") {
          // Otomatik olarak yeni kod gönder
          try {
            await sessionApi.resendOtp(data.email);
          } catch {
            // Silent fail — resend is best-effort
          }

          navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
          return;
        }

        setError(errorMessage || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
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
            className="pl-11 h-12 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Şifre</Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-11 pr-11 h-12 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" {...register("rememberMe")} />
          <Label htmlFor="remember" className="text-sm font-medium cursor-pointer">Beni Hatırla</Label>
        </div>
        <Link to="/forgot-password" className="text-sm font-bold text-primary hover:underline">
          Şifremi Unuttum?
        </Link>
      </div>

      <Button 
        type="submit" 
        className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all"
        disabled={isLoading}
      >
        {isLoading ? "Giriş Yapılıyor..." : (
          <>
            Giriş Yap <ArrowRight className="ml-2 w-5 h-5" />
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Hesabınız yok mu?{" "}
        <Link to="/register" className="font-bold text-primary hover:underline">
          Kaydolun
        </Link>
      </div>
    </form>
  );
};
