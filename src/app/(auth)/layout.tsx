export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4 py-8">
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}