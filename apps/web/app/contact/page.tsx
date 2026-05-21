import { Footer } from "../../components/marketing/Footer";
import { MarketingNavbar } from "../../components/marketing/MarketingNavbar";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact | Job Application Assistant",
  description: "Contact support for Job Application Assistant."
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
