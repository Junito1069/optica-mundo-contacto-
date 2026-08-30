"use client";

import { useEffect, useState } from "react";
import { CartButton } from "@/components/Cart/CartButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";

const navigation = ["INICIO", "PRODUCTOS", "CATEGORÍAS", "NOSOTROS"] as const;
const destinations: Record<(typeof navigation)[number], string> = { INICIO: "/", PRODUCTOS: "/productos", CATEGORÍAS: "/categorias", NOSOTROS: "/#nosotros" };

type NavbarProps = { onSearchOpen: () => void };

export function Navbar({ onSearchOpen }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const activeItem = pathname === "/productos" ? "PRODUCTOS" : pathname === "/categorias" ? "CATEGORÍAS" : "INICIO";

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  return <>
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <Link className="brand" href="/" aria-label="Mundo Contacto inicio">MUNDO <span>CONTACTO</span></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => <Link href={destinations[item]} className={item === activeItem ? "active" : undefined} key={item}>{item}</Link>)}
      </nav>
      <div className="nav-actions">
        <button className="text-control" onClick={onSearchOpen} data-cursor="explore">BUSCAR</button>
        {loading ? <span className="account-status">...</span> : user ? <div className="account-menu"><Link className="text-control desktop-only" href="/account">MI CUENTA</Link><button className="text-control desktop-only" onClick={() => void logout()}>SALIR</button></div> : <Link className="text-control desktop-only" href="/login" data-cursor="view">CUENTA</Link>}
        <CartButton />
        <button className="menu-control" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Open menu"><i /><i /></button>
      </div>
    </header>
    <nav className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
      {navigation.map((item) => <Link href={destinations[item]} onClick={closeMenu} key={item}>{item}</Link>)}
    </nav>
  </>;
}