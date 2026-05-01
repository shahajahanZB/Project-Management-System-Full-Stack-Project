import { FolderKanban, LayoutDashboard, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

const navigation = [
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
];

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-16 items-center border-b px-5">
          <span className="text-sm font-semibold tracking-wide text-slate-900">{APP_NAME}</span>
        </div>
        <nav className="space-y-1 p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  isActive && 'bg-slate-100 text-slate-950',
                )
              }
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Workspace</p>
            <h1 className="text-base font-semibold text-slate-950">Engineering Delivery</h1>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
