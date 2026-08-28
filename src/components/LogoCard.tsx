import Image from "next/image";

/**
 * White hero card on the marketplace home screen. Renders the approved
 * hero artwork directly — public/brand/logo-hero.jpg (icon + wordmark +
 * tagline + icon row, already composited on the brand green background).
 * Do not recreate this by hand; if the artwork changes, replace this file.
 */
export function LogoCard() {
  return (
    <div className="relative aspect-[568/343] w-full overflow-hidden rounded-3xl shadow-lg">
      <Image src="/brand/logo-hero.jpg" alt="Kopi Boy — From neighbourhoods to You." fill sizes="500px" priority style={{ objectFit: "cover" }} />
    </div>
  );
}
