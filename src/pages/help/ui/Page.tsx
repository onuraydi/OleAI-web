import { Header } from "@/widgets/header"
import { Footer } from "@/widgets/footer"
import { Container, Button } from "@/shared/ui"
import { ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"

const faqs = [
  {
    question: "Nasıl yeni malzeme ekleyebilirim?",
    answer: "Kiler sayfasına giderek sağ üstteki 'Malzeme Ekle' butonuna tıklayabilirsiniz. Yakında barkod okutarak veya sesli komutla da malzeme ekleme özelliklerimiz aktif olacaktır."
  },
  {
    question: "Yapay zeka tarifleri neye göre oluşturuyor?",
    answer: "OleAI, elinizdeki malzemeleri, son kullanma tarihi yaklaşan ürünleri, belirttiğiniz alerjenleri ve diyet tercihlerinizi analiz ederek size en uygun ve sıfır israfı hedefleyen tarifler sunar."
  },
  {
    question: "Alerjilerimi veya diyet türümü nasıl belirtebilirim?",
    answer: "Profil veya Ayarlar sayfasında 'Beslenme Tercihleri' sekmesinden alerjilerinizi (örneğin fıstık, gluten) ve diyet türünüzü (vegan, vejetaryen, ketojenik vb.) seçebilirsiniz. Tüm tarifler bu filtrelere uygun olarak oluşturulur."
  },
  {
    question: "Uygulamayı birden fazla cihazda kullanabilir miyim?",
    answer: "Evet! Hesabınızla giriş yaptığınız sürece akıllı telefonunuz, tabletiniz ve bilgisayarınız üzerinden tüm bilgilerinize eş zamanlı olarak erişebilirsiniz."
  },
  {
    question: "Alışveriş listesi otomatik mi güncelleniyor?",
    answer: "Evet, bir tarifi pişirdiğinizde veya kilerinizdeki bir malzeme azaldığında, yapay zeka eksik malzemeleri otomatik olarak alışveriş listenize ekler."
  },
  {
    question: "Sevdiğim bir tarifi kaydedebilir miyim?",
    answer: "Tabii ki, oluşturulan herhangi bir tarifin yanındaki 'Favorilere Ekle' (kalp) ikonuna tıklayarak tariflerinizi kaydedebilir ve daha sonra 'Favori Tariflerim' menüsünden kolayca ulaşabilirsiniz."
  },
  {
    question: "Şifremi unuttum, nasıl sıfırlayabilirim?",
    answer: "Giriş ekranındaki 'Şifremi Unuttum' bağlantısına tıklayarak e-posta adresinize bir parola sıfırlama bağlantısı gönderebilirsiniz."
  },
  {
    question: "Hesabımı nasıl silebilirim?",
    answer: "Profil ayarları sayfasının en altında yer alan 'Hesabımı Sil' butonunu kullanarak hesabınızı ve ilişkili tüm verilerinizi kalıcı olarak silebilirsiniz."
  }
]

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-24 bg-background">
        <Container>
          <div className="max-w-4xl mx-auto space-y-16">
            
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Nasıl Yardımcı Olabiliriz?</h1>
              <p className="text-xl text-muted-foreground">Aşağıdaki sıkça sorulan soruları inceleyebilir veya destek ekibimizle iletişime geçebilirsiniz.</p>
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b border-border/50 pb-4">Sıkça Sorulan Sorular (SSS)</h2>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group bg-card/40 border border-border/50 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
                    <summary className="flex justify-between items-center p-6 cursor-pointer text-lg font-semibold hover:bg-secondary/30 transition-colors">
                      {faq.question}
                      <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-300" />
                    </summary>
                    <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-border/50 bg-secondary/10">
                      <p className="mt-4">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 rounded-[2.5rem] p-10 text-center border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Aradığınızı Bulamadınız mı?</h3>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Destek ekibimiz hafta içi 09:00 - 18:00 saatleri arasında size yardımcı olmaktan mutluluk duyacaktır. İletişim sayfasından veya e-posta yoluyla ulaşabilirsiniz.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/contact">
                    <Button variant="outline" className="w-full sm:w-auto rounded-full h-12 px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold">
                      Bize Ulaşın
                    </Button>
                  </Link>
                  <a href="mailto:destek@oleai.com.tr">
                    <Button className="w-full sm:w-auto rounded-full h-12 px-8 shadow-lg shadow-primary/20 font-semibold">
                      E-Posta Gönder
                    </Button>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
