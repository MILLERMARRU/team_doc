// ============================================================
//  app/team/page.tsx  –  Página del equipo
// ============================================================

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Github, Globe, Linkedin, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Equipo | DocHubs",
  description: "Conoce al equipo detrás de este proyecto.",
};

const team = [
  {
    name: "Miller Zamora",
    image: "/images/miller.jpeg",
    links: [
      { type: "github",   label: "MILLERMARRU",        href: "https://github.com/MILLERMARRU" },
      { type: "web",      label: "millermarru.dev",     href: "https://www.millermarru.dev/" },
      { type: "linkedin", label: "millerzamora",        href: "https://www.linkedin.com/in/millerzamora/" },
      { type: "mail",     label: "millermarru4@gmail.com", href: "mailto:millermarru4@gmail.com" },
      { type: "phone",    label: "+91 930 535 560",     href: "tel:+51930535560" },
    ],
  },
  {
    name: "Sam Vasquez",
    image: "/images/sam.jpeg",
    links: [
      { type: "github",   label: "Seninhg",            href: "https://github.com/Seninhg/" },
      { type: "mail",     label: "samleninvasques@gmail.com", href: "mailto:samleninvasques@gmail.com" },
      { type: "phone",    label: "+51 901 392 254",     href: "tel:+51901392254" },
    ],
  },
];

const iconMap: Record<string, React.ReactNode> = {
  github:   <Github   className="h-4 w-4 shrink-0" />,
  web:      <Globe    className="h-4 w-4 shrink-0" />,
  linkedin: <Linkedin className="h-4 w-4 shrink-0" />,
  mail:     <Mail     className="h-4 w-4 shrink-0" />,
  phone:    <Phone    className="h-4 w-4 shrink-0" />,
};

export default function TeamPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400 mb-3">
            Las personas detrás del proyecto
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
            Equipo
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto text-sm leading-relaxed">
            Developers apasionados por compartir lo que aprenden y construir en público.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-10">
          {team.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center w-72 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm"
            >
              {/* Avatar */}
              <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-neutral-100 dark:ring-neutral-800 mb-5 shrink-0">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              {/* Nombre */}
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                {member.name}
              </h2>

              {/* Links */}
              <div className="w-full flex flex-col gap-2.5">
                {member.links.map((link) => (
                  <Link
                    key={link.type}
                    href={link.href}
                    target={link.type !== "phone" ? "_blank" : undefined}
                    rel={link.type !== "phone" ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
                  >
                    <span className="text-neutral-400 dark:text-neutral-500 group-hover:text-blue-500 transition-colors">
                      {iconMap[link.type]}
                    </span>
                    <span className="truncate">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
