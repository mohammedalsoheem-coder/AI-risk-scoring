import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  AlertTriangle,
  ClipboardCheck,
  FileText,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { path: '/facilities', icon: Building2, label: 'nav.facilities' },
  { path: '/map', icon: MapPin, label: 'nav.map' },
  { path: '/violations', icon: AlertTriangle, label: 'nav.violations' },
  { path: '/inspections/new', icon: ClipboardCheck, label: 'nav.inspections' },
  { path: '/reports', icon: FileText, label: 'nav.reports' },
];

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-0">
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm font-bold transition-colors ${
                isActive
                  ? 'text-mt-dark-green bg-mt-light-aqua/10 border-r-3 border-mt-mid-green'
                  : 'text-mt-grey hover:text-mt-dark-green hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={18} />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 text-xs text-mt-grey">
        <p>Mumtathil IQ v1.0</p>
        <p className="mt-1">Vision 2030</p>
      </div>
    </aside>
  );
}
