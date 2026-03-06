import { redirect } from 'next/navigation';

export default function AdminEditAliasPage({ params }: { params: { id: string } }) {
  redirect(`/admin/products/${params.id}`);
}
