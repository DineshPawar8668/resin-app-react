import { Box } from '@mui/material';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatBot } from '../ChatBot';
import { SocialFloatingButtons } from '../SocialFloatingButtons';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
      <SocialFloatingButtons />
      <ChatBot />
    </Box>
  );
};
