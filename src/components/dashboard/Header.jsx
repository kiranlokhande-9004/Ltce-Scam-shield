import { Bell, Menu, Search } from "lucide-react";
import ProfileMenu from "./ProfileMenu";

export default function Header({ greeting, title, support, onMenu }) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="mt-1 grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-line lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} className="text-primary" />
        </button>
        <div>
          {greeting && (
            <p className="text-sm text-muted">{greeting}</p>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-ink sm:text-[28px]">
            {title}
          </h1>
          {support && (
            <p className="mt-1.5 max-w-xl text-sm text-muted">{support}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft ring-1 ring-line transition hover:ring-primary/30"
          aria-label="Search"
        >
          <Search size={17} className="text-muted" />
        </button>
        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft ring-1 ring-line transition hover:ring-primary/30"
          aria-label="Notifications"
        >
          <Bell size={17} className="text-muted" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold ring-2 ring-white" />
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}