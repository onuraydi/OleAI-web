import { Header } from "@/widgets/header"
import { Footer } from "@/widgets/footer"
import { Container } from "@/shared/ui"

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-24 bg-background">
        <Container>
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-4 border-b border-border/50 pb-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Gizlilik ve Kişisel Verilerin Korunması Politikası</h1>
              <p className="text-muted-foreground">Son Güncelleme Tarihi: 15 Ekim 2024</p>
            </div>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">1. Amaç ve Kapsam</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Bu Gizlilik Politikası, OleAI ("Şirket", "Biz" veya "Platform") olarak, platformumuzu kullanan ziyaretçilerimizin ve üyelerimizin ("Kullanıcı") kişisel verilerinin Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili uluslararası mevzuatlara uygun olarak toplanması, işlenmesi, saklanması ve korunmasına ilişkin prensiplerimizi belirlemektedir.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. Toplanan Kişisel Veriler ve İşlenme Amaçları</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Platformumuzu kullanımınız esnasında; kimlik ve iletişim bilgileriniz (ad, soyad, e-posta adresi), uygulama içi kullanım verileriniz (girilen malzemeler, beslenme tercihleri, favori tarifler) ve teknik cihaz verileriniz (IP adresi, çerez kayıtları) toplanmaktadır. Bu veriler; yapay zeka destekli tarif öneri algoritmalarımızın kişiselleştirilmesi, kullanıcı deneyiminin optimize edilmesi, yasal yükümlülüklerimizin yerine getirilmesi ve bilgi güvenliği süreçlerinin yürütülmesi amacıyla işlenmektedir.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Kişisel Verilerin Aktarımı</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Kullanıcılarımıza ait kişisel veriler, kural olarak üçüncü kişilerle paylaşılmamaktadır. Ancak, yasal zorunluluklar gereği yetkili kamu kurum ve kuruluşları ile veya altyapı/sunucu hizmeti aldığımız güvenilir teknoloji iş ortaklarımızla (sınırlı, şifreli ve KVKK standartlarına uygun olarak) veri paylaşımı yapılabilmektedir. Üçüncü parti yapay zeka entegrasyonlarına gönderilen besin/malzeme verileri tamamen anonimleştirilmektedir.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. Veri Güvenliği ve Saklama Süresi</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Şirketimiz, kişisel verilerinizin yetkisiz erişime, kaybolmaya veya değiştirilmeye karşı korunması için uçtan uca şifreleme, güvenlik duvarları ve düzenli sızma testleri dâhil olmak üzere endüstri standartlarında teknik ve idari tedbirleri almaktadır. Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen kanuni süreler dâhilinde saklanmakta, süre bitiminde güvenli bir şekilde imha edilmektedir.
              </p>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. Kullanıcı Hakları</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini isteme ve silinmesini talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak için <strong>kvkk@oleai.com</strong> adresi üzerinden bizimle iletişime geçebilirsiniz.
              </p>
            </section>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
