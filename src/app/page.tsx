import { CategoryCard } from '@/components/CategoryCard';
import { categories } from '@/db/schema';

export default function LandingPage() {
  return (
    <main className="space-y-10">
      <section className="glass p-8 text-center">
        <h1 className="text-4xl font-black md:text-5xl">Ceva Bun 🤌</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-200/90 light:text-slate-700">
          Nu știi ce vrei, dar vrei ceva bun. Alegi categoria, pui bugetul, noi facem restul.
        </p>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard key={cat} category={cat} />
        ))}
      </section>
    </main>
  );
}
