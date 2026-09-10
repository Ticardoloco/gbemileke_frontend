/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "@/services/authService";
import { useApp } from "@/store/appStore";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract token from route param (/reset-password/[token]) or query param (?token=xxx)
  const token = (params?.token as string) || searchParams.get("token") || "";
  console.log('token', token);
  

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const {user} = useApp()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new link.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(token, newPassword);
      setIsSuccess(true);
      toast.success(res?.message || "Password reset successfully!");
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(
        error?.message || "Failed to reset password. Token may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(user){
      const role = user?.role?.toLowerCase();
       if (role === "practitioner") {
        router.push("/practitioner");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/patient");
      }
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            {isSuccess
              ? "Your password has been reset. Redirecting to login..."
              : "Enter your new password below to update your account credentials."}
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1">
                <p className="font-semibold">Password Changed!</p>
                <p>You can now sign in with your new password.</p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-xs sm:text-sm font-medium text-slate-700"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs sm:text-sm font-medium text-slate-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}