import { CategoryCard } from '@/components/CategoryCard';
import { categories } from '@/db/schema';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Ceva Bun',
  url: 'https://ceva-bun.ro',
  description:
    'Descoperă produse și experiențe în România. Alegi categoria, pui bugetul, noi găsim ceva perfect.',
  inLanguage: 'ro',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://ceva-bun.ro/toate?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function LandingPage() {
  return (
    <main className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
