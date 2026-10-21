[🇬🇧 English](#english) | [🇹🇷 Türkçe](#turkish)

---

<a id="english"></a>

# OleAI Web Application — Contributing Guide

Thank you for your interest in contributing to the OleAI Web Application project. This guide is designed to help maintain a consistent, testable, and sustainable development workflow.

## Development Workflow

1. Keep your fork or local repository up to date.
2. Create a separate branch for your changes.
3. Implement your changes in the appropriate FSD layer.
4. Run the relevant lint, test, and build checks.
5. Use commit messages that follow the Conventional Commits format.
6. Open a Pull Request (PR) on GitHub.

Instead of committing directly to the main repository, follow the branching and review process established by the team.

## Branch Naming Conventions

- **New feature:** `feature/feature-name`
- **Bug fix:** `bugfix/bug-name`
- **Urgent fix:** `hotfix/bug-name`
- **Maintenance or documentation:** `chore/update-name` or `docs/update-name`
- **Refactoring:** `refactor/improvement-name`
- **Tests:** `test/test-name`

Example:

```bash
git checkout main
git pull origin main
git checkout -b feature/admin-dashboard-analytics
```

If the repository uses a different default branch name instead of `main`, use the correct branch name configured in the repository.

## Commit Messages — Conventional Commits

Use the [Conventional Commits](https://www.conventionalcommits.org/) format for commit messages:

```text
<type>: <short and descriptive message>
```

Examples:

- `feat: add recipe filtering by allergens`
- `fix: handle null error on user dashboard`
- `refactor: simplify recipe card state handling`
- `style: align recipe card spacing`
- `docs: update local setup instructions`
- `test: add pantry filtering tests`
- `ci: update frontend quality checks`

| Type | Purpose |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Improve code structure without changing behavior |
| `style` | Formatting changes that do not affect functionality |
| `docs` | Documentation |
| `test` | Adding or modifying tests |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |

## Coding Standards and FSD Architecture

### FSD Layers

Place components and business logic in the layers appropriate to their responsibilities:

- `app`: Application setup and providers
- `pages`: Page compositions
- `widgets`: Large, reusable UI blocks
- `features`: User scenarios and actions
- `entities`: Business domain entities
- `shared`: Common and independent components and utilities

Maintain the dependency rules between layers. Higher-level layers may use lower-level layers, but lower-level layers must not depend on higher-level ones. Follow the public APIs exposed by each slice and the project's existing import conventions.

### TypeScript and Type Safety

- Avoid unnecessary use of `any`; prefer explicit types or `unknown` whenever possible.
- Create reusable type definitions for API requests and responses.
- Explicitly type component props.
- Handle optional fields, `null` values, and error states correctly.
- Do not treat server-provided data as trustworthy without validation.

### React and Component Design

- Ensure that each component has a single, clearly defined responsibility.
- Avoid placing excessive business logic directly inside presentation components.
- Follow the project's existing state management and data access patterns.
- Handle loading, empty-result, and error states in the user interface.
- Follow accessibility and responsive design principles.

### Styling and Code Quality

- Follow the CSS/PostCSS approach and design conventions used in the project.
- Do not assume that a CSS framework is available unless it is listed among the project's actual dependencies. Check `package.json`.
- Run the ESLint check before opening a PR:

```bash
npm run lint
```

If this script is not defined, inspect the available scripts in `package.json` and use the appropriate command for the project's configuration.

## Testing and Validation

Run the appropriate tests based on the scope of your changes. If the corresponding scripts are available in the project, run the following checks:

```bash
npm run lint
npm run test
npm run build
```

These commands depend on the corresponding scripts being defined in `package.json`. To list the available scripts, run:

```bash
npm run
```

When introducing new behavior, update existing tests or add new ones. In particular, verify both normal and edge cases for workflows such as recipe filtering, pantry ingredients, user interactions, and API error handling.

## Security and Environment Variables

- Never commit `.env` files, tokens, or actual API keys.
- Document required environment variables in `.env.example` using example values. Never include real secrets.
- Remember that environment variables included in the frontend bundle may be visible in the browser.
- Handle user input and API responses appropriately.
- Do not disclose security vulnerabilities in detail through public issues or PRs. Contact the maintainers through a private channel instead.

## Pull Request (PR) Process

### 1. Preparing Your Changes

```bash
git status
git add .
git commit -m "feat: add recipe filtering by allergens"
git push origin feature/recipe-filtering-by-allergens
```

Replace the branch name with your actual branch name. Before committing, use `git status` to ensure that no sensitive or unrelated files have been included accidentally.

### 2. Pull Request Description

Include the following information in your PR description:

- **Purpose:** Why is this change necessary?
- **Changes:** What was added, fixed, or removed?
- **Affected areas:** Which pages, FSD slices, or user workflows are affected?
- **Tests:** Which lint, test, and build commands were executed?
- **Visual evidence:** Include screenshots whenever possible if the change affects the UI.
- **Related issue:** If applicable, reference the relevant issue using a statement such as `Closes #12`.

### 3. CI and Code Review

- Ensure that the GitHub Actions workflows complete successfully.
- Fix any failing checks.
- Review and address feedback from code reviewers.
- Push any required revisions to the same branch.
- The PR will be merged after the project maintainers complete their review and approval process.

## Pre-PR Checklist

- [ ] I created an appropriate branch for my changes.
- [ ] I placed the code in the appropriate FSD layer.
- [ ] I checked TypeScript types and error handling.
- [ ] I ran the relevant lint, test, and build checks.
- [ ] I did not include secrets or local `.env` files.
- [ ] I used the Conventional Commits format for commit messages.
- [ ] I described the changes and test results in the PR.
- [ ] I included appropriate screenshots for UI changes.

Thank you for your contributions and for taking the time to improve OleAI!

---

<a id="turkish"></a>

# OleAI Web Application — Katkıda Bulunma Rehberi

OleAI Web Application projesine katkıda bulunmak istediğiniz için teşekkürler. Bu rehber, geliştirme sürecinin tutarlı, test edilebilir ve sürdürülebilir ilerlemesine yardımcı olmak için hazırlanmıştır.

## Geliştirme İş Akışı (Workflow)

1. Fork'unuzu veya yerel deponuzu güncel tutun.
2. Yapacağınız değişiklik için ayrı bir branch oluşturun.
3. Değişikliklerinizi ilgili FSD katmanında uygulayın.
4. Uygun lint, test ve build kontrollerini çalıştırın.
5. Conventional Commits biçimine uygun commit mesajları kullanın.
6. GitHub üzerinden Pull Request (PR) açın.

Ana depoya doğrudan commit göndermek yerine ekip tarafından belirlenen branch ve inceleme sürecini izleyin.

## Branch İsimlendirme Kuralları

- **Yeni özellik:** `feature/ozellik-adi`
- **Hata düzeltmesi:** `bugfix/hata-adi`
- **Acil düzeltme:** `hotfix/hata-adi`
- **Bakım veya dokümantasyon:** `chore/guncelleme-adi` veya `docs/guncelleme-adi`
- **Refactor:** `refactor/iyilestirme-adi`
- **Test:** `test/test-adi`

Örnek:

```bash
git checkout main
git pull origin main
git checkout -b feature/admin-dashboard-analytics
```

Ana branch'in adı depoda `main` yerine farklıysa, depoda kullanılan doğru adı tercih edin.

## Commit Mesajları — Conventional Commits

Commit mesajlarında [Conventional Commits](https://www.conventionalcommits.org/) biçimini kullanın:

```text
<type>: <kısa ve açıklayıcı mesaj>
```

Örnekler:

- `feat: add recipe filtering by allergens`
- `fix: handle null error on user dashboard`
- `refactor: simplify recipe card state handling`
- `style: align recipe card spacing`
- `docs: update local setup instructions`
- `test: add pantry filtering tests`
- `ci: update frontend quality checks`

| Tür | Kullanım |
| --- | --- |
| `feat` | Yeni özellik |
| `fix` | Hata düzeltmesi |
| `refactor` | Davranışı değiştirmeden kod yapısını iyileştirme |
| `style` | İşlevi etkilemeyen biçimlendirme değişiklikleri |
| `docs` | Dokümantasyon |
| `test` | Test ekleme veya düzenleme |
| `ci` | CI/CD yapılandırması |
| `chore` | Bakım işleri |

## Kod Standartları ve FSD Mimarisi

### FSD katmanları

Bileşenleri ve iş mantığını sorumluluklarına uygun katmanlara yerleştirin:

- `app`: Uygulama kurulumu ve sağlayıcılar
- `pages`: Sayfa bileşimleri
- `widgets`: Büyük, yeniden kullanılabilir arayüz blokları
- `features`: Kullanıcı senaryoları ve eylemler
- `entities`: İş alanı varlıkları
- `shared`: Ortak ve bağımsız bileşenler, yardımcılar

Katmanlar arasındaki bağımlılık kurallarını koruyun. Üst seviyedeki katmanlar alt seviyedeki katmanları kullanabilir; alt seviyedeki katmanlar üst seviyedekilere bağımlı olmamalıdır. Bir slice içindeki dışa açık API'leri ve projenin mevcut import kurallarını izleyin.

### TypeScript ve tip güvenliği

- Gereksiz `any` kullanımından kaçının; mümkün olduğunda açık türler veya `unknown` kullanın.
- API istekleri ve yanıtları için tekrar kullanılabilir tip tanımları oluşturun.
- Bileşen prop'larını açık biçimde tipleyin.
- İsteğe bağlı alanları, `null` değerlerini ve hata durumlarını doğru ele alın.
- Sunucudan gelen veriyi doğrulamadan güvenilir kabul etmeyin.

### React ve bileşen tasarımı

- Bileşenlerin tek ve anlaşılır sorumlulukları olmasına özen gösterin.
- İş mantığını gereksiz yere görsel bileşenlerin içine yığmayın.
- Mevcut proje durum yönetimi ve veri erişim yaklaşımını takip edin.
- Yükleniyor, boş sonuç ve hata durumlarını kullanıcı arayüzünde ele alın.
- Erişilebilirlik ve duyarlı tasarım ilkelerini gözetin.

### Stil ve kod kalitesi

- Projede kullanılan CSS/PostCSS yaklaşımına ve tasarım kurallarına uyun.
- Projede bulunmayan bir CSS framework'ünü varsaymayın; gerçek bağımlılıkları `package.json` üzerinden kontrol edin.
- PR öncesinde ESLint kontrolünü çalıştırın:

```bash
npm run lint
```

Bu betik tanımlı değilse, mevcut `package.json` betiklerini kontrol edin ve proje yapılandırmasına uygun komutu kullanın.

## Test ve Doğrulama

Değişikliğin kapsamına göre uygun testleri çalıştırın. Projede mevcutsa şu kontrolleri uygulayın:

```bash
npm run lint
npm run test
npm run build
```

Bu komutların çalışması, `package.json` içinde ilgili betiklerin tanımlı olmasına bağlıdır. Mevcut betikleri listelemek için:

```bash
npm run
```

Yeni davranış eklediğinizde ilgili testleri güncelleyin veya ekleyin. Özellikle tarif filtreleme, kiler malzemeleri, kullanıcı etkileşimleri ve API hata durumları gibi akışlarda normal ve sınır durumlarını doğrulayın.

## Güvenlik ve Ortam Değişkenleri

- `.env` dosyasını, token'ları veya gerçek API anahtarlarını commit etmeyin.
- Gerekli ortam değişkenlerini `.env.example` içinde örnek değerlerle belgeleyin; gerçek sırları eklemeyin.
- Frontend'e dahil edilen ortam değişkenlerinin tarayıcıda görülebileceğini unutmayın.
- Kullanıcı girdilerini ve API yanıtlarını uygun şekilde ele alın.
- Güvenlik açıklarını herkese açık issue veya PR içinde ayrıntılı biçimde yayımlamayın; bakımcılarla özel bir kanal üzerinden iletişim kurun.

## Pull Request (PR) Süreci

### 1. Değişiklikleri hazırlama

```bash
git status
git add .
git commit -m "feat: add recipe filtering by allergens"
git push origin feature/recipe-filtering-by-allergens
```

Branch adını kendi branch'inizle değiştirin. Commit öncesinde `git status` ile yanlışlıkla gizli veya ilgisiz dosyalar eklenmediğini kontrol edin.

### 2. Pull Request açıklaması

PR açıklamasında aşağıdaki bilgileri belirtin:

- **Amaç:** Değişiklik neden gerekli?
- **Değişiklikler:** Neler eklendi, düzeltildi veya kaldırıldı?
- **Etkilenen alanlar:** Hangi sayfalar, FSD slice'ları veya kullanıcı akışları etkilendi?
- **Testler:** Hangi lint, test ve build komutları çalıştırıldı?
- **Görsel kanıt:** Arayüz değişikliği varsa mümkün olduğunda ekran görüntüsü ekleyin.
- **Issue bağlantısı:** İlgili bir issue varsa `Closes #12` gibi bir ifade kullanın.

### 3. CI ve kod incelemesi

- GitHub Actions iş akışlarının başarılı olduğunu doğrulayın.
- Başarısız kontrolleri düzeltin.
- Kod incelemesinden gelen geri bildirimleri değerlendirin.
- Gerekli düzenlemeleri aynı branch'e gönderin.
- PR, proje bakımcılarının inceleme ve onay sürecinden sonra birleştirilir.

## PR Öncesi Kontrol Listesi

- [ ] Değişiklik için uygun bir branch oluşturdum.
- [ ] Kod ilgili FSD katmanına yerleştirildi.
- [ ] TypeScript tiplerini ve hata durumlarını kontrol ettim.
- [ ] İlgili lint, test ve build kontrollerini çalıştırdım.
- [ ] Gizli anahtar veya yerel `.env` dosyası eklemedim.
- [ ] Commit mesajlarını Conventional Commits biçiminde yazdım.
- [ ] PR açıklamasında değişikliği ve test sonuçlarını belirttim.
- [ ] Arayüz değişikliklerinde uygun ekran görüntülerini ekledim.

Katkınız ve OleAI'ı geliştirmeye ayırdığınız zaman için teşekkür ederiz!
