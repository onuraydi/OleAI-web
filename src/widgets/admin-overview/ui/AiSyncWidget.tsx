import React from "react";
import { useMutation } from "@tanstack/react-query";
import { adminRecipeApi } from "@/entities/admin-recipe";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { toast } from "sonner";
import { Bot, RefreshCw, ServerCog } from "lucide-react";
import { motion } from "framer-motion";

export const AiSyncWidget = () => {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const syncMutation = useMutation({
    mutationFn: () => adminRecipeApi.syncAllToAi(),
    onMutate: () => {
      setIsSyncing(true);
    },
    onSuccess: () => {
      toast.info("Yapay Zeka (AI) senkronizasyonu arka planda başlatıldı. İşlem uzun sürebilir.");
    },
    onError: () => {
      toast.error("Senkronizasyon tetiklenirken bir hata oluştu.");
      setIsSyncing(false);
    }
    // We intentionally don't set isSyncing back to false on success here, 
    // so it keeps spinning "sahte" just like the individual moderation button
  });

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ServerCog className="h-5 w-5 text-primary" />
          AI Motoru Senkronizasyonu
        </CardTitle>
        <CardDescription className="text-xs">
          Onaylı tarifleri vektör modeline aktar.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Eğer tarifler yapay zekaya aktarılırken kesinti olduysa bu butonla tüm veritabanını AI'a yeniden senkronize edebilirsiniz.
          </p>
          <Button 
            onClick={() => syncMutation.mutate()} 
            disabled={isSyncing}
            className="w-full gap-2"
            variant="secondary"
          >
            {isSyncing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isSyncing ? "Senkronize Ediliyor..." : "Şimdi Senkronize Et"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
