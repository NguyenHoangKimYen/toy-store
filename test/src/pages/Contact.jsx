import React from 'react'
import { ArrowUpRight, Github, Mail, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const contributors = [
  {
    name: 'Võ Xuân Quang',
    role: 'Backend',
    github: 'QuangVoAI',
    email: 'vxq123@icloud.com',
    avatar: 'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/contact/IMG_0253.jpeg',
    bio: 'Builds backend and APIs for core features.'
  },
  {
    name: 'Nguyễn Hoàng Kim Yến',
    role: 'Backend',
    github: 'NguyenHoangKimYen',
    email: 'nguyenhoangkimyen2102@gmail.com',
    avatar: 'https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/contact/0D5024FA-A29C-4CB8-A361-19A0C80F7663.png',
    bio: 'Manages data and integrates with external systems.'
  },
  {
    name: 'Ngô Gia Bảo',
    role: 'Frontend',
    github: 'cuchim123123',
    email: 'gia.huy@example.com',
    avatar: 'https://i.pravatar.cc/240?img=47',
    bio: 'Builds UI and optimizes user experience.'
  }
]

const crystals = [
  { top: '4%', left: '6%', delay: '0s', twinkle: '3s', drift: '14s', scale: 1.08, wanderX: '20px', wanderY: '16px', spin: '0s' },
  { top: '8%', left: '22%', delay: '0.6s', twinkle: '2.8s', drift: '15s', scale: 0.9, wanderX: '18px', wanderY: '14px', spin: '0s' },
  { top: '6%', left: '40%', delay: '1s', twinkle: '3.3s', drift: '17s', scale: 1.12, wanderX: '22px', wanderY: '18px', spin: '0s' },
  { top: '10%', left: '58%', delay: '0.3s', twinkle: '3s', drift: '18s', scale: 0.96, wanderX: '20px', wanderY: '15px', spin: '0s' },
  { top: '14%', left: '76%', delay: '1.2s', twinkle: '2.7s', drift: '19s', scale: 1.05, wanderX: '22px', wanderY: '17px', spin: '0s' },
  { top: '18%', left: '90%', delay: '1.6s', twinkle: '3.2s', drift: '16s', scale: 0.88, wanderX: '18px', wanderY: '14px', spin: '0s' },
  { top: '24%', left: '12%', delay: '0.9s', twinkle: '3.4s', drift: '18s', scale: 1.1, wanderX: '22px', wanderY: '18px', spin: '0s' },
  { top: '28%', left: '32%', delay: '2s', twinkle: '2.9s', drift: '20s', scale: 0.94, wanderX: '20px', wanderY: '16px', spin: '0s' },
  { top: '32%', left: '50%', delay: '1.4s', twinkle: '3.1s', drift: '17s', scale: 1.06, wanderX: '22px', wanderY: '17px', spin: '0s' },
  { top: '36%', left: '70%', delay: '0.8s', twinkle: '3.3s', drift: '15.5s', scale: 0.92, wanderX: '20px', wanderY: '16px', spin: '0s' },
]

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-indigo-100 text-gray-900 dark:from-slate-900 dark:via-slate-950 dark:to-[#0b1021] relative overflow-hidden">
      <div
        className="contact-animated-bg animated-gradient"
        aria-hidden="true"
      />
      <div className="butterfly-layer" aria-hidden="true">
        {crystals.map((c, idx) => (
          <span
            key={idx}
            className="butterfly"
            style={{
              top: c.top,
              left: c.left,
              '--twinkle-delay': c.delay,
              '--twinkle-duration': c.twinkle,
              '--drift-duration': c.drift,
              '--crystal-scale': c.scale,
              '--wander-x': c.wanderX,
              '--wander-y': c.wanderY,
              '--spin-duration': c.spin,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur shadow-[0_20px_80px_-24px_rgba(79,70,229,0.35)]">
          <div className="animated-gradient absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.28),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.3),transparent_32%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,0.24),transparent_42%)]" />
          <div className="relative p-8 sm:p-12 space-y-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
              <Sparkles className="size-4" />
              Contributors
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Connect with the contributors building MilkyBloomToyStore
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl">
              We are happy to talk about the product, feedback, or collaboration opportunities. Reach out to each member directly or email the whole team.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="px-5">
                <a href="mailto:vxq123@icloud.com">
                  <Mail className="size-4" />
                  Email the team
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-5">
                <a href="https://github.com/NguyenHoangKimYen/toy-store.git" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <Github className="size-4" />
                  View on GitHub
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Contributors</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Direct contact info for each project member.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contributors.map((person, idx) => (
              <Card
                key={person.github}
                className="floating-card group h-full border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 shadow-sm hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                style={{ animationDelay: `${idx * 0.25}s` }}
              >
                <CardHeader className="pb-2 flex-row items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-200 via-sky-200 to-rose-200 blur-2xl opacity-60 group-hover:opacity-80 transition" />
                    <img
                      src={person.avatar}
                      alt={`Photo of ${person.name}`}
                      className="relative size-16 rounded-full border-2 border-white dark:border-slate-800 shadow-md object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900 dark:text-white">{person.name}</CardTitle>
                    <CardDescription className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      {person.role}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{person.bio}</p>
                  <div className="space-y-2">
                    <a
                      href={`https://github.com/${person.github}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                    >
                      <Github className="size-4 text-indigo-600 dark:text-indigo-300" />
                      {person.github}
                      <ArrowUpRight className="size-3.5 opacity-70" />
                    </a>
                    <a
                      href={`mailto:${person.email}`}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                    >
                      <Mail className="size-4 text-indigo-600 dark:text-indigo-300" />
                      {person.email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact
