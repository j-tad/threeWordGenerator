import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscores and dashes are allowed")
});

export default function MainPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
    mode: "onChange"
  });

  const checkUsername = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/check-username/${username}`);
      if (!response.ok) {
        throw new Error('Failed to check username');
      }
      return response.json();
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          displayName: values.username
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const profile = await response.json();
      navigate(`/${profile.username}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-xl mx-auto pt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Three Words
            </CardTitle>
            <CardDescription className="text-center text-lg">
              Create your profile and let friends describe you in three words.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative flex items-center space-x-2">
                        <span className="text-muted-foreground text-lg font-mono whitespace-nowrap">
                          3words.live/
                        </span>
                        <FormControl>
                          <div className="relative flex-1">
                            <Input
                              placeholder="your-username"
                              {...field}
                              className="text-lg h-12 pr-10 font-mono"
                              onChange={async (e) => {
                                field.onChange(e);
                                const value = e.target.value;
                                if (value && value.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(value)) {
                                  checkUsername.mutate(value);
                                }
                              }}
                            />
                            {field.value && field.value.length >= 3 && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {checkUsername.isPending ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : checkUsername.isSuccess ? (
                                  checkUsername.data.available ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                  )
                                ) : null}
                              </div>
                            )}
                          </div>
                        </FormControl>
                      </div>
                      {checkUsername.data && (
                        <p className={`text-sm mt-2 ${
                          checkUsername.data.available ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {checkUsername.data.message}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg" 
                  disabled={isChecking || !checkUsername.data?.available}
                >
                  {isChecking ? "Checking availability..." : "Claim Your Profile"}
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm text-muted-foreground">
              Share your profile link and let others describe you in three words.
              No signup required.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}