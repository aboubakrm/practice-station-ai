import { Link } from "react-router-dom";
import { Play, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";
import { mockSessions } from "@/lib/mock-data";

const Dashboard = () => {
  const creditsRemaining = 3;
  const maxCredits = 5;
  const sessions = mockSessions;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Welcome back, Alex</h1>
          <p className="mt-1 text-muted-foreground">Ready to practise?</p>
        </div>

        {/* Credits + CTA */}
        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Stations Remaining</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{creditsRemaining}</p>
              <Progress value={(creditsRemaining / maxCredits) * 100} className="mt-3 h-2" />
              <p className="mt-2 text-xs text-muted-foreground">{creditsRemaining} of {maxCredits} free stations</p>
            </CardContent>
          </Card>

          <Card className="flex items-center justify-center rounded-xl shadow-sm">
            <CardContent className="p-6 text-center">
              <Link to="/cases">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 px-8">
                  <Play className="h-5 w-5" />
                  Start a Station
                </Button>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">Choose from 4 practice cases</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Sessions</h2>
          {sessions.length === 0 ? (
            <Card className="rounded-xl shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-semibold text-foreground">No stations yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">You haven't done any stations yet. Start your first one!</p>
                <Link to="/cases" className="mt-4">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary-dark">
                    Browse Cases
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="rounded-xl shadow-sm">
                  <CardContent className="flex items-center justify-between p-4 sm:p-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-medium text-foreground">{session.case_title}</h3>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          session.case_category === "communication"
                            ? "bg-primary/10 text-primary"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {session.case_category}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{new Date(session.started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span>{Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</span>
                      </div>
                    </div>
                    <Link to={`/feedback/${session.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 text-primary">
                        View Feedback <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
