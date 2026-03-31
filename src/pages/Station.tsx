import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, Square, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Vapi from "@vapi-ai/web";

const VAPI_PUBLIC_KEY = "PLACEHOLDER_VAPI_PUBLIC_KEY";

type Step = "brief" | "starting" | "active" | "complete";

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
  const { user } = useAuth();

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [caseLoading, setCaseLoading] = useState(true);
  const [caseError, setCaseError] = useState("");

  const [step, setStep] = useState<Step>("brief");
  const [timeLeft, setTimeLeft] = useState(600);
  const [elapsed, setElapsed] = useState(0);
  const [micError, setMicError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<"processing" | "completed" | "failed" | "timeout">("processing");

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const pollCountRef = useRef(0);
  const vapiRef = useRef<Vapi | null>(null);

  // Fetch case from Supabase
  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("cases")
        .select("id, title, category, brief_markdown, vapi_assistant_id, duration_seconds")
        .eq("id", id)
        .single();

      if (error || !data) {
        setCaseError("Case not found.");
      } else {
        setCaseData(data);
        setTimeLeft(data.duration_seconds);
      }
      setCaseLoading(false);
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
            handleEndCall();
            return 0;
          }
          return t - 1;
        });
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(pollRef.current);
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const handleBeginStation = async () => {
    setMicError("");

    // Check microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError(
        "Microphone access was denied. Please enable it in your browser settings (click the camera/mic icon in the address bar) and try again."
      );
      return;
    }

    if (!caseData || !user) return;
    setStep("starting");

    // Create session row in Supabase
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        case_id: caseData.id,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessionError || !sessionData) {
      setMicError("Failed to create session. Please try again.");
      setStep("brief");
      return;
    }

    const newSessionId = sessionData.id;
    setSessionId(newSessionId);

    // Initialise and start Vapi
    try {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setStep("active");
      });

      vapi.on("call-end", () => {
        clearInterval(timerRef.current);
        if (step !== "complete") {
          setStep("complete");
          markProcessingAndPoll(newSessionId);
        }
      });

      vapi.on("error", () => {
        setMicError("Voice connection failed. Please try again.");
        setStep("brief");
      });

      await vapi.start(caseData.vapi_assistant_id, {
        metadata: { session_id: newSessionId },
      } as any);

    } catch {
      setMicError("Failed to start voice session. Please try again.");
      setStep("brief");
    }
  };

  const handleEndCall = () => {
    clearInterval(timerRef.current);
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    setStep("complete");
    if (sessionId) {
      markProcessingAndPoll(sessionId);
    }
  };

  const markProcessingAndPoll = async (sid: string) => {
    // Update session to processing
    await supabase
      .from("sessions")
      .update({ status: "processing", completed_at: new Date().toISOString() })
      .eq("id", sid);

    setPollStatus("processing");
    pollCountRef.current = 0;

    // Poll every 3 seconds for up to 2 minutes (40 attempts)
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > 40) {
        clearInterval(pollRef.current);
        setPollStatus("timeout");
        return;
      }

      const { data } = await supabase
        .from("sessions")
        .select("status")
        .eq("id", sid)
        .single();

      if (data?.status === "completed") {
        clearInterval(pollRef.current);
        navigate(`/feedback/${sid}`);
      } else if (data?.status === "failed") {
        clearInterval(pollRef.current);
        setPollStatus("failed");
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

  // Loading state
  if (caseLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (caseError || !caseData) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">{caseError || "Case not found."}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* BRIEF STEP */}
        {(step === "brief" || step === "starting") && (
          <div className="space-y-8">
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                caseData.category === "communication"
                  ? "bg-primary/10 text-primary"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {caseData.category.charAt(0).toUpperCase() + caseData.category.slice(1)}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-foreground">{caseData.title}</h1>
            </div>

            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Station Brief
                </h2>
                <div
                  className="prose prose-sm max-w-none leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: briefToHtml(caseData.brief_markdown) }}
                />
              </CardContent>
            </Card>

            {micError && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                You have <strong>{Math.round(caseData.duration_seconds / 60)} minutes</strong>
              </p>
              <Button
                size="lg"
                onClick={handleBeginStation}
                disabled={step === "starting"}
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-10"
              >
                {step === "starting" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Begin Station"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ACTIVE STEP */}
        {step === "active" && (
          <div className="flex flex-col items-center space-y-10 py-10">
            <div className={`text-6xl font-bold tabular-nums tracking-tight ${timerColor}`}>
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
              onClick={handleEndCall}
              className="gap-2 text-muted-foreground"
            >
              <Square className="h-4 w-4" />
              End Early
            </Button>
          </div>
        )}

        {/* COMPLETE STEP */}
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

            {pollStatus === "processing" && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your feedback report...</p>
                <p className="text-xs text-muted-foreground">This usually takes 20–30 seconds</p>
              </div>
            )}

            {pollStatus === "failed" && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive mx-auto max-w-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Feedback generation failed. Please contact support or try another session.</span>
              </div>
            )}

            {pollStatus === "timeout" && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 mx-auto max-w-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>This is taking longer than expected. Check your session history in a few minutes.</span>
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
};

// Converts basic markdown to HTML for the brief display
function briefToHtml(markdown: string): string {
  return markdown
    .replace(/^## (.+)$/gm, "<h2 class='text-base font-semibold mt-4 mb-1'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 class='text-sm font-semibold mt-4 mb-2 text-muted-foreground uppercase tracking-wider'>$1</h3>")
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br/>")
    .replace(/\n/g, " ");
}

export default Station;
