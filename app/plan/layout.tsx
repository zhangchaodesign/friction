import Essay from '@/components/essay/Essay';
import NavBar from '@/components/NavBar';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen">
      <Essay classes="flex-1 md:max-w-3xl 2xl:max-w-4xl" />
      <div className="flex-1 flex flex-col">
        <NavBar />
        {children}
      </div>
    </main>
  );
}
