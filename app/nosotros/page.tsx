import type { ReactNode } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { InteractiveEye } from "@/components/InteractiveEye";
import { SiteChrome } from "@/components/SiteChrome";

function FeatureIcon({ children }: { children: ReactNode }) {
  return <span className="about-feature-icon" aria-hidden="true">{children}</span>;
}

const values = [
  { title: "Visión de Vanguardia", text: "Tecnología óptica avanzada para acompañar cada mirada con precisión y comodidad.", icon: <svg viewBox="0 0 24 24" fill="none"><path d="M3 12s3.3-6 9-6 9 6 9 6-3.3 6-9 6-9-6-9-6Z" /><circle cx="12" cy="12" r="2.5" /></svg> },
  { title: "Calidad Certificada", text: "Productos originales, avalados por marcas globales y elegidos con criterio profesional.", icon: <svg viewBox="0 0 24 24" fill="none"><path d="m12 3 2.4 2.1 3.2-.1.8 3.1 2.6 1.8-1.5 2.8.7 3.1-3 1.1-1.5 2.8-3-.9-3 1-1.5-2.8-3-1.1.7-3.1-1.5-2.8 2.6-1.8.8-3.1 3.2.1L12 3Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></svg> },
  { title: "Atención Humana", text: "Asesoramiento personalizado para que elegir tus lentes sea simple, claro y seguro.", icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.6-3 2.4-4.5 5.5-4.5s4.9 1.5 5.5 4.5M16 5.5v5M13.5 8h5" /></svg> },
];

export default function NosotrosPage() {
  return <div className="about-page">
    <div className="noise" aria-hidden="true" />
    <CustomCursor />
    <SiteChrome />
    <main>
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy"><p className="about-kicker">MUNDO CONTACTO / NUESTRA ESENCIA</p><h1 id="about-title">Ver bien es<br /><em>vivir mejor.</em></h1><p className="about-lead">Somos una óptica especializada en lentes de contacto, creada para hacer que el cuidado visual se sienta tan claro como debería.</p><a className="about-text-link" href="#historia">CONOCE NUESTRA HISTORIA <span>↘</span></a></div>
        <div className="about-hero-art"><div className="about-eye hidden md:block"><InteractiveEye /></div><span className="about-hero-coordinate">18°28&apos;N / 69°58&apos;W</span></div>
        <div className="about-hero-footer"><span>01 — IDENTIDAD</span><span>DESDE 2018</span></div>
      </section>

      <section className="about-story" id="historia" aria-labelledby="story-title">
        <div className="about-section-label">[ 01 / NUESTROS ORÍGENES ]</div>
        <div className="about-story-grid"><div className="about-story-copy"><p className="about-overline">QUIÉNES SOMOS</p><h2 id="story-title">La precisión también puede sentirse <em>cercana.</em></h2><p>Nacimos con una idea sencilla: cuidar la salud visual no debería sentirse complicado. Desde nuestros primeros días, en Mundo Contacto hemos unido selección rigurosa, tecnología óptica y conversación honesta para que cada persona encuentre la solución que necesita.</p><p>Hoy evolucionamos junto a las mejores marcas globales, manteniendo intacto lo más importante: escuchar primero, asesorar con claridad y acompañar cada paso hacia una visión más cómoda.</p><div className="about-stat-row"><div><strong>08</strong><span>AÑOS DE EXPERIENCIA</span></div><div><strong>100%</strong><span>PRODUCTOS ORIGINALES</span></div></div></div></div>
      </section>

      <section className="about-values" aria-labelledby="values-title"><div className="about-section-label">[ 02 / LO QUE NOS MUEVE ]</div><div className="about-values-heading"><h2 id="values-title">Tres formas de<br /><em>mirar adelante.</em></h2><p>La confianza se construye con decisiones precisas y un trato que pone a las personas en el centro.</p></div><div className="about-value-grid">{values.map((value) => <article className="about-value-card" key={value.title}><FeatureIcon>{value.icon}</FeatureIcon><h3>{value.title}</h3><p>{value.text}</p><span className="about-card-arrow">↗</span></article>)}</div></section>

      <section className="about-contact" id="contacto" aria-labelledby="contact-title"><div className="about-contact-intro"><p className="about-overline">VISÍTANOS</p><h2 id="contact-title">Tu próxima<br /><em>buena mirada.</em></h2><p>Estamos listos para orientarte. Ven a conocernos o escríbenos directamente.</p></div><div className="about-contact-card"><div className="about-contact-column"><FeatureIcon><svg viewBox="0 0 24 24" fill="none"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg></FeatureIcon><span className="about-overline">UBICACIÓN Y TELÉFONO</span><address>Av. República de Colombia<br />Santo Domingo Oeste, RD</address><a className="about-map-link" href="https://maps.google.com/?q=Santo+Domingo+Oeste" target="_blank" rel="noreferrer">ABRIR EN MAPA ↗</a><a className="about-phone" href="tel:+18492504605">+1 849 250 4605</a></div><div className="about-contact-column about-hours"><FeatureIcon><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></svg></FeatureIcon><span className="about-overline">HORARIOS DE ATENCIÓN</span><div className="about-hours-list"><div><span>Lunes a Viernes</span><strong>9:00 AM — 7:00 PM</strong></div><div><span>Sábados</span><strong>9:00 AM — 3:00 PM</strong></div><div><span>Domingos</span><strong>Cerrado</strong></div></div></div></div></section>
    </main>
  </div>;
}