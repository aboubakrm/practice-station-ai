import { ReactNode } from "react";
import Navbar from "./Navbar";
import Disclaimer from "./Disclaimer";

interface AppLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  userName?: string;
}

const AppLayout = ({ children, isAuthenticated = true, userName = "Alex" }: AppLayoutProps) => (
  <div className="flex min-h-screen flex-col">
    <Navbar isAuthenticated={isAuthenticated} userName={userName} />
    <main className="flex-1 pt-16">{children}</main>
    {isAuthenticated && <Disclaimer />}
  </div>
);

export default AppLayout;
