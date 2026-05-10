/** Resolved URL for files in `public/` (respects Vite `base`). */
export function publicAssetUrl(filename: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = filename.replace(/^\//, "");
  return `${base}/${path}`;
}

type BrandLogoProps = {
  className?: string;
  /** Classes on the `<img>` (default: modest header size). */
  imgClassName?: string;
  /** Light padded frame — use on dark backgrounds (login hero, footer). */
  framed?: boolean;
};

export function BrandLogo({ className, imgClassName, framed }: BrandLogoProps) {
  const src = publicAssetUrl("logo.png");

  if (framed) {
    return (
      <span
        className={`inline-flex rounded-xl bg-[#F9F7F2] px-4 py-2.5 shadow-sm ring-1 ring-black/5 ${className ?? ""}`}
      >
        <img
          src={src}
          alt="Label Dvisha"
          width={260}
          height={60}
          className={
            imgClassName ?? "h-12 sm:h-14 w-auto max-w-[min(260px,80vw)] object-contain object-center"
          }
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <img
        src={src}
        alt="Label Dvisha"
        width={200}
        height={48}
        className={
          imgClassName ?? "h-8 sm:h-9 w-auto max-w-[min(200px,42vw)] object-contain object-left"
        }
        decoding="async"
      />
    </span>
  );
}
