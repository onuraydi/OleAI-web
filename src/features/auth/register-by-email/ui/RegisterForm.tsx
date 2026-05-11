import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@/shared/ui";
import { Mail, Lock, User, ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { sessionApi } from "@/entities/session/api/sessionApi";
import { useNavigate, Link } from "react-router-dom";

const registerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await sessionApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      // Kayıt başarılı, doğrulama sayfasına yönlendir (şifreyi güvenli bir şekilde state ile taşıyoruz)
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`, {
        state: { password: data.password }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full max-w-md">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ad</Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="firstName"
              placeholder="John"
              className="pl-11 h-12 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
              {...register("firstName")}
            />
          </div>
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Soyad</Label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="lastName"
              placeholder="Doe"
              className="pl-11 h-12 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
              {...register("lastName")}
            />
          </div>
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

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
            type="password"
            placeholder="••••••••"
            className="pl-11 h-12 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
            {...register("password")}
          />
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
        <div className="relative group">
          <RotateCcw className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="pl-11 h-12 bg-secondary/30 border-transparent focus:bg-background transition-all rounded-xl"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
          <>
            Kaydol <ArrowRight className="ml-2 w-5 h-5" />
          </>
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground pt-2">
        Zaten bir hesabınız var mı?{" "}
        <Link to="/login" className="font-bold text-primary hover:underline">
          Giriş Yap
        </Link>
      </div>
    </form>
  );
};
