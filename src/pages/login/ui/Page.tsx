import { LoginForm } from "@/features/auth/login-by-email/ui/LoginForm";
import { Link } from "react-router-dom";
import { Utensils } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sol Panel - Görsel ve Bilgi */}
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
              {[1, 2, 3].map((i) => (
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

      {/* Sağ Panel - Giriş Formu */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 md:p-20 bg-background">
        <div className="flex justify-between items-center mb-12 lg:mb-0">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            OleAI
          </Link>
        </div>

        <div className="flex flex-col justify-center max-w-lg mx-auto w-full bg-card/40 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-primary/5">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Tekrar Hoş Geldiniz</h1>
            <p className="text-muted-foreground text-lg">
              Akıllı mutfağınızı senkronize etmek için bilgilerinizi girin.
            </p>
          </div>

          <LoginForm />
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-4">
          <p>© 2026 OleAI Inc.</p>
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
