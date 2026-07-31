"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useApp } from "@/store/appStore";
import { getCurrentUser, updateProfile } from "@/services/userService";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  Save, 
  Loader2, 
  Building, 
  Globe, 
  CreditCard,
  Edit3,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/services/authService";

export interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  gender: string;
  avatar: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function ProfilePage() {
  const { user, setUser, fetchProfile } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Unwrap actual user object if response is wrapped as { user: { ... } }
  const actualUser = (user as UserProfile)?.user || user;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      gender: "Male",
      avatar: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Nigeria",
    },
  });

  const currentAvatarUrl = watch("avatar");
  const currentFullName = watch("fullName");

  // Helper to extract address safely whether stored flat or nested
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractAddress = (userData: any) => {
    if (!userData) return { street: "", city: "", state: "", zipCode: "", country: "Nigeria" };

    const nested = userData?.address || userData?.profile?.address || {};
    return {
      street: userData?.street || nested.street || "",
      city: userData?.city || nested.city || "",
      state: userData?.state || nested.state || "",
      zipCode: userData?.zipCode || nested.zipCode || nested.postalCode || "",
      country: userData?.country || nested.country || "Nigeria",
    };
  };

  // Helper to normalize gender casing ("male" -> "Male")
  const formatGender = (genderStr?: string) => {
    if (!genderStr) return "Male";
    return genderStr.charAt(0).toUpperCase() + genderStr.slice(1).toLowerCase();
  };

  // 1. Fetch fresh user profile on mount
  useEffect(() => {
  async function loadFreshUser() {
    try {
      setIsLoading(true);

      // Fetch fresh profile data
      const freshData = await getCurrentUser();
      
      // Unwrap if the payload is nested like { user: { ... } } or { data: { ... } }
      const resolvedUser = freshData?.user || freshData;

      if (resolvedUser && (resolvedUser.fullName || resolvedUser.email)) {
        // Ensure state is updated in store so Navbar syncs immediately
        setUser(resolvedUser);
      }
    } catch (err) {
      console.error("Failed to fetch fresh profile data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  loadFreshUser();
}, [setUser]);

  // 2. Hydrate react-hook-form whenever Zustand user state updates
  useEffect(() => {
    if (actualUser) {
      const address = extractAddress(actualUser);

      reset({
        fullName: actualUser.fullName || "",
        phoneNumber: actualUser.phoneNumber || "",
        gender: formatGender(actualUser.gender),
        avatar: actualUser.avatar || "",
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      });
    }
  }, [user, reset]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setValue("avatar", base64String, { shouldDirty: true, shouldTouch: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);

      const addressData = {
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      };

      const payload = {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender.toLowerCase(), // Save back as lowercase to match backend
        avatar: data.avatar,
        ...addressData,
        address: addressData,
      };

      const updatedUser = await updateProfile(payload);

      // Persist full state locally in store
      setUser({
        ...actualUser,
        ...(updatedUser?.user || updatedUser),
        ...payload,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: unknown) {
      console.error("Update profile error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (actualUser) {
      const address = extractAddress(actualUser);

      reset({
        fullName: actualUser.fullName || "",
        phoneNumber: actualUser.phoneNumber || "",
        gender: formatGender(actualUser.gender),
        avatar: actualUser.avatar || "",
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      });
    }
    setIsEditing(false);
  };

  const displayName = currentFullName || actualUser?.fullName || "Patient";
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading && !actualUser) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoading && !actualUser) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground text-sm">Failed to load profile data.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
            Account Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? "Editing your personal details and preferences."
              : "View your personal details, contact info, and address."}
          </p>
        </div>

        <div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2 shadow-sm">
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-border/80 shadow-sm text-center">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-2 border-primary/20 shadow-md">
                  {Boolean(currentAvatarUrl && currentAvatarUrl.trim()) && (
                    <AvatarImage src={currentAvatarUrl} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                {isEditing && (
                  <label
                    htmlFor="avatar-file"
                    className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium"
                  >
                    <Camera className="h-6 w-6 mb-1" />
                    <span>Change</span>
                    <input
                      id="avatar-file"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {isEditing && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  Hover photo and click to upload new image
                </p>
              )}

              <h2 className="mt-4 text-lg font-bold text-foreground">{displayName}</h2>
              <p className="text-xs text-muted-foreground font-mono">
                {actualUser?.email || "patient@gbemileke.com"}
              </p>

              <div className="mt-4 w-full rounded-lg bg-secondary/50 p-3 border border-border text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-primary" /> Patient ID
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {actualUser?.id || "GBH-2026-8812"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Account Status
                  </span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                    {actualUser?.role || "ACTIVE"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">System Credentials</CardTitle>
              <CardDescription className="text-xs">
                Managed system credentials cannot be edited directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Registered Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={actualUser?.email || ""}
                    disabled
                    className="pl-9 bg-muted/50 cursor-not-allowed text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  disabled={!isEditing}
                  placeholder="e.g. John Doe"
                  {...register("fullName", { required: "Full name is required" })}
                  className="text-sm disabled:opacity-80 disabled:bg-muted/30"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phoneNumber" className="text-xs font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      disabled={!isEditing}
                      placeholder="+234 800 000 0000"
                      {...register("phoneNumber")}
                      className="pl-9 text-sm disabled:opacity-80 disabled:bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Gender</Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        disabled={!isEditing}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="text-sm disabled:opacity-80 disabled:bg-muted/30">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Residential Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="street" className="text-xs font-medium">
                  Street Address
                </Label>
                <Input
                  id="street"
                  disabled={!isEditing}
                  placeholder="e.g. 12 Hospital Road"
                  {...register("street")}
                  className="text-sm disabled:opacity-80 disabled:bg-muted/30"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-medium">
                    City
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      disabled={!isEditing}
                      placeholder="Ikeja"
                      {...register("city")}
                      className="pl-9 text-sm disabled:opacity-80 disabled:bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-medium">
                    State / Province
                  </Label>
                  <Input
                    id="state"
                    disabled={!isEditing}
                    placeholder="Lagos"
                    {...register("state")}
                    className="text-sm disabled:opacity-80 disabled:bg-muted/30"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="zipCode" className="text-xs font-medium">
                    Zip / Postal Code
                  </Label>
                  <Input
                    id="zipCode"
                    disabled={!isEditing}
                    placeholder="100001"
                    {...register("zipCode")}
                    className="text-sm disabled:opacity-80 disabled:bg-muted/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-medium">
                    Country
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="country"
                      disabled={!isEditing}
                      placeholder="Nigeria"
                      {...register("country")}
                      className="pl-9 text-sm disabled:opacity-80 disabled:bg-muted/30"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="gap-2 font-semibold shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Profile Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}