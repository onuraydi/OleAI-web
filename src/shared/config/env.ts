if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error("KRİTİK HATA: VITE_API_BASE_URL çevre değişkeni bulunamadı!");
}

export const ENV = {
  API_URL: import.meta.env.VITE_API_BASE_URL,
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
} as const;