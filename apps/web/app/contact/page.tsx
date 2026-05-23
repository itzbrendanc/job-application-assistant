import { Footer } from "../../components/marketing/Footer";
import { MarketingNavbar } from "../../components/marketing/MarketingNavbar";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact | Hirely",
  description: "Contact Hirely support."
};

export default function ContactPage() {
  return (
    <>
      <MarketingNavbar />
      <main>
        <ContactClient />
      </main>
      <Footer />
    </>
  );
}
