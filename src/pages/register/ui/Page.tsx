import { RegisterForm } from "@/features/auth/register-by-email/ui/RegisterForm";
import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sol Panel - Görsel (Login/Forgot ile aynı tutarlılık) */}
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
            "Yemek yapmak bir sanattır, ancak tutarlılık bir bilimdir. 
            Hassasiyeti OleAI'ya bırakın."
          </blockquote>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[4, 5, 6].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-secondary flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm font-medium">
              Dünya çapında 10.000'den fazla şefe katılın
            </p>
          </div>
        </div>
      </div>

      {/* Sağ Panel - Kayıt Formu */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-background">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Utensils className="w-6 h-6" />
            </div>
            OleAI
          </Link>
        </div>

        <div className="flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Hesap Oluştur</h1>
            <p className="text-muted-foreground text-lg">
              Mutfak yolculuğunuza hassasiyetle başlayın.
            </p>
          </div>

          <RegisterForm />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <p>© 2024 OleAI Inc.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">Gizlilik</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Şartlar</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Yardım</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
