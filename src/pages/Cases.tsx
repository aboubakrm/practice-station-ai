import { Link } from "react-router-dom";
import { Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { mockCases } from "@/lib/mock-data";

const DifficultyDots = ({ level }: { level: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`h-2 w-2 rounded-full ${
          i <= level ? "bg-primary" : "bg-border"
        }`}
      />
    ))}
  </div>
);

const Cases = () => {
  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Practice Cases</h1>
          <p className="mt-1 text-muted-foreground">Choose a station to begin your timed practice session.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {mockCases.map((c) => (
            <Card key={c.id} className="flex flex-col rounded-xl shadow-sm">
              <CardContent className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-start justify-between">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.category === "communication"
                      ? "bg-primary/10 text-primary"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                  </span>
                  <DifficultyDots level={c.difficulty} />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">{c.title}</h3>
                <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-2">{c.scenario_brief}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {c.duration_minutes} minutes
                  </div>
                  <Link to={`/station/${c.id}`}>
                    <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 font-medium">
                      <Play className="h-4 w-4" />
                      Start Station
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Cases;
