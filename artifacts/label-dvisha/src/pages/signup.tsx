import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignup } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/BrandLogo";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const { login: authLogin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = useSignup({
    mutation: {
      onSuccess: (data) => {
        authLogin(data.token, data.user);
        setLocation("/");
      },
      onError: (err: any) => {
        toast({ title: "Sign up failed", description: err?.data?.error ?? "Something went wrong.", variant: "destructive" });
      },
    },
  });

  function onSubmit(data: SignupForm) {
    signupMutation.mutate({ data });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="text-center text-primary-foreground px-12 flex flex-col items-center gap-4">
          <BrandLogo framed imgClassName="h-14 w-auto max-w-[min(280px,85vw)] object-contain" />
          <p className="text-sm tracking-widest uppercase opacity-70">Join the story</p>
        </div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, white 0%, transparent 60%)" }} />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <div className="lg:hidden mb-4">
              <BrandLogo imgClassName="h-10 w-auto max-w-[220px] object-contain" />
            </div>
            <h2 className="font-serif text-2xl text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Join Label Dvisha today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Your name" data-testid="input-fullname" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" data-testid="input-email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+91 98765 43210" data-testid="input-phone" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" data-testid="input-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full tracking-widest uppercase text-xs mt-2"
              disabled={signupMutation.isPending}
              data-testid="button-submit"
            >
              {signupMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
