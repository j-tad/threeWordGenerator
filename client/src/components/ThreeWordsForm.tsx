import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  word1: z.string().min(1).max(20),
  word2: z.string().min(1).max(20),
  word3: z.string().min(1).max(20),
  submitterName: z.string().max(30).optional(),
  anonymous: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (values: FormValues) => Promise<void>;
  username: string;
}

export function ThreeWordsForm({ onSubmit, username }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word1: "",
      word2: "",
      word3: "",
      submitterName: "",
      anonymous: false
    }
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-medium mb-2">
            Describe {username} in three words.
          </h2>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="submitterName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Your name (optional)" 
                    {...field} 
                    className="text-center text-lg h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="word1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="First word" 
                    {...field} 
                    className="text-center text-lg h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="word2"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Second word" 
                    {...field} 
                    className="text-center text-lg h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="word3"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Third word" 
                    {...field} 
                    className="text-center text-lg h-12"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="anonymous"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label>Post anonymously</Label>
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}