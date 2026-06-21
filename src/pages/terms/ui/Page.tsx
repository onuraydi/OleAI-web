import { Header } from "@/widgets/header"
import { Footer } from "@/widgets/footer"
import { Container } from "@/shared/ui"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-24 bg-background">
        <Container>
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-4 border-b border-border/50 pb-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Kullanım Şartları ve Hizmet Sözleşmesi</h1>
              <p className="text-muted-foreground">Yürürlük Tarihi: 15 Ekim 2024</p>
            </div>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">1. Taraflar ve Kabul</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Bu Kullanım Şartları ve Hizmet Sözleşmesi ("Sözleşme"), OleAI platformunun ("Platform") kullanım koşullarını düzenlemektedir. Platforma erişim sağlayarak, üye olarak veya platformun sunduğu herhangi bir hizmeti kullanarak bu sözleşmede yer alan tüm şartları okuduğunuzu, anladığınızı ve hukuki olarak bunlarla bağlı olduğunuzu gayrikabili rücu kabul etmiş sayılırsınız.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. Hizmetin Doğası ve Sorumluluk Sınırlandırması</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                OleAI, kullanıcıların mutfak envanterini takip etmesini ve yapay zeka algoritmaları aracılığıyla yemek tarifleri üretmesini sağlayan bir yazılımdır. Platform tarafından sunulan tarifler, besin değerleri, alerjen uyarıları ve sağlık tavsiyeleri tamamen otomatik süreçlerle üretilmekte olup <strong>tıbbi veya diyetetik bir danışmanlık niteliği taşımamaktadır</strong>. Sunulan tariflerin uygulanmasından doğabilecek alerjik reaksiyonlar, gıda zehirlenmeleri veya her türlü sağlık probleminden OleAI sorumlu tutulamaz. Gıda güvenliği ve son tüketim tarihi kontrolleri münhasıran kullanıcının sorumluluğundadır.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Fikri Mülkiyet Hakları</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Platformda yer alan tüm yazılımlar, tasarımlar, algoritmalar, logolar, metinler, grafikler ve oluşturulan yapay zeka tarif modellerinin mülkiyet ve telif hakları OleAI'ye aittir. Kullanıcılar, platformu yalnızca bireysel ve ticari olmayan amaçlarla kullanabilir. Platformun kaynak kodlarının kopyalanması, tersine mühendislik uygulanması veya içeriklerin izinsiz ticari amaçla dağıtılması kesinlikle yasaktır ve yasal işlem sebebidir.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. Hesap Güvenliği ve Yetkisiz Kullanım</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Kullanıcılar, hesap oluştururken verdikleri bilgilerin doğruluğundan ve hesap erişim bilgilerinin (parola vb.) gizliliğinden sorumludur. Hesabın üçüncü şahıslar tarafından yetkisiz kullanımından doğacak her türlü hukuki ve cezai sorumluluk ilgili kullanıcıya aittir. OleAI, hileli davranışlar tespit etmesi veya kullanım şartlarının ihlal edilmesi durumunda, önceden bildirimde bulunmaksızın hesapları askıya alma veya kalıcı olarak silme hakkını saklı tutar.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. Değişiklikler ve Uyuşmazlık Çözümü</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                OleAI, sunulan hizmetlerde, arayüzde veya bu sözleşmenin maddelerinde dilediği zaman tek taraflı değişiklik yapma hakkına sahiptir. Güncel sözleşme platformda yayınlandığı an itibarıyla geçerlilik kazanır. Bu sözleşmenin uygulanmasından doğabilecek her türlü ihtilafta İstanbul (Merkez) Mahkemeleri ve İcra Daireleri münhasıran yetkilidir.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
