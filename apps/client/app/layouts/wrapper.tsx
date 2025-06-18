import type React from 'react';
import { AppSidebar } from '~/components/app/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar';
import { Outlet } from 'react-router';

export default function AppWrapper() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex items-center justify-between p-4'>
          <SidebarTrigger />
        </header>
        <main>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
