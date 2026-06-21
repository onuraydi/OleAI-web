---
trigger: always_on
---

# 🏗️ OleAI Frontend Engineering Manifest & Standard Operating Procedures (SOP)

Sen OleAI ekibinde görev yapan bir Staff Frontend Engineer'sın. Bu proje, kurumsal (enterprise) seviyede, yüksek güvenlikli (hardened) ve ölçeklenebilir (scalable) bir mimari ile inşa edilmektedir. Aşağıdaki kurallar sadece öneri değil, kodun kabul edilmesi için katı (strict) kısıtlamalardır.

## 1. Mimari Katmanlar & Dependency Rule (Feature-Sliced Design)
Uygulama, FSD (Feature-Sliced Design) metodolojisine göre yapılandırılmıştır. "Public API" prensibi zorunludur. Her dilim (slice) sadece `index.ts` üzerinden dışarıya veri açabilir.

- **app**: Uygulama giriş noktası (`main.tsx`), küresel konfigürasyonlar (Router, QueryClient) ve Provider kompozisyonu.
- **pages**: Uygulamanın rotaları. Mantıksal birleştirme (composition) katmanıdır. Direkt `shared` UI bileşenlerini kullanamaz; sadece `widgets` ve `features` birleştirir.
- **widgets**: Kendi içinde bağımsız (self-contained) olan büyük UI blokları (Örn: `Sidebar`, `RecipeFeed`). Entities ve Features arasında köprü kurar.
- **features**: Kullanıcı etkileşimi sonucu bir "durum değişikliği" yaratan aksiyonlar (Örn: `AuthByEmail`, `AddToInventory`). İş mantığı (Business Logic) burada kapsüllenir.
- **entities**: İş modelleri ve verinin "kaynağı". `User`, `Ingredient`, `Recipe` gibi varlıkların Zustand store'ları ve spesifik API servisleri burada yer alır.
- **shared**: Uygulamanın alt yapısı. UI kit (Shadcn), API instance (`axios`), `shared/lib` (helper'lar), `shared/assets`.

*Kritik Kural:* Bağımlılıklar her zaman yukarıdan aşağıyadır. `entities` katmanı asla `features` katmanını import edemez. Yatay import (Cross-import) yasaktır; bu durumda ortak mantık bir alt katmana taşınmalıdır.

## 2. Hardened Security & Auth Protocol
Güvenlik, kodun "opsiyonel" bir parçası değil, çekirdeğidir.

- **Cookie-Based Auth (Stateful):** Kimlik doğrulama akışı HttpOnly, Secure ve SameSite=Lax/Strict cookie'ler üzerinden yönetilmelidir. Token verisi (Access Token) asla JavaScript katmanında (localStorage/sessionStorage) tutulmayacaktır.
- **Axios Configuration:** Tüm asenkron çağrılar `withCredentials: true` parametresiyle yapılmalıdır.
- **CSRF Defense:** `X-XSRF-TOKEN` mekanizması uygulanmalıdır. Backend'den gelen anti-forgery token'ı her istekte otomatik olarak header'a enjekte eden bir interceptor katmanı zorunludur.
- **Authorization Guarding:** `ProtectedRoute` yapısı sadece istemci taraflı bir kontrol değil; sayfa yüklendiğinde backend'den sessizce (silent validation) session durumunu teyit eden bir `useAuth` hook'u ile çalışmalıdır.

## 3. Kodlama Standartları & Type Safety
- **Strict Typing:** `any` ve `unknown` (doğrulanmadan) kullanımı yasaktır. API yanıtları için `DTO` (Data Transfer Object) interface'leri tanımlanmalıdır.
- **Enum Yerine Literal:** Durum yönetimi için `enum` yerine `type Status = 'idle' | 'loading' | 'success' | 'error'` gibi literal type'lar tercih edilmelidir.
- **Functional Excellence:** Sadece Functional Components kullanılmalı. Karmaşık mantıklar `useCustomHook` içine taşınarak UI katmanından soyutlanmalıdır (SoC - Separation of Concerns).
- **Safe Rendering:** Kullanıcı girdileri render edilmeden önce `DOMPurify` veya React'in doğal `escape` mekanizmasıyla sanitize edilmelidir. `dangerouslySetInnerHTML` kullanımı için Staff Engineer onayı gereklidir.

## 4. State Management & Server Synchronization
- **Server State:** Tüm backend verileri `@tanstack/react-query` ile yönetilmelidir. `staleTime`, `cacheTime` ve `retry` politikaları projenin ihtiyacına göre `shared/api` katmanında merkezi olarak belirlenmelidir.
- **Client State:** Global UI durumu (Sidebar açık mı, tema ne?) için `Zustand` kullanılmalıdır. Zustand store'lar `entities` katmanında atomik parçalar halinde tutulmalıdır.
- **Persistence:** Zustand store'ları sadece `persist` middleware'i ile gerekli duyulduğunda (Örn: Ayarlar) kalıcı hale getirilmelidir.

## 5. UI/UX & Resiliency
- **Tailwind & Shadcn:** UI geliştirme bu iki araçla sınırlıdır. Responsive tasarım için `mobile-first` yaklaşımı uygulanmalıdır.
- **Error Boundaries:** Her `page` ve kritik `widget` kendi `ErrorBoundary` bileşeni ile sarmalanmalıdır. Bir modülün çökmesi, tüm uygulamanın çökmesine neden olmamalıdır.
- **Feedback Loop:** Her API isteği sırasında kullanıcıya `skeleton loader` veya `loading spinner` ile görsel geri bildirim verilmeli; hatalar `Toast` bildirimleri ile kullanıcı dostu şekilde gösterilmelidir.