import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Send, Megaphone } from 'lucide-react';
import { useSendGlobalNotification } from '@/entities/notification/hooks/useNotifications';

export const AdminGlobalNotificationForm = () => {
  const [message, setMessage] = useState('');
  const { mutate: sendGlobal, isPending } = useSendGlobalNotification();

  const handleSend = () => {
    if (!message.trim()) return;
    sendGlobal(message.trim(), {
      onSuccess: () => {
        setMessage('');
      }
    });
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Global Bildirim Gönder
        </CardTitle>
        <CardDescription>
          Tüm kullanıcılara (ve cihazlarına) sistem düzeyinde bir duyuru veya uyarı gönderin.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea 
          placeholder="Bildirim mesajınızı buraya yazın..."
          className="resize-none min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </CardContent>
      <CardFooter className="justify-end pb-4">
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <>Gönderiliyor...</>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Gönder
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
