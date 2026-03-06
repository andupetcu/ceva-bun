'use client';

type AffiliateLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  category: string;
  productId: number;
  sourceName: string | null;
  priceCents: number;
};

export function AffiliateLink({
  href,
  className,
  children,
  category,
  productId,
  sourceName,
  priceCents,
}: AffiliateLinkProps) {
  const handleClick = () => {
    window.umami?.track('affiliate-click', {
      category,
      productId,
      sourceName: sourceName || 'Ceva Bun',
      priceCents,
    });
  };

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
