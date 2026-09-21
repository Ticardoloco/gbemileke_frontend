// "use client";

// import { useEffect, useState, useMemo } from "react";
// import {
//   Heart,
//   Plus,
//   CheckCircle2,
//   Search,
//   X,
//   Loader2,
//   MessageSquareOff,
//   Star
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   getApprovedTestimonial,
//   postTestimonial,
//   TestimonialPayload,
//   TestimonialResponse
// } from "@/services/testimonialServices";
// import { getSpecialities, SpecialitiesType } from "@/services/specialitiesService";
// import TestimonialCard from "@/components/home/TestimonialCard";
// import { toast } from "sonner";

// export default function HealingStoriesPage() {
//   const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
//   const [testimonialLoading, setTestimonialLoading] = useState<boolean>(true);
//   const [specialties, setSpecialties] = useState<SpecialitiesType[]>([]);

//   // Filter States
//   const [selectedCare, setSelectedCare] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [selectedRating, setSelectedRating] = useState<number>(0); // 0 = all ratings

//   // Dialog & Submission States
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [formData, setFormData] = useState<TestimonialPayload>({
//     name: "",
//     care: "",
//     message: "",
//     rating: 5,
//     isApproved: false,
//     isFeature: false,
//   });

//   useEffect(() => {
//     const fetchTestimonials = async () => {
//       try {
//         setTestimonialLoading(true);
//         const res = await getApprovedTestimonial();
//         setTestimonials(res?.testimonials || []);
//       } catch (error) {
//         console.error("Failed to load Testimonials", error);
//         toast.error("Failed to load testimonials");
//       } finally {
//         setTestimonialLoading(false);
//       }
//     };

//     fetchTestimonials();
//   }, []);

//   useEffect(() => {
//     const fetchSpecialties = async () => {
//       try {
//         const res = await getSpecialities();
//         const items = res?.specialities || [];
//         setSpecialties(items);
//         if (items.length > 0) {
//           setFormData((prev) => ({ ...prev, care: items[0].slug }));
//         }
//       } catch (error) {
//         console.error("Failed to load specialties", error);
//       }
//     };

//     fetchSpecialties();
//   }, []);

//   // Filtered Testimonials Calculation
//   const filteredStories = useMemo(() => {
//     return testimonials.filter((story) => {
//       // Category / Specialty match
//       const matchesCare =
//         selectedCare === "all" ||
//         story.care?.toLowerCase() === selectedCare.toLowerCase();

//       // Search term match (name or message text)
//       const matchesSearch =
//         searchQuery.trim() === "" ||
//         story.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         story.message?.toLowerCase().includes(searchQuery.toLowerCase());

//       // Star rating match
//       const matchesRating =
//         selectedRating === 0 || Number(story.rating) === selectedRating;

//       return matchesCare && matchesSearch && matchesRating;
//     });
//   }, [testimonials, selectedCare, searchQuery, selectedRating]);

//   // Count testimonials per care category
//   const getCategoryCount = (slug: string) => {
//     if (slug === "all") return testimonials.length;
//     return testimonials.filter((t) => t.care?.toLowerCase() === slug.toLowerCase()).length;
//   };

//   const hasActiveFilters =
//     selectedCare !== "all" || searchQuery !== "" || selectedRating !== 0;

//   const resetFilters = () => {
//     setSelectedCare("all");
//     setSearchQuery("");
//     setSelectedRating(0);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setIsSubmitting(true);
//       await postTestimonial(formData);
//       setIsSubmitted(true);
//       toast.success("Testimony submitted successfully for approval!");

//       setTimeout(() => {
//         setIsSubmitted(false);
//         setIsDialogOpen(false);
//         setFormData({
//           name: "",
//           care: specialties[0]?.slug || "",
//           message: "",
//           rating: 5,
//           isApproved: false,
//           isFeature: false,
//         });
//       }, 2000);
//     } catch (error) {
//       console.error("Failed to submit testimonial", error);
//       toast.error("Failed to submit testimonial. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-7xl space-y-10">

//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
//           <div className="space-y-3 max-w-2xl">
//             <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 gap-1 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
//               <Heart className="h-3.5 w-3.5 fill-primary" /> Patient Recovery & Outcomes
//             </Badge>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-display">
//               Healing Stories
//             </h1>
//             <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
//               Read authentic experiences shared by our patients following traditional herbal treatments, maternal anti-natal care, and holistic remedies.
//             </p>
//           </div>

//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger>
//               <Button size="lg" className="gap-2 font-semibold shadow-xs shrink-0">
//                 <Plus className="h-4 w-4" /> Share Your Story
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle className="text-xl font-display">Share Your Healing Story</DialogTitle>
//                 <DialogDescription>
//                   Your feedback helps us continue providing trusted traditional healthcare to our community.
//                 </DialogDescription>
//               </DialogHeader>

//               {isSubmitted ? (
//                 <div className="py-8 text-center space-y-3">
//                   <CheckCircle2 className="h-12 w-12 text-primary mx-auto animate-bounce" />
//                   <h3 className="font-semibold text-lg">Thank You for Sharing!</h3>
//                   <p className="text-sm text-muted-foreground">
//                     Your testimonial has been submitted for approval and will appear shortly.
//                   </p>
//                 </div>
//               ) : (
//                 <form onSubmit={handleSubmit} className="space-y-4 pt-2">
//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-foreground">Full Name / Initials</label>
//                     <Input
//                       required
//                       placeholder="e.g. Mrs. Blessing Adebayo"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     />
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-foreground">Care Received</label>
//                     <select
//                       value={formData.care}
//                       onChange={(e) => setFormData({ ...formData, care: e.target.value })}
//                       className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
//                     >
//                       {specialties.toReversed().map((spec) => (
//                         <option key={spec._id} value={spec.slug}>
//                           {spec.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-foreground">Rating</label>
//                     <div className="flex items-center gap-1">
//                       {[1, 2, 3, 4, 5].map((star) => (
//                         <button
//                           key={star}
//                           type="button"
//                           onClick={() => setFormData({ ...formData, rating: star })}
//                           className="p-1 focus:outline-none"
//                         >
//                           <Star
//                             className={`h-6 w-6 fill-current ${
//                               star <= formData.rating ? "text-primary" : "text-muted-foreground/30"
//                             }`}
//                           />
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="space-y-1.5">
//                     <label className="text-xs font-semibold text-foreground">Your Experience</label>
//                     <Textarea
//                       required
//                       rows={4}
//                       placeholder="Describe your care journey and recovery..."
//                       value={formData.message}
//                       onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                     />
//                   </div>

//                   <Button type="submit" disabled={isSubmitting} className="w-full font-semibold mt-2">
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
//                       </>
//                     ) : (
//                       "Submit Story"
//                     )}
//                   </Button>
//                 </form>
//               )}
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Filter Controls Panel */}
//         <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
//           <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">

//             {/* Search Bar */}
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search testimonials by keyword or patient name..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-9 pr-9 text-sm bg-background"
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               )}
//             </div>

//             {/* Filter Dropdowns Container */}
//             <div className="flex flex-col sm:flex-row items-center gap-2">

//               {/* Care Category HTML Select */}
//               <select
//                 value={selectedCare}
//                 onChange={(e) => setSelectedCare(e.target.value)}
//                 className="w-full sm:w-48 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
//               >
//                 <option value="all">All Care</option>
//                 {specialties.toReversed().map((spec) => (
//                   <option key={spec._id} value={spec.slug}>
//                     {spec.name} ({getCategoryCount(spec.slug)})
//                   </option>
//                 ))}
//               </select>

//               {/* Rating HTML Select */}
//               <select
//                 value={selectedRating}
//                 onChange={(e) => setSelectedRating(Number(e.target.value))}
//                 className="w-full sm:w-40 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
//               >
//                 <option value={0}>All Ratings</option>
//                 <option value={5}>5 Stars</option>
//                 <option value={4}>4 Stars</option>
//                 <option value={3}>3 Stars</option>
//                 <option value={2}>2 Stars</option>
//                 <option value={1}>1 Star</option>
//               </select>

//               {/* Clear Filters Button */}
//               {hasActiveFilters && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={resetFilters}
//                   className="text-xs text-muted-foreground hover:text-foreground gap-1 px-2 shrink-0 w-full sm:w-auto"
//                 >
//                   <X className="h-3.5 w-3.5" /> Clear
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Main Feed Header & Active Count */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-xl font-bold text-foreground tracking-tight">
//             Patient Feedback ({filteredStories.length})
//           </h2>
//           {hasActiveFilters && (
//             <span className="text-xs text-muted-foreground">
//               Showing matching results
//             </span>
//           )}
//         </div>

//         {/* Testimonials List Grid */}
//         {testimonialLoading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {[1, 2, 3, 4].map((n) => (
//               <div
//                 key={n}
//                 className="h-44 rounded-xl bg-muted/40 animate-pulse border border-border/50"
//               />
//             ))}
//           </div>
//         ) : filteredStories.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {filteredStories.map((story) => (
//               <TestimonialCard key={story._id} testimonial={story} />
//             ))}
//           </div>
//         ) : (
//           <div className="py-16 text-center border border-dashed rounded-xl border-border/70 space-y-3 bg-card/30">
//             <MessageSquareOff className="h-10 w-10 text-muted-foreground/60 mx-auto" />
//             <div className="space-y-1">
//               <p className="text-base font-semibold text-foreground">
//                 No testimonials match your filters
//               </p>
//               <p className="text-xs text-muted-foreground max-w-sm mx-auto">
//                 Try searching for another keyword, clearing your search, or selecting a different specialty.
//               </p>
//             </div>
//             {hasActiveFilters && (
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={resetFilters}
//                 className="mt-2 text-xs"
//               >
//                 Reset All Filters
//               </Button>
//             )}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Heart,
  Plus,
  CheckCircle2,
  Search,
  X,
  Loader2,
  MessageSquareOff,
  Star,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getApprovedTestimonial,
  postTestimonial,
  TestimonialPayload,
  TestimonialResponse,
} from "@/services/testimonialServices";
import {
  getSpecialities,
  SpecialitiesType,
} from "@/services/specialitiesService";
import TestimonialCard from "@/components/home/TestimonialCard";
import { toast } from "sonner";

export default function HealingStoriesPage() {
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [testimonialLoading, setTestimonialLoading] = useState<boolean>(true);
  const [specialties, setSpecialties] = useState<SpecialitiesType[]>([]);

  // Filter States
  const [selectedCare, setSelectedCare] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number>(0); // 0 = all ratings

  // Dialog & Submission States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<TestimonialPayload>({
    name: "",
    care: "",
    message: "",
    rating: 5,
    isApproved: false,
    isFeatured: false,
  });

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialLoading(true);
        const res = await getApprovedTestimonial();
        setTestimonials(res?.testimonials || []);
      } catch (error) {
        console.error("Failed to load Testimonials", error);
        toast.error("Failed to load testimonials");
      } finally {
        setTestimonialLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialities();
        const items = res?.specialities || [];
        setSpecialties(items);
        if (items.length > 0) {
          setFormData((prev) => ({ ...prev, care: items[0].slug }));
        }
      } catch (error) {
        console.error("Failed to load specialties", error);
      }
    };

    fetchSpecialties();
  }, []);

  // Filtered Testimonials Calculation
  const filteredStories = useMemo(() => {
    return testimonials.filter((story) => {
      // Category / Specialty match
      const matchesCare =
        selectedCare === "all" ||
        story.care?.toLowerCase() === selectedCare.toLowerCase();

      // Search term match (name or message text)
      const matchesSearch =
        searchQuery.trim() === "" ||
        story.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.message?.toLowerCase().includes(searchQuery.toLowerCase());

      // Star rating match
      const matchesRating =
        selectedRating === 0 || Number(story.rating) === selectedRating;

      return matchesCare && matchesSearch && matchesRating;
    });
  }, [testimonials, selectedCare, searchQuery, selectedRating]);

  // Count testimonials per care category
  const getCategoryCount = (slug: string) => {
    if (slug === "all") return testimonials.length;
    return testimonials.filter(
      (t) => t.care?.toLowerCase() === slug.toLowerCase(),
    ).length;
  };

  const hasActiveFilters =
    selectedCare !== "all" || searchQuery !== "" || selectedRating !== 0;

  const resetFilters = () => {
    setSelectedCare("all");
    setSearchQuery("");
    setSelectedRating(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await postTestimonial(formData);
      setIsSubmitted(true);
      toast.success("Testimony submitted successfully for approval!");

      setTimeout(() => {
        setIsSubmitted(false);
        setIsDialogOpen(false);
        setFormData({
          name: "",
          care: specialties[0]?.slug || "",
          message: "",
          rating: 5,
          isApproved: false,
          isFeatured: false,
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to submit testimonial", error);
      toast.error("Failed to submit testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
          <div className="space-y-3 max-w-2xl">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 gap-1 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
              <Heart className="h-3.5 w-3.5 fill-primary" /> Patient Recovery &
              Outcomes
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-display">
              Healing Stories
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Read authentic experiences shared by our patients following
              traditional herbal treatments, maternal anti-natal care, and
              holistic remedies.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
              className={buttonVariants({
                size: "lg",
                className: "gap-2 font-semibold shadow-xs shrink-0",
              })}
            >
              <Plus className="h-4 w-4" /> Share Your Story
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">
                  Share Your Healing Story
                </DialogTitle>
                <DialogDescription>
                  Your feedback helps us continue providing trusted traditional
                  healthcare to our community.
                </DialogDescription>
              </DialogHeader>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-primary mx-auto animate-bounce" />
                  <h3 className="font-semibold text-lg">
                    Thank You for Sharing!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your testimonial has been submitted for approval and will
                    appear shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Full Name / Initials
                    </label>
                    <Input
                      required
                      placeholder="e.g. Mrs. Blessing Adebayo"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Care Received
                    </label>
                    <select
                      value={formData.care}
                      onChange={(e) =>
                        setFormData({ ...formData, care: e.target.value })
                      }
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {specialties.toReversed().map((spec) => (
                        <option key={spec._id} value={spec.slug}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 fill-current ${
                              star <= formData.rating
                                ? "text-primary"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Your Experience
                    </label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Describe your care journey and recovery..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full font-semibold mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      "Submit Story"
                    )}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search testimonials by keyword or patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 text-sm bg-background"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Container */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <select
                value={selectedCare}
                onChange={(e) => setSelectedCare(e.target.value)}
                className="w-full sm:w-48 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Care</option>
                {specialties.toReversed().map((spec) => (
                  <option key={spec._id} value={spec.slug}>
                    {spec.name} ({getCategoryCount(spec.slug)})
                  </option>
                ))}
              </select>

              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
                className="w-full sm:w-40 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground gap-1 px-2 shrink-0 w-full sm:w-auto"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Feed Header & Active Count */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Patient Feedback ({filteredStories.length})
          </h2>
          {hasActiveFilters && (
            <span className="text-xs text-muted-foreground">
              Showing matching results
            </span>
          )}
        </div>

        {/* Testimonials List Grid */}
        {testimonialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-44 rounded-xl bg-muted/40 animate-pulse border border-border/50"
              />
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStories.map((story) => (
              <TestimonialCard key={story._id} testimonial={story} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed rounded-xl border-border/70 space-y-3 bg-card/30">
            <MessageSquareOff className="h-10 w-10 text-muted-foreground/60 mx-auto" />
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                No testimonials match your filters
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching for another keyword, clearing your search, or
                selecting a different specialty.
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-2 text-xs"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
