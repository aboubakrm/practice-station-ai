import { Link } from "react-router-dom";
import { Clock, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";

interface Case {
  id: string;
  title: string;
  category: string;
  duration_seconds: number;
}

const Cases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title, category, duration_seconds")
        .eq("is_active", true);

      if (!error && data) setCases(data);
      setLoading(false);
    };
    fetchCases();
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Practice Cases</h1>
          <p className="mt-1 text-muted-foreground">Choose a station to begin your timed practice session.</p>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="flex flex-col rounded-xl shadow-sm">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-3 h-5 w-24 animate-pulse rounded bg-border" />
                  <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-border" />
                  <div className="mb-4 h-4 w-full animate-pulse rounded bg-border" />
                  <div className="h-8 w-28 animate-pulse rounded bg-border" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {cases.map((c) => (
              <Card key={c.id} className="flex flex-col rounded-xl shadow-sm">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.category === "communication"
                        ? "bg-primary/10 text-primary"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {c.category.charAt(0).toUpperCase() + c.category.slice(1)}
                    </span>
                  </div>

                  <h3 className="mb-4 text-lg font-semibold text-foreground">{c.title}</h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {Math.round(c.duration_seconds / 60)} minutes
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
        )}
      </div>
    </AppLayout>
  );
};

export default Cases;
