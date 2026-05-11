import { Container } from "@/shared/ui"

const stats = [
  { label: "TARİF", value: "10B+" },
  { label: "KULLANICI", value: "50B+" },
  { label: "PUANLAMA", value: "4.9/5" },
]

export const Stats = () => {
  return (
    <section className="py-24 border-y border-border/50 bg-background">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center items-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-3 group">
              <span className="text-5xl md:text-6xl font-bold text-primary tracking-tighter group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </span>
              <span className="text-sm font-black tracking-[0.2em] text-muted-foreground/60 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
