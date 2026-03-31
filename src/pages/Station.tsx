import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, Square, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = "43e1fe5f-7e2c-4e69-80c3-f1e18735e0b1";

type Step = "brief" | "active" | "complete" | "error";

interface CaseData {
  id: string;
  title: string;
  category: string;
  brief_markdown: string;
  vapi_assistant_id: string;
  duration_seconds: number;
}

const Station = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("brief");
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const vapiRef = useRef<Vapi | null>(null);

  // Fetch case from Supabase
  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErrorMessage("Case not found.");
        setStep("error");
      } else {
        setCaseData(data);
        setTimeLeft(data.duration_seconds);
      }
      setLoading(false);
    };
    fetchCase();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (step === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleEndSession();
            return 0;
          }
          return t - 1;
        });
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  // Cleanup vapi on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const handleBeginStation = async () => {
    if (!caseData) return;

    // Check mic permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrorMessage(
        "Microphone access was denied. Please enable it in Chrome: click the camera icon in the address bar → Allow → refresh the page."
      );
      setStep("error");
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("You are not logged in. Please log in and try again.");
      setStep("error");
      return;
    }

    // Check access
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_access")
      .eq("id", user.id)
      .single();

    if (!profile?.has_access) {
      setErrorMessage("Access not yet granted. Please contact the administrator.");
      setStep("error");
      return;
    }

    // Create session in Supabase
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        case_id: caseData.id,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError || !session) {
      setErrorMessage("Failed to create session. Please try again.");
      setStep("error");
      return;
    }

    setSessionId(session.id);

    // Start Vapi call
    try {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on("call-end", () => {
        handleEndSession();
      });

      await vapi.start(caseData.vapi_assistant_id, {
        metadata: { session_id: session.id },
      });

      setStep("active");
    } catch {
      setErrorMessage("Voice connection failed. Please check your internet connection and try again.");
      setStep("error");
    }
  };

  const handleEndSession = () => {
    clearInterval(timerRef.current);
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setGenerating(true);
    setStep("complete");
    pollForReport();
  };

  const endEarly = () => {
    handleEndSession();
  };

  const pollForReport = () => {
    if (!sessionId) return;

    let attempts = 0;
    const maxAttempts = 40; // 2 minutes

    const poll = setInterval(async () => {
      attempts++;

      const { data } = await supabase
        .from("sessions")
        .select("status")
        .eq("id", sessionId)
        .single();

      if (data?.status === "completed") {
        clearInterval(poll);
        navigate(`/feedback/${sessionId}`);
      } else if (data?.status === "failed") {
        clearInterval(poll);
        setGenerating(false);
        setErrorMessage("Feedback generation failed. Please contact support.");
        setStep("error");
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        setGenerating(false);
        setErrorMessage("Feedback is taking longer than expected. Check your session history in a few minutes.");
        setStep("error");
      }
    }, 3000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor =
    timeLeft <= 30
      ? "text-destructive"
      : timeLeft <= 60
      ? "text-accent"
      : "text-foreground";

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading case...</p>
        </div>
      </AppLayout>
    );
  }

  if (step === "error") {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-center text-muted-foreground max-w-md">{errorMessage}</p>
          <Button variant="outline" onClick={() => navigate("/cases")}>
            Back to Cases
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {step === "brief" && caseData && (
          <div className="space-y-8">
            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  caseData.category === "communication"
                    ? "bg-primary/10 text-primary"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {caseData.category.charAt(0).toUpperCase() +
                  caseData.category.slice(1)}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-foreground">
                {caseData.title}
              </h1>
            </div>

            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: caseData.brief_markdown
                    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2">$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2">$3</h3>'.replace('$3','$1'))
                    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
                    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
                    .replace(/\n\n/g, '<br/>')
                  }}
                />
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                You have{" "}
                <strong>{Math.floor(caseData.duration_seconds / 60)} minutes</strong>
              </p>
              <Button
                size="lg"
                onClick={handleBeginStation}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-10"
              >
                Begin Station
              </Button>
            </div>
          </div>
        )}

        {step === "active" && (
          <div className="flex flex-col items-center space-y-10 py-10">
            <div
              className={`text-6xl font-bold tabular-nums tracking-tight ${timerColor}`}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>

            <div className="flex flex-col items-center">
              <div className="relative flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Mic className="h-10 w-10" />
                </div>
              </div>
              <p className="mt-6 text-lg font-medium text-muted-foreground">
                Speak to your patient...
              </p>
            </div>

            <Button
              variant="outline"
              onClick={endEarly}
              className="gap-2 text-muted-foreground"
            >
              <Square className="h-4 w-4" />
              End Early
            </Button>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-8 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-9 w-9 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Station Complete
              </h1>
              <p className="mt-2 text-muted-foreground">
                Duration: {Math.floor(elapsed / 60)}m {elapsed % 60}s
              </p>
            </div>

            {generating && (
              <div className="space-y-3">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-muted-foreground">
                  Generating your feedback report...
                </p>
                <p className="text-xs text-muted-foreground">
                  This usually takes 20–40 seconds
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Station;
