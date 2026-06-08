export const mockStats = {
  totalUsers: {
    value: "12,450",
    trend: "+12%",
    isPositive: true,
  },
  recipesAdded: {
    value: "843",
    trend: "+5%",
    isPositive: true,
  },
  activeSessions: {
    value: "1,202",
    trend: "- 0%",
    isPositive: false,
  },
  serverLoad: {
    value: "24%",
    status: "Sağlıklı",
  },
};

export const mockChartData = [
  { name: "1. Hafta", users: 4000 },
  { name: "2. Hafta", users: 5500 },
  { name: "3. Hafta", users: 6000 },
  { name: "4. Hafta", users: 8500 },
];

export const mockRecentActivity = [
  {
    id: 1,
    content: (
      <>
        Kullanıcı <span className="font-bold text-foreground">Sarah J.</span> yeni bir tarif ekledi
      </>
    ),
    time: "2 dk önce",
    type: "user_action",
    color: "bg-blue-500",
  },
  {
    id: 2,
    content: "Sistem yedeği başarıyla alındı",
    time: "1 saat önce",
    type: "system",
    color: "bg-green-500",
  },
  {
    id: 3,
    content: (
      <>
        Yeni kullanıcı kaydı: <span className="font-bold text-foreground">@mike_cooks</span>
      </>
    ),
    time: "3 saat önce",
    type: "user_action",
    color: "bg-purple-500",
  },
  {
    id: 4,
    content: (
      <>
        Sunucu yükünde ani artış tespit edildi <span className="font-bold text-foreground">(UYARI)</span>
      </>
    ),
    time: "5 saat önce",
    type: "warning",
    color: "bg-orange-500",
  },
  {
    id: 5,
    content: "Günlük sistem raporu oluşturuldu",
    time: "Dün",
    type: "system",
    color: "bg-gray-400",
  },
];
