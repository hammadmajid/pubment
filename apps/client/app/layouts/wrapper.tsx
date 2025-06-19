'use client';

import { Outlet } from 'react-router';
import { useNavigation } from 'react-router';
import { AppSidebar } from '~/components/app/sidebar';
import { ThemeProvider } from '~/components/theme-provider';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar';

export default function AppWrapper() {
  const navigation = useNavigation();

  return (
    <ThemeProvider defaultTheme='system' attribute='class'>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className='flex items-center justify-between p-4'>
            <SidebarTrigger />
          </header>
          <main
            className={
              navigation.state === 'loading'
                ? 'opacity-30 pointer-events-none transition-opacity'
                : 'transition-opacity'
            }
          >
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
