import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { mockSessions, mockFeedback } from "@/lib/mock-data";

const History = () => {
  const sessions = [...mockSessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Session History</h1>
        <p className="mb-8 text-muted-foreground">Review all your past practice sessions.</p>

        {sessions.length === 0 ? (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-semibold text-foreground">No sessions yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Complete your first station to see it here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const fb = mockFeedback[session.id];
              return (
                <Card key={session.id} className="rounded-xl shadow-sm">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-medium text-foreground">{session.case_title}</h3>
                          <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            session.case_category === "communication"
                              ? "bg-primary/10 text-primary"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {session.case_category}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>{new Date(session.started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>•</span>
                          <span>{Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
                          {fb && (
                            <>
                              <span>•</span>
                              <span className="line-clamp-1">{fb.overall_summary.slice(0, 80)}…</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Link to={`/feedback/${session.id}`} className="shrink-0">
                        <Button variant="ghost" size="sm" className="gap-1 text-primary">
                          View Feedback <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default History;
