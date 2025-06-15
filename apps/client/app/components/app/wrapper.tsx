import type React from 'react';
import { AppSidebar } from '~/components/app/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar';

interface AppWrapperProps {
  children: React.ReactElement;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex items-center justify-between p-4'>
          <SidebarTrigger />
        </header>
        <main>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
