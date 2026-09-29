import { SITE_NAME } from "@/config/site";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">{SITE_NAME}</h1>
      <p className="mt-4">
        For freshers moving to Bengaluru. Check when your batch is joining. Coming soon.
      </p>
    </main>
  );
}
