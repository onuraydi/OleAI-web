import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  BarChart2,
  Leaf,
  Settings,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Camera,
  BookOpen,
  ThumbsDown,
  KeyRound,
  MessageSquare,
} from "lucide-react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { UserStatistics } from "@/widgets/user-statistics/ui/UserStatistics";
import { ProfileRecipesTab } from "@/widgets/profile-recipes";
import { ProfileCommentsTab } from "@/widgets/profile-comments";
import { 
  EditProfileForm, 
  DietaryPreferencesEditor, 
  AllergiesEditor, 
  ChangePasswordForm, 
  DislikedIngredientsEditor 
} from "@/features/edit-profile";
import { userApi } from "@/entities/user";
import { useSessionStore } from "@/entities/session";

const TABS = [
  { id: "overview", label: "Genel Bakış", icon: BarChart2 },
  { id: "recipes", label: "Tariflerim", icon: BookOpen },
  { id: "comments", label: "Yorumlarım", icon: MessageSquare },
  { id: "edit", label: "Profili Düzenle", icon: User },
  { id: "nutrition", label: "Beslenme", icon: Leaf },
  { id: "account", label: "Ayarlar", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProfilePage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab as TabId);
    }
  }, [location.state]);

  const sessionUser = useSessionStore((s) => s.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: userApi.getProfile,
    staleTime: 1000 * 60 * 2,
  });

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim() || profile.username
    : sessionUser?.username || sessionUser?.email?.split("@")[0] || "Kullanıcı";

  const avatarLetter = (displayName?.[0] || "K").toUpperCase();
  const avatarUrl = profile?.profileImageUrl ?? sessionUser?.profileImageUrl;
  const memberSince = profile?.createdDate
    ? new Date(profile.createdDate).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />

        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pb-16">

          {/* ── Hero / Profile Header ── */}
          <section className="relative">
            {/* Cover gradient */}
            <div className="h-64 sm:h-80 rounded-b-[3rem] bg-gradient-to-br from-primary/40 via-violet-500/30 to-rose-500/30 dark:from-primary/30 dark:via-violet-500/20 dark:to-rose-500/20 overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
              {/* subtle pattern */}
              <svg className="absolute bottom-0 right-0 opacity-[0.15] w-96 h-96 text-primary mix-blend-overlay" viewBox="0 0 200 200" fill="currentColor">
                <circle cx="160" cy="160" r="80" />
                <circle cx="40" cy="40" r="50" />
              </svg>
            </div>

            {/* Avatar + info */}
            <div className="px-6 sm:px-12 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-24 sm:-mt-28 relative z-10">
                {/* Avatar */}
                <div className="relative shrink-0 group">
                  {isLoading ? (
                    <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-muted animate-pulse border-[6px] border-background shadow-2xl" />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profil"
                      className="w-36 h-36 sm:w-48 sm:h-48 rounded-[2.5rem] object-cover border-[6px] border-background shadow-2xl group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-[2.5rem] bg-gradient-to-br from-primary to-violet-600 border-[6px] border-background shadow-2xl flex items-center justify-center text-white font-black text-5xl sm:text-7xl group-hover:scale-[1.02] transition-transform duration-300">
                      {avatarLetter}
                    </div>
                  )}
                  <button
                    onClick={() => setActiveTab("edit")}
                    className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-12 h-12 rounded-2xl bg-background border-2 border-muted shadow-xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all group-hover:scale-110"
                    title="Profil fotoğrafını değiştir"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* Name & meta */}
                <div className="flex-1 min-w-0 sm:pb-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-10 w-64 rounded-xl bg-muted animate-pulse" />
                      <div className="h-5 w-48 rounded-lg bg-muted animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h1 className="text-3xl sm:text-5xl font-black text-foreground truncate tracking-tight">
                          {displayName}
                        </h1>
                        {profile?.username && (
                          <span className="text-xl sm:text-2xl font-bold text-muted-foreground/60">
                            @{profile.username}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        <span className="text-sm sm:text-base font-bold text-muted-foreground/90 flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          {profile?.email ?? sessionUser?.email}
                        </span>
                        {memberSince && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {memberSince}'dan beri üye
                          </span>
                        )}
                        {profile?.isEmailVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <ShieldCheck className="w-3 h-3" /> Doğrulandı
                          </span>
                        )}
                      </div>

                      {/* Diyet + Alerji badges */}
                      {(profile?.dietaryPreferences.length ?? 0) > 0 || (profile?.allergies.length ?? 0) > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {profile?.dietaryPreferences.slice(0, 3).map((p) => (
                            <span key={p.id} className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
                              <Leaf className="w-3 h-3" /> {p.name}
                            </span>
                          ))}
                          {profile?.allergies.slice(0, 2).map((a) => (
                            <span key={a.id} className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> {a.name}
                            </span>
                          ))}
                          {((profile?.dietaryPreferences.length ?? 0) + (profile?.allergies.length ?? 0)) > 5 && (
                            <span className="px-2.5 py-1 rounded-xl bg-muted/60 text-muted-foreground text-xs font-bold">
                              +{((profile?.dietaryPreferences.length ?? 0) + (profile?.allergies.length ?? 0)) - 5} daha
                            </span>
                          )}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Edit shortcut button */}
                <button
                  onClick={() => setActiveTab("edit")}
                  className="shrink-0 h-12 px-6 rounded-2xl border-2 border-muted/60 font-bold text-sm hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl transition-all sm:self-end"
                >
                  Profili Düzenle
                </button>
              </div>
            </div>
          </section>

          {/* ── Tabs ── */}
          <div className="px-6 sm:px-12 mt-6 mb-8">
            <div className="flex gap-2 p-2 rounded-full bg-muted/30 border border-muted/50 w-full overflow-x-auto scrollbar-hide shadow-sm backdrop-blur-sm">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap flex-1 sm:flex-none justify-center
                    ${activeTab === tab.id
                      ? "text-white bg-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:scale-[1.02]"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="mt-12 px-6 sm:px-12">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-12"
                >
                  {/* Stats */}
                  <div>
                    <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
                      <BarChart2 className="w-6 h-6 text-primary" />
                      Aktivite İstatistikleri
                    </h2>
                    <UserStatistics />
                  </div>

                  {/* Summary cards (Bento Box style) */}
                  {profile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Dietary */}
                      <div className="group relative p-8 rounded-[2rem] bg-card border-2 border-muted/30 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-primary" />
                          </div>
                          <button
                            onClick={() => setActiveTab("nutrition")}
                            className="px-4 py-2 rounded-xl bg-muted/50 text-sm font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
                          >
                            Düzenle
                          </button>
                        </div>
                        <h3 className="text-xl font-black mb-4 relative z-10">Beslenme Tercihleri</h3>
                        {profile.dietaryPreferences.length === 0 ? (
                          <p className="text-muted-foreground font-medium flex-1">Herhangi bir beslenme kısıtlaman bulunmuyor.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 relative z-10">
                            {profile.dietaryPreferences.map((p) => (
                              <span key={p.id} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                                {p.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Allergies */}
                      <div className="group relative p-8 rounded-[2rem] bg-card border-2 border-muted/30 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <ShieldAlert className="w-6 h-6 text-primary" />
                          </div>
                          <button
                            onClick={() => setActiveTab("nutrition")}
                            className="px-4 py-2 rounded-xl bg-muted/50 text-sm font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
                          >
                            Düzenle
                          </button>
                        </div>
                        <h3 className="text-xl font-black mb-4 relative z-10">Alerjiler</h3>
                        {profile.allergies.length === 0 ? (
                          <p className="text-muted-foreground font-medium flex-1">Kayıtlı bir gıda alerjin bulunmuyor.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 relative z-10">
                            {profile.allergies.map((a) => (
                              <span key={a.id} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                                {a.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Disliked Ingredients */}
                      <div className="group relative p-8 rounded-[2rem] bg-card border-2 border-muted/30 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col md:col-span-2">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <ThumbsDown className="w-6 h-6 text-primary" />
                          </div>
                          <button
                            onClick={() => setActiveTab("nutrition")}
                            className="px-4 py-2 rounded-xl bg-muted/50 text-sm font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
                          >
                            Düzenle
                          </button>
                        </div>
                        <h3 className="text-xl font-black mb-4 relative z-10">Sevilmeyen Malzemeler</h3>
                        {profile.dislikedIngredients.length === 0 ? (
                          <p className="text-muted-foreground font-medium flex-1">Sevilmeyen bir malzeme bulunmuyor.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2 relative z-10">
                            {profile.dislikedIngredients.map((d) => (
                              <span key={d.id} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                                {d.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "recipes" && (
                <motion.div
                  key="recipes"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileRecipesTab />
                </motion.div>
              )}

              {activeTab === "comments" && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileCommentsTab />
                </motion.div>
              )}

              {activeTab === "edit" && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8 rounded-[2rem] bg-card border border-muted/40 shadow-sm"
                >
                  <h2 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Kişisel Bilgiler
                  </h2>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 rounded-xl bg-muted/50 animate-pulse" />
                      ))}
                    </div>
                  ) : profile ? (
                    <EditProfileForm profile={profile} />
                  ) : null}
                </motion.div>
              )}

              {activeTab === "nutrition" && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Dietary */}
                  <div className="p-6 sm:p-8 rounded-[2rem] bg-card border border-muted/40 shadow-sm">
                    <h2 className="text-lg font-black text-foreground mb-1 flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      Beslenme Tercihleri
                    </h2>
                    <div className="mt-5">
                      {profile ? (
                        <DietaryPreferencesEditor currentPreferences={profile.dietaryPreferences} />
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-14 rounded-2xl bg-muted/50 animate-pulse" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="p-6 sm:p-8 rounded-[2rem] bg-card border border-muted/40 shadow-sm">
                    <h2 className="text-lg font-black text-foreground mb-1 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-primary" />
                      Alerji ve Gıda Kısıtlamaları
                    </h2>
                    <div className="mt-5">
                      {profile ? (
                        <AllergiesEditor currentAllergies={profile.allergies} />
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-14 rounded-2xl bg-muted/50 animate-pulse" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Disliked Ingredients */}
                  <div className="p-6 sm:p-8 rounded-[2rem] bg-card border border-muted/40 shadow-sm">
                    <h2 className="text-lg font-black text-foreground mb-1 flex items-center gap-2">
                      <ThumbsDown className="w-5 h-5 text-primary" />
                      Sevilmeyen Malzemeler
                    </h2>
                    <div className="mt-5">
                      {profile ? (
                        <DislikedIngredientsEditor currentDisliked={profile.dislikedIngredients} />
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-14 rounded-2xl bg-muted/50 animate-pulse" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "account" && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8 rounded-[2rem] bg-card border border-muted/40 shadow-sm space-y-6"
                >
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Hesap Bilgileri
                  </h2>

                  <div className="space-y-1">
                    {[
                      {
                        label: "E-posta Adresi",
                        icon: Mail,
                        value: profile?.email ?? sessionUser?.email,
                      },
                      {
                        label: "Doğum Tarihi",
                        icon: Calendar,
                        value: profile?.birthDate
                          ? new Date(profile.birthDate).toLocaleDateString("tr-TR", {
                              day: "numeric", month: "long", year: "numeric",
                            })
                          : "Belirtilmedi",
                      },
                      {
                        label: "Üyelik Tarihi",
                        icon: Clock,
                        value: profile?.createdDate
                          ? new Date(profile.createdDate).toLocaleDateString("tr-TR", {
                              day: "numeric", month: "long", year: "numeric",
                            })
                          : null,
                      },
                      {
                        label: "E-posta Doğrulama",
                        icon: ShieldCheck,
                        value: profile?.isEmailVerified ? "Doğrulandı ✓" : "Doğrulanmadı",
                        valueClass: profile?.isEmailVerified
                          ? "text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-amber-600 dark:text-amber-400 font-bold",
                      },
                    ].map((row) => (
                      row.value && (
                        <div
                          key={row.label}
                          className="flex items-center justify-between py-4 border-b border-muted/40 last:border-0"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <row.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{row.label}</span>
                          </div>
                          <span className={`text-sm font-semibold text-foreground ${row.valueClass ?? ""}`}>
                            {row.value}
                          </span>
                        </div>
                      )
                    ))}
                  </div>

                  {/* Change Password */}
                  <div className="pt-6 mt-6 border-t border-muted/40">
                    <h2 className="text-lg font-black text-foreground flex items-center gap-2 mb-6">
                      <KeyRound className="w-5 h-5 text-primary" />
                      Şifre Değiştir
                    </h2>
                    <ChangePasswordForm />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
