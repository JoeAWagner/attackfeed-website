import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

interface Props {
  activeSlug?: string;
}

export default function CategoryNav({ activeSlug }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          !activeSlug
            ? "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30"
            : "border-border text-text-secondary hover:text-text-primary hover:border-border-bright"
        }`}
      >
        All Feeds
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeSlug === cat.slug
              ? `${cat.tailwindBg} ${cat.tailwindText} ${cat.tailwindBorder}`
              : "border-border text-text-secondary hover:text-text-primary hover:border-border-bright"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
