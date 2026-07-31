"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { register as registerApi, UserProfile } from "@/services/authService";
import { setAccessToken, setStoredUser } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Check, X, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/store/appStore";

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (must include @)"),
  gender: z.enum(["Male", "Female", "Other"] as const, {
    message: "Please select a gender",
  }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^a-zA-Z0-9]/, "Must include a special character"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useApp();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      gender: undefined,
      password: "",
    },
  });

  const selectedGender = watch("gender");
  const passwordValue = watch("password") || "";

  const passwordRules = [
    { label: "At least 6 characters", valid: passwordValue.length >= 6 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "One number (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "One special sign (!@#$%^&*)", valid: /[^a-zA-Z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerApi({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
        gender: data.gender,
      });

      // 1. Save Token
      if (response?.token) {
        setAccessToken(response.token);
      }

      // 2. Format User Profile
      const rawUser = response?.user;
      const userProfile = {
        id: rawUser?.id || "GBH-2026-8812",
        fullName: rawUser?.fullName || data.fullName.trim(),
        email: rawUser?.email || data.email.trim(),
        gender: rawUser?.gender || data.gender,
        phoneNumber: rawUser?.phoneNumber,
        avatar: rawUser?.avatar,
        role: rawUser?.role || "patient",
      };

      // 3. Save to localStorage
      setStoredUser(userProfile as UserProfile);

      // 4. Update Zustand / App State
      if (setUser) {
        setUser(userProfile as UserProfile);
      }

      toast.success("Account created successfully! Welcome to Gbemileke Hospital.");
      router.push("/patient");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An error occurred during registration. Please try again.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <div className="text-xs font-medium uppercase tracking-widest text-primary">
        Gbemileke Hospital Portal
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold">
        Create an account
      </h1>
      <p className="mt-2 text-muted-foreground">
        Sign up to manage your medical appointments, access consultation records, and connect with doctors in Ibadan.
      </p>

      <Card className="mt-8">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative mt-1">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Dr. Gbemileke Adebayo"
                  {...register("fullName")}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Gender Selection */}
            <div>
              <Label>Gender</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["Male", "Female", "Other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setValue("gender", g, { shouldValidate: true })}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                      selectedGender === g
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.gender && (
                <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Live Password Rules */}
              <div className="mt-2.5 space-y-1.5 rounded-lg border border-border bg-secondary/30 p-3 text-xs">
                <p className="font-medium text-muted-foreground mb-1">Password must include:</p>
                {passwordRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {rule.valid ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground/60" />
                    )}
                    <span className={rule.valid ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-muted-foreground"}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Note */}
            <div className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>
                Your health data and personal details are strictly protected under medical confidentiality laws.
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full font-semibold"
            >
              {isSubmitting ? "Creating account..." : "Register Account"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Log in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}