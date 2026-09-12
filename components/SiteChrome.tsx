"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SearchOverlay } from "@/components/SearchOverlay";
import { CartDrawer } from "@/components/Cart/CartDrawer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export function SiteChrome() {
  const [searchOpen, setSearchOpen] = useState(false);
  return <><Navbar onSearchOpen={() => setSearchOpen(true)} /><SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} /><CartDrawer /><WhatsAppFloat /></>;
}