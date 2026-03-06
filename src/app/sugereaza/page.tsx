import { SubmissionForm } from '@/components/SubmissionForm';

export default function SugereazaPage() {
  return (
    <main className="space-y-5">
      <section className="glass p-6">
        <h1 className="text-3xl font-bold">Sugerează ceva bun</h1>
        <p className="mt-2 text-sm text-slate-300">
          Trimite o recomandare și o verificăm rapid. Dacă e bună, apare în listă.
        </p>
      </section>
      <SubmissionForm />
    </main>
  );
}
