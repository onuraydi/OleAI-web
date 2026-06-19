import { RegisterForm } from "@/features/auth/register-by-email/ui/RegisterForm";
import { AuthLayout } from "@/widgets/auth-layout/ui/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Hesap Oluştur"
      description="Mutfak yolculuğunuza hassasiyetle başlayın."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
