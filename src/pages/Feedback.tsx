import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Lightbulb, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { mockFeedback } from "@/lib/mock-data";

const ratingColor = (rating: string) => {
  switch (rating) {
    case "Excellent": return "bg-success/10 text-success";
    case "Good": return "bg-primary/10 text-primary";
    case "Needs Work": return "bg-accent/20 text-accent-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const Feedback = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const feedback = mockFeedback[sessionId || ""];
  const [thumbs, setThumbs] = useState<boolean | null>(null);

  if (!feedback) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Feedback not found.</p>
        </div>
      </AppLayout>
    );
  }

  const subRatings = [
    { label: "Structure & Time Management", value: feedback.structure_rating },
    { label: "Empathy & Rapport", value: feedback.empathy_rating },
    { label: "Clarity of Explanation", value: feedback.clarity_rating },
    { label: "Safety-netting & Closure", value: feedback.safety_netting_rating },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Feedback Report</h1>
        <p className="mb-8 text-muted-foreground">Your structured coaching feedback</p>

        <div className="space-y-6">
          {/* Overall */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg">Overall Performance</CardTitle></CardHeader>
            <CardContent><p className="leading-relaxed text-muted-foreground">{feedback.overall_summary}</p></CardContent>
          </Card>

          {/* Strengths */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg text-success">Strengths</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg text-accent-foreground">Areas for Improvement</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Missed Opportunities */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg text-destructive">Missed Opportunities</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.missed_opportunities.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Communication Skills */}
          <Card className="rounded-xl shadow-sm">
            <CardHeader><CardTitle className="text-lg">Communication Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {subRatings.map((r) => (
                  <div key={r.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm text-foreground">{r.label}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ratingColor(r.value)}`}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Better Phrasing */}
          <Card className="rounded-xl border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Better Phrasing</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{feedback.better_phrasing}</p>
            </CardContent>
          </Card>

          {/* Action Item */}
          <Card className="rounded-xl border-accent/30 bg-accent/10 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-accent-foreground" />
                <h3 className="font-semibold text-accent-foreground">Action Item</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{feedback.action_item}</p>
            </CardContent>
          </Card>

          {/* Thumbs */}
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-muted-foreground">Was this feedback helpful?</p>
            <div className="flex gap-3">
              <Button
                variant={thumbs === true ? "default" : "outline"}
                size="sm"
                onClick={() => setThumbs(true)}
                className={thumbs === true ? "bg-success text-success-foreground" : ""}
              >
                <ThumbsUp className="mr-1.5 h-4 w-4" />
                Yes
              </Button>
              <Button
                variant={thumbs === false ? "default" : "outline"}
                size="sm"
                onClick={() => setThumbs(false)}
                className={thumbs === false ? "bg-destructive text-destructive-foreground" : ""}
              >
                <ThumbsDown className="mr-1.5 h-4 w-4" />
                No
              </Button>
            </div>
          </div>

          {/* Next */}
          <div className="text-center">
            <Link to="/cases">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-dark gap-2">
                Practice Another Station <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Feedback;
