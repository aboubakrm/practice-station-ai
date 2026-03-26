import { Link } from "react-router-dom";
import { Clock, MessageSquare, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: Clock,
    title: "Timed Stations",
    description: "Practice under realistic PACES timing with automatic countdowns.",
  },
  {
    icon: MessageSquare,
    title: "AI Patient Interaction",
    description: "Engage in realistic patient conversations powered by AI.",
  },
  {
    icon: ClipboardList,
    title: "Structured Feedback",
    description: "Receive detailed coaching reports mapped to PACES marking criteria.",
  },
];

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-32 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Practice PACES stations on demand. Get structured feedback in minutes.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          An AI practice partner for communication and consultation drills — built for repetition, not replacement of bedside teaching.
        </p>
        <Link to="/signup" className="mt-10">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold px-8 py-6 rounded-lg shadow-sm">
            Try a Free Station
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card px-4 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-background p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t border-border px-4 py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by candidates at
        </p>
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-8 text-lg font-semibold text-muted-foreground/50">
          <span>London Medical School</span>
          <span>•</span>
          <span>Edinburgh Deanery</span>
          <span>•</span>
          <span>Manchester Foundation</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">About</a>
            <a href="#" className="hover:text-foreground">Contact</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground/70">
            Not affiliated with or endorsed by the Federation, Royal Colleges, or MRCP(UK).
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
