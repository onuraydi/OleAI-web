import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AxiosError } from "axios";
import { Button, Input, Label, Checkbox } from "@/shared/ui";
import { Mail, Lock, User, ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { sessionApi } from "@/entities/session";
import { useNavigate, Link } from "react-router-dom";

const registerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Şartları kabul etmelisiniz",
  }),
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
    control,
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
        acceptTerms: data.acceptTerms,
      });
      // Kayıt başarılı, doğrulama sayfasına yönlendir
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
      } else {
        setError("Beklenmeyen bir hata oluştu.");
      }
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
            placeholder="chef@oleai.com.tr"
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

      <div className="flex items-start space-x-3 pt-2">
        <Controller
          name="acceptTerms"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <Checkbox
              id="acceptTerms"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-1"
            />
          )}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="acceptTerms"
            className="text-sm font-medium leading-normal text-muted-foreground"
          >
            <Link to="/terms" target="_blank" className="text-primary hover:underline font-bold">Kullanım Şartları</Link>'nı ve{" "}
            <Link to="/privacy" target="_blank" className="text-primary hover:underline font-bold">Gizlilik Politikası</Link>'nı okudum, kabul ediyorum.
          </Label>
          {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>}
        </div>
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
