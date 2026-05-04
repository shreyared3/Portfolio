import React from "react";
import { FiMail, FiPhone, FiLinkedin, FiGithub } from "react-icons/fi";

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  link: string;
}

interface ContactMetadata {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  [key: string]: any;
}

interface StructuredContent {
  metadata?: ContactMetadata;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  title?: string;
  content?: string;
  text?: string;
}

interface ContactSectionProps {
  structured: StructuredContent;
}

const ContactSection: React.FC<ContactSectionProps> = ({ structured }) => {
  const meta = structured?.metadata || {};
  const email = meta.email || structured?.email;
  const phone = meta.phone || structured?.phone;
  const linkedin = meta.linkedin || meta.LinkedIn || structured?.linkedin;
  const github = meta.github || meta.GitHub || structured?.github;
  const fallbackContent = structured?.content || structured?.text;

  const contacts: ContactItem[] = [
    email && { icon: <FiMail />, label: "Email", value: email, link: `mailto:${email}` },
    phone && { icon: <FiPhone />, label: "Phone", value: phone, link: `tel:${phone}` },
    linkedin && { icon: <FiLinkedin />, label: "LinkedIn", value: "View Profile", link: linkedin },
    github && { icon: <FiGithub />, label: "GitHub", value: "View Repos", link: github },
  ].filter(Boolean) as ContactItem[];

  return (
    <section
      className="max-w-3xl mx-auto p-8 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <h2 className="text-3xl font-semibold mb-6" style={{ color: "#0f172a" }}>
        Get In Touch
      </h2>
      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {contacts.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open ${item.label}`}
              className="group flex items-start gap-4 p-4 rounded-lg transition duration-300"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(15,23,42,0.12)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)"; (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.12)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,0.12)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            >
              <span className="text-2xl" style={{ color: "#7c3aed" }}>{item.icon}</span>
              <div>
                <p className="text-sm" style={{ color: "rgba(15,23,42,0.45)" }}>{item.label}</p>
                <p className="text-base font-medium break-all" style={{ color: "rgba(15,23,42,0.9)" }}>{item.value}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p style={{ color: "rgba(15,23,42,0.7)", fontSize: "1.125rem" }}>{fallbackContent}</p>
      )}
    </section>
  );
};

export default ContactSection;
