import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, Square, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/components/AppLayout";
import { mockCases } from "@/lib/mock-data";

type Step = "brief" | "active" | "complete";

const Station = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseData = mockCases.find((c) => c.id === id);
  const [step, setStep] = useState<Step>("brief");
  const [timeLeft, setTimeLeft] = useState(300);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (step === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setStep("complete");
            return 0;
          }
          return t - 1;
        });
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const endEarly = () => {
    clearInterval(timerRef.current);
    setStep("complete");
  };

  if (!caseData) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Case not found.</p>
        </div>
      </AppLayout>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft <= 30 ? "text-destructive" : timeLeft <= 60 ? "text-accent" : "text-foreground";

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {step === "brief" && (
          <div className="space-y-8">
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                caseData.category === "communication" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700"
              }`}>
                {caseData.category.charAt(0).toUpperCase() + caseData.category.slice(1)}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-foreground">{caseData.title}</h1>
            </div>

            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Station Brief</h2>
                <p className="leading-relaxed text-foreground">{caseData.scenario_brief}</p>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="mb-4 text-muted-foreground">You have <strong>{caseData.duration_minutes} minutes</strong></p>
              <Button
                size="lg"
                onClick={() => setStep("active")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-10"
              >
                Begin Station
              </Button>
            </div>
          </div>
        )}

        {step === "active" && (
          <div className="flex flex-col items-center space-y-10 py-10">
            <div className={`text-6xl font-bold tabular-nums tracking-tight ${timerColor}`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>

            <div className="flex flex-col items-center">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-slow" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Mic className="h-10 w-10" />
                </div>
              </div>
              <p className="mt-6 text-lg font-medium text-muted-foreground">Speak to your patient...</p>
            </div>

            <Button variant="outline" onClick={endEarly} className="gap-2 text-muted-foreground">
              <Square className="h-4 w-4" />
              End Early
            </Button>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-8 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-9 w-9 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Station Complete</h1>
              <p className="mt-2 text-muted-foreground">
                Duration: {Math.floor(elapsed / 60)}m {elapsed % 60}s
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => navigate(`/feedback/session-1`)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8"
            >
              View Your Feedback
            </Button>

            <div className="text-left">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Transcript</label>
              <Textarea
                readOnly
                value="Transcript will appear here after your voice session."
                className="min-h-[120px] bg-muted/50"
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Station;
