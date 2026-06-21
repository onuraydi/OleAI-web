import { useState } from 'react';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { DashboardHeader } from '@/widgets/dashboard-header/ui/DashboardHeader';
import { Footer } from '@/widgets/footer';
import { Button } from '@/shared/ui/button';
import { Bell, Check, Trash2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  useMyNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/entities/notification/hooks/useNotifications';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Skeleton } from '@/shared/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationsPage = () => {
  const [page, setPage] = useState(0);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const size = 10;

  const { data, isLoading } = useMyNotifications(page, size, onlyUnread);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const notifications = data?.items || [];
  const hasNext = data?.hasNext || false;
  const hasPrevious = data?.hasPrevious || false;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-8 max-w-5xl mx-auto w-full pt-4">
          {/* Header Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Bildirimler<span className="text-primary">.</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2 font-medium">
                Sistemden gelen tüm duyuru ve güncellemeler.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-muted/30 shadow-sm">
              <Button 
                variant={onlyUnread ? "secondary" : "ghost"}
                className={`rounded-xl ${onlyUnread ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}`}
                onClick={() => {
                  setOnlyUnread(!onlyUnread);
                  setPage(0);
                }}
              >
                {onlyUnread ? "Tümünü Göster" : "Sadece Okunmayanlar"}
              </Button>
              <div className="w-px h-6 bg-border mx-1"></div>
              <Button 
                variant="ghost" 
                className="rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => markAllAsRead()}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Tümünü Okundu İşaretle
              </Button>
            </div>
          </motion.section>

          {/* List Section */}
          <section className="pb-20">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-6 rounded-2xl border border-muted/30 bg-card">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20 relative z-10">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Tertemiz!</h3>
                <p className="text-muted-foreground max-w-[250px]">
                  Şu an için gösterilecek hiçbir {onlyUnread ? 'okunmamış ' : ''}bildiriminiz bulunmuyor.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <AnimatePresence>
                  {notifications.map((notif) => (
                    <motion.div 
                      variants={item}
                      key={notif.id}
                      layout
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className={`group relative flex items-start gap-5 p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                        !notif.isRead 
                          ? 'bg-gradient-to-br from-card to-primary/5 border-primary/30 shadow-sm shadow-primary/10' 
                          : 'bg-card border-muted/30 hover:border-primary/50 shadow-sm'
                      }`}
                    >
                      {/* Unread Indicator dot */}
                      {!notif.isRead && (
                        <div className="absolute top-6 left-6 w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        !notif.isRead ? 'bg-primary text-white shadow-md shadow-primary/20 ml-4' : 'bg-muted/50 dark:bg-neutral-800 text-muted-foreground'
                      }`}>
                        <Bell className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className={`text-lg font-bold truncate ${!notif.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                              {notif.title}
                            </h4>
                            <p className="text-muted-foreground mt-1 text-base leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-3 font-medium uppercase tracking-wider">
                              {format(new Date(notif.createdDate), "d MMMM yyyy, HH:mm", { locale: tr })}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.isRead && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-colors"
                                onClick={() => markAsRead(notif.id)}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Okudum
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              onClick={() => deleteNotification(notif.id)}
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between pt-8 border-t border-border/50 mt-8">
                  <p className="text-sm font-medium text-muted-foreground">
                    Sayfa {(data?.page || 0) + 1} / {data?.pages || 1} <span className="mx-2 opacity-50">|</span> Toplam {data?.count || 0} kayıt
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-muted/30"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={!hasPrevious}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-muted/30"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!hasNext}
                    >
                      Sonraki
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        </div>
        <Footer />
      </main>
    </div>
  );
};
