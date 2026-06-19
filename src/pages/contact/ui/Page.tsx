import { Header } from "@/widgets/header"
import { Footer } from "@/widgets/footer"
import { Container, Button, Input, Label } from "@/shared/ui"
import { Mail, Phone, Building, Loader2, Check, Headset, Briefcase, Megaphone, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { useCreateContactMessage } from "@/entities/contact-message"

export default function ContactPage() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("support");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { mutate: createMessage, isPending } = useCreateContactMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    createMessage({ name, department, email, message }, {
      onSuccess: () => {
        setName("");
        setEmail("");
        setMessage("");
        setDepartment("support");
      }
    });
  };
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-24 bg-background">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Kurumsal İletişim</h1>
              <p className="text-muted-foreground text-xl">
                Yenilikçi mutfak teknolojilerimiz hakkında bilgi almak, iş ortaklığı teklifleri sunmak veya basın talepleri için kurumsal iletişim kanallarımızı kullanabilirsiniz.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold border-b border-border/50 pb-4">Genel Merkez</h2>
                  
                  <div className="flex gap-4 items-start group">
                    <div className="p-4 rounded-2xl bg-secondary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">OleAI Teknoloji A.Ş.</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Teknopark İstanbul Kuluçka Merkezi<br />
                        Sanayi Mah. Teknopark Bulvarı No: 1/1A<br />
                        Pendik / İstanbul, Türkiye
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-bold border-b border-border/50 pb-4">İletişim Kanalları</h2>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 items-center group">
                      <div className="p-4 rounded-2xl bg-secondary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Müşteri Destek & Genel Bilgi</p>
                        <a href="mailto:iletisim@oleai.com" className="text-lg font-bold hover:text-primary transition-colors">iletisim@oleai.com</a>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center group">
                      <div className="p-4 rounded-2xl bg-secondary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Kurumsal Santral</p>
                        <p className="text-lg font-bold">+90 (216) 123 45 67</p>
                        <p className="text-sm text-muted-foreground mt-1">Hafta içi: 09:00 - 18:00 (GMT+3)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-primary/5">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Bize Mesaj Gönderin</h3>
                  <p className="text-muted-foreground">Formu doldurun, ilgili departmanımız en geç 24 saat içinde size dönüş yapsın.</p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Ad Soyad / Ünvan</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Kurumsal veya bireysel adınız" className="h-12 bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Kurumsal E-Posta</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="iletisim@sirketiniz.com" className="h-12 bg-background/50" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">İlgili Departman</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'support', name: 'Müşteri Destek', icon: Headset },
                        { id: 'business', name: 'İş Geliştirme', icon: Briefcase },
                        { id: 'press', name: 'Basın ve Medya', icon: Megaphone },
                        { id: 'other', name: 'Diğer', icon: MoreHorizontal },
                      ].map((dept) => {
                        const isActive = department === dept.id;
                        const Icon = dept.icon;
                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => setDepartment(dept.id)}
                            className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200 text-left
                              ${isActive
                                ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]"
                                : "border-muted/60 hover:border-primary/40 text-foreground hover:bg-muted/30"
                              }`}
                          >
                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="leading-snug">{dept.name}</span>
                            {isActive && (
                              <span className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">Mesajınız</Label>
                    <textarea 
                      id="message" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Konuyu detaylıca açıklayınız..." 
                      className="flex min-h-[160px] w-full rounded-2xl border border-input bg-background/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={isPending} className="w-full h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/20">
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isPending ? "Gönderiliyor..." : "Gönder"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Formu göndererek <a href="/privacy" className="underline hover:text-primary">Gizlilik Politikası</a> şartlarını kabul etmiş sayılırsınız.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
