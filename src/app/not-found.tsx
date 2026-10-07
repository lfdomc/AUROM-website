import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80dvh] flex-col justify-center pt-28">
      <p className="font-mono text-sm text-accent-text">Error 404</p>
      <h1 className="mt-4 max-w-[16ch] text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold">Esta página no está en el sistema.</h1>
      <p className="mt-5 max-w-[48ch] text-lg text-ink-muted">Puede que el enlace haya cambiado. Vuelva al inicio para ver todas las soluciones.</p>
      <Link href="/" className="mt-10 inline-flex h-13 w-fit items-center rounded-pill bg-accent px-7 font-semibold text-accent-ink">
        Volver al inicio
      </Link>
    </section>
  );
}
