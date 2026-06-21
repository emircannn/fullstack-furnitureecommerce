import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-1 pt-[77px] lg:pt-[135px] pb-16 lg:pb-0 flex flex-col">
        {children}
      </div>
      <MobileNav />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
