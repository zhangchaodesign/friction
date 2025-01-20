'use client';

import React from 'react';
import Essay from '@/components/essay/Essay';
import NavBar from '@/components/NavBar';
import { PageContext, PageContextType } from './contexts';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [selectedType, setSelectedType] = React.useState<string>('All');

  const contextValue: PageContextType = {
    selectedType,
    setSelectedType
  };

  return (
    <main className="flex h-screen">
      <Essay
        classes="flex-1 md:max-w-3xl 2xl:max-w-4xl"
        setSelectedType={setSelectedType}
        selectedType={selectedType}
      />
      <div className="flex-1 flex flex-col">
        <NavBar />
        <PageContext.Provider value={contextValue}>
          {children}
        </PageContext.Provider>
      </div>
    </main>
  );
}