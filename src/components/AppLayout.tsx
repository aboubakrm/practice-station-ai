import { ReactNode } from "react";
import Navbar from "./Navbar";
import Disclaimer from "./Disclaimer";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      {user && <Disclaimer />}
    </div>
  );
};

export default AppLayout;
