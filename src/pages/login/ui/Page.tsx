import { LoginForm } from "@/features/auth/login-by-email/ui/LoginForm";
import { AuthLayout } from "@/widgets/auth-layout/ui/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Tekrar Hoş Geldiniz"
      description="Akıllı mutfağınızı senkronize etmek için bilgilerinizi girin."
    >
      <LoginForm />
    </AuthLayout>
  );
}
