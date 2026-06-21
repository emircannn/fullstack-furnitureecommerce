"use client";

import * as React from "react";
import Link from "next/image"; // Wait, Link should be from next/link! The original has import Link from "next/link"; at line 4, and import Image from "next/image"; at line 7. Let's keep that.
import NextLink from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react";
import { useCategories, useSettings } from "@/hooks/use-api";

export function Footer() {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();

  const currentLocale = (params?.locale as string) || "tr";
  const localizedPath = (path: string) => {
    if (currentLocale === "tr") return path;
    return `/${currentLocale}${path === "/" ? "" : path}`;
  };

  const currentYear = new Date().getFullYear();

  // Dynamic Categories
  const { data: categories = [] } = useCategories();
  const footerCategories = categories.slice(0, 4);

  // Settings
  const { data: settings = [] } = useSettings();
  const getSetting = (key: string, fallback: string) => {
    const found = settings.find((s: any) => s.key === key);
    return found ? found.value : fallback;
  };

  const facebookUrl = getSetting("facebook_url", "");
  const instagramUrl = getSetting("instagram_url", "");
  const twitterUrl = getSetting("twitter_url", "");

  const socialLinks = [
    { icon: Facebook, href: facebookUrl, label: "Facebook" },
    { icon: Instagram, href: instagramUrl, label: "Instagram" },
    { icon: Twitter, href: twitterUrl, label: "Twitter" },
  ].filter((link) => !!link.href);

  return (
    <footer className="bg-secondary text-white border-t border-white/10 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* LOGO & HAKKIMIZDA */}
          <div className="space-y-6">
            <NextLink href={localizedPath("/")} className="inline-block">
              <Image
                src="/assets/logo.svg"
                alt="Belenay Mobilya Logo"
                width={130}
                height={32}
                className="h-8 w-auto brightness-0 invert"
                priority
              />
            </NextLink>
            <p className="text-sm text-white/60 leading-relaxed font-light">
              {t("footer.footerDesc")}
            </p>
            {/* Sosyal Medya İkonları */}
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors duration-300 group border border-white/5 hover:border-transparent"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* HIZLI LINKLER */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">{t("nav.categories")}</h3>
            <ul className="space-y-3">
              {footerCategories.length === 0 ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <li key={idx} className="h-4 w-24 bg-white/10 animate-pulse rounded" />
                ))
              ) : (
                footerCategories.map((cat: any) => {
                  const catName = cat.name[currentLocale as "tr" | "ru" | "ky"] || cat.name["tr"];
                  return (
                    <li key={cat.id}>
                      <NextLink
                        href={localizedPath(`/kategoriya/${cat.slug}`)}
                        className="text-sm text-white/60 hover:text-primary transition-colors font-light"
                      >
                        {catName}
                      </NextLink>
                    </li>
                  );
                })
              )}
            </ul>
          </div>

          {/* KULLANIŞLI LINKLER */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">{t("footer.quickMenu")}</h3>
            <ul className="space-y-3">
              {[
                { label: t("nav.home"), href: "/" },
                { label: t("nav.blog"), href: "/blog" },
                { label: t("nav.about"), href: "/o-nas" },
                { label: t("nav.contact"), href: "/kontakty" },
              ].map((link, i) => (
                <li key={i}>
                  <NextLink
                    href={localizedPath(link.href)}
                    className="text-sm text-white/60 hover:text-primary transition-colors font-light"
                  >
                    {link.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ILETISIM BILGILERI */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold mb-6 text-white">{t("nav.contact")}</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-white/60 font-light">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                {getSetting("site_address_link", "") ? (
                  <a
                    href={getSetting("site_address_link", "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {getSetting("site_address", "Bişkek, Kırgızistan")}
                  </a>
                ) : (
                  <span>{getSetting("site_address", "Bişkek, Kırgızistan")}</span>
                )}
              </li>
              <li className="flex gap-3 text-sm text-white/60 font-light items-center">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href={`tel:${getSetting("site_phone", "").replace(/\s+/g, "")}`} className="hover:text-primary transition-colors">
                  {getSetting("site_phone", "+996 555 180 581")}
                </a>
              </li>
              <li className="flex gap-3 text-sm text-white/60 font-light items-center">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href={`mailto:${getSetting("site_email", "")}`} className="hover:text-primary transition-colors">
                  {getSetting("site_email", "info@belenaymobilya.com")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ALT BILGI / TELIF HAKLARI */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p className="font-light">
            &copy; {currentYear} BELENAY. {t("footer.rights")}.
          </p>
          <div className="flex flex-wrap gap-6 font-light">
            <NextLink href={localizedPath("/gizlilik")} className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </NextLink>
            <NextLink href={localizedPath("/sartlar")} className="hover:text-white transition-colors">
              {t("footer.terms")}
            </NextLink>
            <NextLink href={localizedPath("/cerezler")} className="hover:text-white transition-colors">
              {t("footer.cookie")}
            </NextLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
