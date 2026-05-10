import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/BrandLogo";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login: authLogin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        authLogin(data.token, data.user);
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Invalid credentials", description: "Check your email and password.", variant: "destructive" });
      },
    },
  });

  function onSubmit(data: LoginForm) {
    loginMutation.mutate({ data });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="text-center text-primary-foreground px-12 flex flex-col items-center gap-4">
          <BrandLogo framed imgClassName="h-14 w-auto max-w-[min(280px,85vw)] object-contain" />
          <p className="text-sm tracking-widest uppercase opacity-70">Wear Your Story</p>
        </div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, white 0%, transparent 60%)" }} />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <div className="lg:hidden mb-4">
              <BrandLogo imgClassName="h-10 w-auto max-w-[220px] object-contain" />
            </div>
            <h2 className="font-serif text-2xl text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                data-testid="input-email"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                data-testid="input-password"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full tracking-widest uppercase text-xs"
              disabled={loginMutation.isPending}
              data-testid="button-submit"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-8">
            New to Label Dvisha?{" "}
            <Link href="/signup" className="text-foreground underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
