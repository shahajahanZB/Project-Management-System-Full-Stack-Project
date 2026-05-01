import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-24 text-center">
      <p className="text-sm font-medium text-slate-500">404</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">Page not found</h2>
      <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist.</p>
      <Link
        to="/projects"
        className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-blue-700"
      >
        Go to projects
      </Link>
    </section>
  );
}
