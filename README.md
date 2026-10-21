<div align="center">

# OleAI Web Application

**🌐 Language / Dil:** &nbsp; [🇬🇧 English](#en) &nbsp;|&nbsp; [🇹🇷 Türkçe](#tr)

</div>

---

<a id="en"></a>

> 🇹🇷 Türkçe okumak için: **[Türkçe sürüme git ↓](#tr)**

OleAI Web Application is the modern, user-friendly web interface of the AI-powered recipe recommendation and pantry management platform. It is designed to help users discover recipes they can make with the ingredients they have and to manage their personal dietary preferences.

## Tech Stack

- **Frontend library:** React
- **Programming language:** TypeScript
- **Architecture:** Feature-Sliced Design (FSD)
- **Styling:** PostCSS; Tailwind CSS or modular CSS, depending on the project configuration
- **Code quality:** ESLint, SonarQube
- **Deployment:** Docker, Nginx, GitHub Actions (CI/CD)
- **Notifications:** Firebase Cloud Messaging (FCM)

## Setup and Running

### Requirements

- A Node.js LTS version compatible with the version used by the project
- npm
- Git
- Docker (only for running via a container)

### 1. Clone the repository

```bash
git clone https://github.com/onuraydi/OleAI-web.git
cd OleAI-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

If the repository contains a `.env.example` file, copy it to create a `.env` file.

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**

```bash
cp .env.example .env
```

Fill in the variables in the `.env` file according to the project's requirements. Review `.env.example` and the project configuration for the variable names to use.

> **Security:** Do not add real secret keys or sensitive information to the Git repository. Make sure the `.env` file is listed in `.gitignore`. Environment variables used on the client side may be accessible in the build output; do not store server-only secret keys in frontend code.

### 4. Start the development server

```bash
npm run dev
```

Open the address shown in the terminal in your browser. The port may vary depending on the configuration; `http://localhost:3000` is only valid if the project uses that port.

## Running with Docker

Make sure there is a `Dockerfile` in the project root directory. Build the Docker image:

```bash
docker build -t oleai-web .
```

Start the container:

```bash
docker run -d --name oleai-web -p 8080:80 oleai-web
```

Then open the application at <http://localhost:8080>. This port mapping is for configurations where Nginx inside the container listens on port 80.

## Architecture — Feature-Sliced Design

The project is organized with the Feature-Sliced Design (FSD) approach.

- `src/app/`: Application initialization, global styles, routing, and providers.
- `src/pages/`: Page-level compositions.
- `src/widgets/`: Large interface blocks that bring together multiple features or entities.
- `src/features/`: User actions and functional scenarios.
- `src/entities/`: Business domain entities such as recipe, user, and allergen.
- `src/shared/`: Reusable UI components, helper functions, and common configurations.

Preserve the FSD dependency rules: a layer may use the layers below it; lower layers must not depend on upper layers. Base your work on the project's actual folder structure and existing import rules.

## Code Quality and Checks

To run the ESLint check:

```bash
npm run lint
```

This command works only if a `lint` script is defined in `package.json`. To see the available commands:

```bash
npm run
```

If test or build commands are configured in the project, run them before opening a Pull Request as well. Run the SonarQube analysis as determined by the CI/CD configuration.

## Notifications

The project is set up to use Firebase Cloud Messaging (FCM) as its notification infrastructure. The Firebase configuration, the required environment variables, and notification permissions must be set up correctly.

## Contributing

To contribute, report a bug, or take part in the development process, read the guidelines in [`CONTRIBUTING.md`](CONTRIBUTING.md).

<div align="right">

[⬆ Back to top](#) &nbsp;|&nbsp; [🇹🇷 Türkçe sürüme git](#tr)

</div>

---
---

<a id="tr"></a>

> 🇬🇧 To read in English: **[Go to the English version ↑](#en)**

OleAI Web Application, yapay zekâ destekli tarif önerisi ve kiler yönetimi platformunun modern, kullanıcı dostu web arayüzüdür. Kullanıcıların ellerindeki malzemelerle yapabilecekleri tarifleri keşfetmelerine ve kişisel beslenme tercihlerini yönetmelerine yardımcı olmak üzere tasarlanmıştır.

## Teknoloji Yığını (Tech Stack)

- **Frontend kütüphanesi:** React
- **Programlama dili:** TypeScript
- **Mimari:** Feature-Sliced Design (FSD)
- **Stil:** PostCSS; proje yapılandırmasına bağlı olarak Tailwind CSS veya modüler CSS
- **Kod kalitesi:** ESLint, SonarQube
- **Dağıtım:** Docker, Nginx, GitHub Actions (CI/CD)
- **Bildirimler:** Firebase Cloud Messaging (FCM)

## Kurulum ve Çalıştırma

### Gereksinimler

- Projenin kullandığı sürümle uyumlu bir Node.js LTS sürümü
- npm
- Git
- Docker (yalnızca konteyner üzerinden çalıştırmak için)

### 1. Depoyu klonlama

```bash
git clone https://github.com/onuraydi/OleAI-web.git
cd OleAI-web
```

### 2. Bağımlılıkları yükleme

```bash
npm install
```

### 3. Ortam değişkenlerini ayarlama

Depoda `.env.example` dosyası bulunuyorsa bunu kopyalayarak `.env` dosyası oluşturun.

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**

```bash
cp .env.example .env
```

`.env` dosyasındaki değişkenleri projenin gereksinimlerine göre doldurun. Kullanılacak değişken adları için `.env.example` ve proje yapılandırmasını inceleyin.

> **Güvenlik:** Gerçek gizli anahtarları veya hassas bilgileri Git deposuna eklemeyin. `.env` dosyasının `.gitignore` içinde olduğundan emin olun. İstemci tarafında kullanılan ortam değişkenleri derleme çıktısında erişilebilir olabilir; sunucuya özel gizli anahtarları frontend kodunda saklamayın.

### 4. Geliştirme sunucusunu başlatma

```bash
npm run dev
```

Tarayıcıda terminalde belirtilen adresi açın. Port yapılandırmaya göre değişebilir; `http://localhost:3000` yalnızca proje bu portu kullanıyorsa geçerlidir.

## Docker ile Çalıştırma

Proje kök dizininde `Dockerfile` bulunduğundan emin olun. Docker imajını oluşturun:

```bash
docker build -t oleai-web .
```

Konteyneri başlatın:

```bash
docker run -d --name oleai-web -p 8080:80 oleai-web
```

Ardından uygulamayı <http://localhost:8080> adresinde açın. Bu port eşlemesi, konteyner içindeki Nginx'in 80 numaralı portta dinlediği yapılandırmalar içindir.

## Mimari Yapı — Feature-Sliced Design

Proje, Feature-Sliced Design (FSD) yaklaşımıyla organize edilir.

- `src/app/`: Uygulamanın başlatılması, global stiller, yönlendirme ve sağlayıcılar (providers).
- `src/pages/`: Sayfa düzeyindeki bileşimler.
- `src/widgets/`: Birden fazla özellik veya varlığı bir araya getiren büyük arayüz blokları.
- `src/features/`: Kullanıcı eylemleri ve işlevsel senaryolar.
- `src/entities/`: Tarif, kullanıcı, alerjen gibi iş alanı varlıkları.
- `src/shared/`: Yeniden kullanılabilir UI bileşenleri, yardımcı fonksiyonlar ve ortak yapılandırmalar.

FSD bağımlılık kurallarını koruyun: Bir katman, kendisinden daha alt seviyedeki katmanları kullanabilir; alt katmanlar üst katmanlara bağımlı olmamalıdır. Projedeki gerçek klasör yapısını ve mevcut import kurallarını esas alın.

## Kod Kalitesi ve Kontroller

ESLint kontrolünü çalıştırmak için:

```bash
npm run lint
```

Bu komutun çalışması, `package.json` içinde `lint` betiğinin tanımlı olmasına bağlıdır. Kullanılabilir komutları görmek için:

```bash
npm run
```

Projede yapılandırılmış test veya derleme komutları varsa Pull Request öncesinde bunları da çalıştırın. SonarQube analizini CI/CD yapılandırmasının belirlediği şekilde çalıştırın.

## Bildirimler

Proje, bildirim altyapısı olarak Firebase Cloud Messaging (FCM) kullanacak şekilde tanımlanmıştır. Firebase yapılandırmasının, gerekli ortam değişkenlerinin ve bildirim izinlerinin doğru ayarlanması gerekir.

## Katkıda Bulunma

Katkı sağlamak, hata bildirmek veya geliştirme sürecine katılmak için [`CONTRIBUTING.md`](CONTRIBUTING.md) dosyasındaki yönergeleri inceleyin.

<div align="right">

[⬆ Başa dön](#) &nbsp;|&nbsp; [🇬🇧 İngilizce sürüme git](#en)

</div>
