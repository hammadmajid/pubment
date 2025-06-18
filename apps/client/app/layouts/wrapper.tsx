import { AppSidebar } from '~/components/app/sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar';
import { Outlet } from 'react-router';
import { useNavigation } from 'react-router';
import { ThemeProvider } from '~/components/theme-provider';

export default function AppWrapper() {
  const navigation = useNavigation();

  return (
    <ThemeProvider>
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
