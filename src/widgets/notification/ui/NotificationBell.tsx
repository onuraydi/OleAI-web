import { Bell, Check, Trash2, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
import { Badge } from '@/shared/ui/badge';
import {
  useMyNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/entities/notification/hooks/useNotifications';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useRequestPushPermission } from '@/features/notifications/hooks/usePushNotifications';

export const NotificationBell = () => {
  const { data: countData } = useUnreadNotificationCount();
  const { data: notificationsData } = useMyNotifications(0, 5, false); // Get latest 5 notifications
  
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { requestPermission, isPending } = useRequestPushPermission();

  const unreadCount = countData || 0;
  const notifications = notificationsData?.items || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-red-500 text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between p-4 pb-2">
          <h3 className="font-semibold text-lg">Bildirimler</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground h-8"
              onClick={() => markAllAsRead()}
            >
              <Check className="h-3 w-3 mr-1" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Bell className="h-8 w-8 mb-3 opacity-20" />
              <p className="mb-4">Hiç bildiriminiz yok.</p>
              
              {/* Sadece izin istemek için isteğe bağlı buton */}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs" 
                onClick={(e) => {
                  e.stopPropagation();
                  requestPermission();
                }}
                disabled={isPending}
              >
                <BellRing className="w-3 h-3 mr-2" />
                Tarayıcı Bildirimlerini Aç
              </Button>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`relative flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 ${!notif.isRead ? 'bg-primary/5' : ''}`}
              >
                {!notif.isRead && (
                  <div className="absolute left-1.5 top-5 h-2 w-2 rounded-full bg-primary" />
                )}
                
                <div className="flex-1 space-y-1 pl-2">
                  <p className={`text-sm font-medium leading-none ${!notif.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 pt-1">
                    {format(new Date(notif.createdDate), "d MMM yyyy HH:mm", { locale: tr })}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      title="Okundu İşaretle"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={(e) => {
                  e.stopPropagation();
                  requestPermission();
                }}
                disabled={isPending}
              >
                <BellRing className="w-3 h-3 mr-1" />
                İzin Ver
              </Button>

              <Button variant="link" className="text-sm text-primary h-auto p-2" asChild>
                <Link to="/notifications">Tüm Bildirimleri Gör</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
