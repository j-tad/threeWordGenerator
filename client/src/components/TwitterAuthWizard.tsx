import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

type Step = {
  id: string;
  title: string;
  description: string;
  action?: () => Promise<boolean>;
};

export function TwitterAuthWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatus, setStepStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [isChecking, setIsChecking] = useState(false);

  const steps: Step[] = [
    {
      id: "connection",
      title: "Check Twitter API Connection",
      description: "Verify if we can connect to Twitter's API.",
      action: async () => {
        const response = await fetch('/api/auth/twitter/test-connection');
        return response.ok;
      }
    },
    {
      id: "callback",
      title: "Verify Callback URL",
      description: "Ensure the callback URL is properly configured.",
      action: async () => {
        const response = await fetch('/api/auth/twitter/verify-callback');
        return response.ok;
      }
    },
    {
      id: "credentials",
      title: "Check API Credentials",
      description: "Validate Twitter API credentials.",
      action: async () => {
        const response = await fetch('/api/auth/twitter/verify-credentials');
        return response.ok;
      }
    }
  ];

  const currentStep = steps[currentStepIndex];

  const runDiagnostic = async () => {
    setIsChecking(true);
    try {
      const result = await currentStep.action?.();
      setStepStatus(prev => ({
        ...prev,
        [currentStep.id]: result ? 'success' : 'error'
      }));
      
      if (result && currentStepIndex < steps.length - 1) {
        setTimeout(() => setCurrentStepIndex(prev => prev + 1), 1000);
      }
    } catch (error) {
      setStepStatus(prev => ({
        ...prev,
        [currentStep.id]: 'error'
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const getStepIcon = (step: Step) => {
    const status = stepStatus[step.id];
    if (status === 'success') return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    if (status === 'error') return <XCircle className="h-6 w-6 text-red-500" />;
    return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Twitter Auth Troubleshooter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-start gap-4 p-4 rounded-lg border ${
              index === currentStepIndex ? 'bg-muted' : ''
            }`}
          >
            {getStepIcon(step)}
            <div className="flex-1">
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              
              {stepStatus[step.id] === 'error' && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to complete this step. Please check your Twitter Developer settings and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        {currentStepIndex < steps.length && (
          <Button 
            className="w-full"
            onClick={runDiagnostic}
            disabled={isChecking}
          >
            {isChecking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {isChecking ? "Checking..." : "Run Diagnostic"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
