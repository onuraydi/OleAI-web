import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, User, Calendar, AtSign, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { userApi, type UserProfileResponse } from "@/entities/user";
import { useSessionStore } from "@/entities/session";

const schema = z.object({
  firstName: z.string().min(1, "Ad zorunludur"),
  lastName: z.string().min(1, "Soyad zorunludur"),
  username: z.string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır")
    .max(50, "Kullanıcı adı en fazla 50 karakter olabilir")
    .regex(/^[a-zA-Z0-9_]+$/, "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir"),
  birthDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditProfileFormProps {
  profile: UserProfileResponse;
}

export const EditProfileForm = ({ profile }: EditProfileFormProps) => {
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.profileImageUrl ?? null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      username: profile.username ?? "",
      birthDate: profile.birthDate ? profile.birthDate.split("T")[0] : "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      userApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        birthDate: data.birthDate || undefined,
        profileImage: avatarFile ?? undefined,
      }),
    onSuccess: () => {
      toast.success("Profil başarıyla güncellendi");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      useSessionStore.getState().initialize();
    },
    onError: () => {
      toast.error("Profil güncellenirken bir hata oluştu");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data: FormValues) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Avatar Upload */}
      <div className="flex items-center gap-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profil"
              className="w-24 h-24 rounded-3xl object-cover border-4 border-background shadow-xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border-4 border-background shadow-xl flex items-center justify-center text-primary font-black text-3xl">
              {(profile.firstName?.[0] || profile.username?.[0] || "?").toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div>
          <p className="font-bold text-foreground">Profil Fotoğrafı</p>
          <p className="text-sm text-muted-foreground mt-0.5">JPG, PNG veya GIF · Maks. 5MB</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm font-bold text-primary hover:underline"
          >
            Fotoğraf Değiştir
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Ad
          </Label>
          <Input id="firstName" {...register("firstName")} placeholder="Adınız" className="h-12 rounded-xl" />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Soyad
          </Label>
          <Input id="lastName" {...register("lastName")} placeholder="Soyadınız" className="h-12 rounded-xl" />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="font-bold flex items-center gap-2">
            <AtSign className="w-4 h-4 text-muted-foreground" />
            Kullanıcı Adı
          </Label>
          <Input id="username" {...register("username")} placeholder="@kullaniciadi" className="h-12 rounded-xl" />
          {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="font-bold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Doğum Tarihi
          </Label>
          <Input id="birthDate" type="date" {...register("birthDate")} className="h-12 rounded-xl" />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={mutation.isPending || (!isDirty && !avatarFile)}
          className="h-12 px-8 rounded-xl font-bold gap-2"
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
          ) : (
            <><Check className="w-4 h-4" /> Değişiklikleri Kaydet</>
          )}
        </Button>
      </div>
    </form>
  );
};
