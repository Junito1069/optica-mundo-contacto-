import Link from "next/link";

const categories = [
  ["LENTES DIARIOS", "Comodidad práctica para cada día.", "Marca, precio, graduaciones disponibles, material y beneficio."],
  ["LENTES MENSUALES", "Una rutina de cuidado mensual.", "Marca, precio, tiempo de uso, hidratación y oxigenación."],
  ["LENTES DE COLOR", "Cambia tu mirada con confianza.", "Desechables, con o sin graduación y colores disponibles."],
  ["ACCESORIOS", "Todo para el cuidado de tus lentes.", "Soluciones, estuches, gotas lubricantes, pinzas y aplicadores."],
];

export function CustomerCare() {
  return <>
    <section className="care-section" id="categorias"><div className="section-kicker">[ CATEGORÍAS ]</div><h2>ENCUENTRA TUS<br /><em>LENTES IDEALES.</em></h2><div className="care-grid">{categories.map(([title, description, detail], index) => <article className="care-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p><small>{detail}</small><Link href="/categorias">VER PRODUCTOS ↗</Link></article>)}</div></section>
    <section className="process-section" id="nosotros"><div><p className="section-kicker">[ ASESORÍA PROFESIONAL ]</p><h2>COMPRA CON<br /><em>CONFIANZA.</em></h2><p>Elige tus lentes, selecciona la graduación de cada ojo y recibe confirmación por WhatsApp antes del despacho.</p><a className="primary-action" href="https://wa.me/18090000000?text=Hola%2C%20necesito%20asesor%C3%ADa%20para%20elegir%20mis%20lentes." target="_blank" rel="noreferrer">HABLAR POR WHATSAPP</a></div><ol><li><b>01</b> Elige tu producto.</li><li><b>02</b> Indica tu graduación.</li><li><b>03</b> Confirma tus datos.</li><li><b>04</b> Recibe tu pedido.</li></ol></section>
  </>;
}