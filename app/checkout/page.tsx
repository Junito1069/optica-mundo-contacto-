"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useCart } from "@/components/Cart/CartProvider";

import { apiUrl } from "@/lib/api-url";
const whatsappPhone = "18492504605";
const profileStoragePrefix = "mundo-contacto-checkout-profile:";

type DeliveryDetails = { phone: string; address: string; city: string; sector: string; reference: string };
type OrderResponse = { error?: string; message?: string; data?: { orderNumber?: string; total?: number | string; items?: Array<{ name: string; quantity: number; unitPrice: number | string; total: number | string }> } };
const emptyDetails: DeliveryDetails = { phone: "", address: "", city: "", sector: "", reference: "" };

function formatCurrency(value: number) { return `RD$ ${value.toFixed(2)}`; }

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const [details, setDetails] = useState<DeliveryDetails>(emptyDetails);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<null | { orderNumber: string; total: number }>(null);

  useEffect(() => {
    if (!user) { setDetails(emptyDetails); return; }
    try {
      const stored = window.localStorage.getItem(`${profileStoragePrefix}${user.email}`);
      const saved = stored ? JSON.parse(stored) as Partial<DeliveryDetails> : null;
      setDetails({ ...emptyDetails, ...saved });
      setEditing(!saved);
    } catch { setDetails(emptyDetails); setEditing(true); }
  }, [user]);

  const hasDetails = Object.values(details).every((value) => value.trim().length > 0);
  function updateDetail(field: keyof DeliveryDetails, value: string) { setDetails((current) => ({ ...current, [field]: value })); }
  function saveDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    window.localStorage.setItem(`${profileStoragePrefix}${user.email}`, JSON.stringify(details));
    setEditing(false); setError("");
  }

  async function confirmOrder() {
    setError("");
    if (!user) return;
    if (!hasDetails) { setEditing(true); setError("Completa tus datos de entrega antes de confirmar."); return; }
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })), customerName: user.name, customerEmail: user.email, customerPhone: details.phone, deliveryAddress: details.address, deliveryCity: details.city, deliverySector: details.sector, deliveryReference: details.reference, deliveryAddress2: null, deliveryPostalCode: null, deliveryNotes: null, paymentMethod: "PAGO CONTRA ENTREGA" }),
      });
      const text = await response.text();
      let payload: OrderResponse = {};
      if (text) { try { payload = JSON.parse(text) as OrderResponse; } catch { payload = { error: text }; } }
      if (!response.ok) {
        if (response.status === 401) { router.push(`/login?returnUrl=${encodeURIComponent("/checkout")}`); return; }
        setError(payload.error ?? payload.message ?? "No fue posible crear el pedido."); return;
      }
      const order = payload.data;
      if (!order?.orderNumber) { setError("La respuesta del servidor no incluye el número de pedido."); return; }
      setConfirmation({ orderNumber: order.orderNumber, total: Number(order.total) });
      const products = order.items?.map((item) => `• ${item.name} × ${item.quantity} — ${formatCurrency(Number(item.unitPrice))}`).join("\n") ?? "";
      const message = [`Hola, Mundo Contacto.`, `🧾 Pedido #${order.orderNumber}`, `👤 Cliente: ${user.name}`, `📱 Teléfono: ${details.phone}`, `📍 Dirección: ${details.address}`, `🏙️ Ciudad: ${details.city}`, `📌 Sector: ${details.sector}`, `🛍️ Productos:\n${products}`, `💰 Total: ${formatCurrency(Number(order.total))}`, "💳 Pago: Contra entrega", "Gracias."].join("\n\n");
      window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      clearCart();
    } catch { setError("No pudimos conectar con el servidor. Inténtalo nuevamente."); }
    finally { setLoading(false); }
  }

  if (authLoading) return <main className="checkout-page"><p>Cargando tu cuenta...</p></main>;
  if (!items.length) return <main className="checkout-page"><section className="checkout-empty"><h1>Tu carrito está vacío</h1><p>Agrega productos y vuelve para completar tu pedido.</p><Link href="/productos" className="primary-action">Ver productos</Link></section></main>;
  if (confirmation) return <main className="checkout-confirmation"><section className="checkout-panel"><p className="section-kicker">PEDIDO RECIBIDO</p><h1>Pedido listo para coordinar</h1><p>Pedido: <strong>#{confirmation.orderNumber}</strong></p><p>Total: <strong>{formatCurrency(confirmation.total)}</strong></p><p>Pago contra entrega.</p><div className="checkout-actions"><a className="primary-action" href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hola, quiero coordinar mi pedido ${confirmation.orderNumber}`)}`} target="_blank" rel="noreferrer">HABLAR POR WHATSAPP</a><Link href="/account" className="secondary-action">VER MIS PEDIDOS</Link></div></section></main>;

  return <main className="checkout-page"><section className="checkout-panel"><div className="checkout-summary"><p className="section-kicker">MUNDO CONTACTO / PEDIDO</p><h1>Resumen de tu pedido</h1>{items.map((item) => <div key={`${item.product.id}-${item.variantId ?? "default"}`} className="checkout-item"><div><span className="item-name">{item.product.name}</span><span className="item-qty">Cantidad: {item.quantity}</span></div><div><span className="item-price">{formatCurrency(item.product.price)}</span><span className="item-sub">{formatCurrency(item.product.price * item.quantity)}</span></div></div>)}<div className="checkout-summary-total"><span>TOTAL</span><strong>{formatCurrency(subtotal)}</strong></div><p className="checkout-payment-note">Pago contra entrega. Sin pagos en línea.</p></div>{!user ? <div className="checkout-customer checkout-auth-callout"><p className="section-kicker">CUENTA</p><h2>Inicia sesión para continuar</h2><p>Conservaremos tu carrito mientras accedes o creas tu cuenta.</p><div className="checkout-actions"><Link className="primary-action" href="/login?returnUrl=%2Fcheckout">INICIAR SESIÓN</Link><Link className="secondary-action" href="/register?returnUrl=%2Fcheckout">CREAR CUENTA</Link></div></div> : <div className="checkout-customer"><p className="section-kicker">DATOS DE ENTREGA</p><h2>Hola, {user.name}</h2><p className="checkout-account-email">{user.email}</p>{editing ? <form onSubmit={saveDetails} className="checkout-edit-form"><label>Teléfono<input value={details.phone} onChange={(event) => updateDetail("phone", event.target.value)} required /></label><label>Dirección<input value={details.address} onChange={(event) => updateDetail("address", event.target.value)} required /></label><label>Ciudad<input value={details.city} onChange={(event) => updateDetail("city", event.target.value)} required /></label><label>Sector<input value={details.sector} onChange={(event) => updateDetail("sector", event.target.value)} required /></label><label>Referencia<input value={details.reference} onChange={(event) => updateDetail("reference", event.target.value)} required /></label><button className="primary-action" type="submit">GUARDAR DATOS</button></form> : <div className="checkout-saved-details"><p><strong>{details.phone}</strong></p><p>{details.address}, {details.sector}, {details.city}</p><p>Referencia: {details.reference}</p><button className="secondary-action" onClick={() => setEditing(true)}>EDITAR DATOS</button></div>}{error && <p className="form-error" role="alert">{error}</p>}{!editing && <button className="primary-action checkout-confirm-button" onClick={() => void confirmOrder()} disabled={loading}>{loading ? "CREANDO PEDIDO..." : "CONFIRMAR PEDIDO POR WHATSAPP"}</button>}</div>}</section></main>;
}
