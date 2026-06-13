import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[color:var(--mountain)] text-mountain-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" width={40} height={40} className="h-10 w-10 brightness-0 invert" />
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold">Woodapple</div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-75">Tours &amp; Travel</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-80">
            A licensed Nepali tour operator showing the Himalaya to the world since 2012.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.18em] opacity-90">Visit us</h4>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Thamel Marg, Ward 26<br />Kathmandu 44600, Nepal</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <span>+977 1 4XX XXXX</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href="mailto:hello@woodappletours.com" className="hover:underline">
                hello@woodappletours.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.18em] opacity-90">Quick links</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-85">
            <li><Link to="/tours" className="hover:underline">All tours</Link></li>
            <li><Link to="/about" className="hover:underline">About us</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/contact" className="hover:underline">Plan a custom trip</Link></li>
            <li><a href="#" className="hover:underline">Travel blog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-[0.18em] opacity-90">Credentials</h4>
          <ul className="mt-4 space-y-3 text-sm opacity-85">
            <li>
              <div className="text-xs uppercase opacity-70">Tourism License</div>
              <div>NTB / TL / 0000 (placeholder)</div>
            </li>
            <li>
              <div className="text-xs uppercase opacity-70">Company Registration</div>
              <div>OCR / 00000 / 069/070 (placeholder)</div>
            </li>
            <li>
              <div className="text-xs uppercase opacity-70">Member of</div>
              <div>TAAN · NMA · NTB</div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs opacity-70 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Woodapple Tours and Travel Pvt. Ltd. All rights reserved.</p>
          <p>Made in Kathmandu, Nepal 🇳🇵</p>
        </div>
      </div>
    </footer>
  );
}
