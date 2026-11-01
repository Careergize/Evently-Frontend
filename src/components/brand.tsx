import Link from "next/link";
export function VeyraMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 74 76"
      fill="none"
      aria-hidden="true"
    >
      <path d="M16 15h10l12 30 12-30h8L39 61h-5Z" fill="currentColor" />
      <path d="M48 15h10l-4 9H44Z" fill="#C6A76B" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Veyra home">
      <VeyraMark size={36} />
      <span className="brand-wordmark">Veyra</span>
    </Link>
  );
}
