// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import { toast } from "sonner";
// import { Search, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useApp } from "@/store/appStore";
// import { getProducts, Product } from "@/services/productService";
// import {
//   getSpecialities,
//   SpecialitiesType,
//   SpecialtySlug,
// } from "@/services/specialitiesService";

// export const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

// export default function Shop() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Grab cart state and action handlers from store
//   const { cart, addToCart, updateQuantity, removeFromCart } = useApp();

//   // Read query params directly from URL with safe fallbacks
//   const selectedCategory =
//     (searchParams.get("category") as SpecialtySlug | "all") || "all";
//   const urlSearchQuery = searchParams.get("search") || "";
//   const currentPage = Math.max(
//     1,
//     parseInt(searchParams.get("page") || "1", 10)
//   );
//   const currentLimit = Math.max(
//     1,
//     parseInt(searchParams.get("limit") || "12", 10)
//   );

//   // Local component states
//   const [products, setProducts] = useState<Product[]>([]);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   const [totalProducts, setTotalProducts] = useState<number>(0);
//   const [specialties, setSpecialties] = useState<
//     SpecialitiesType[] | undefined
//   >([]);
//   const [specialtiesLoading, setSpecialtiesLoading] = useState<boolean>(true);
//   const [productsLoading, setProductsLoading] = useState<boolean>(true);
//   const [searchInput, setSearchInput] = useState(urlSearchQuery);

//   // Helper to update one or multiple URL query parameters at once
//   const updateQueryParams = useCallback(
//     (updates: Record<string, string | number | null | undefined>) => {
//       const params = new URLSearchParams(searchParams.toString());

//       Object.entries(updates).forEach(([key, value]) => {
//         if (
//           value !== undefined &&
//           value !== null &&
//           value !== "" &&
//           value !== "all"
//         ) {
//           params.set(key, String(value));
//         } else {
//           params.delete(key);
//         }
//       });

//       return params.toString();
//     },
//     [searchParams]
//   );

//   // Update category and reset page back to 1
//   const handleCategoryChange = (slug: string) => {
//     const queryString = updateQueryParams({ category: slug, page: 1 });
//     router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
//       scroll: false,
//     });
//   };

//   // Update page param in URL & smooth scroll to top
//   const handlePageChange = (newPage: number) => {
//     if (newPage < 1 || newPage > totalPages) return;
//     const queryString = updateQueryParams({ page: newPage });
//     router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
//       scroll: true,
//     });
//   };

//   // Debounce search input and update search param in URL (resets page to 1)
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (searchInput !== urlSearchQuery) {
//         const queryString = updateQueryParams({
//           search: searchInput.trim(),
//           page: 1,
//         });
//         router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
//           scroll: false,
//         });
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [searchInput, urlSearchQuery, updateQueryParams, pathname, router]);

//   // Keep search input box in sync if URL parameter is updated externally
//   useEffect(() => {
//     const searchInput = ()=>{
//       setSearchInput(urlSearchQuery);
//     }
//     searchInput();
//   }, [urlSearchQuery]);

//   // Fetch Specialties for category filter buttons
//   useEffect(() => {
//     const fetchSpecialties = async () => {
//       try {
//         setSpecialtiesLoading(true);
//         const res = await getSpecialities();
//         setSpecialties(res?.specialities || undefined);
//       } catch (error) {
//         console.error("Failed to fetch specialties data", error);
//       } finally {
//         setSpecialtiesLoading(false);
//       }
//     };

//     fetchSpecialties();
//   }, []);

//   // Fetch products strictly using backend pagination and filter query params
//   useEffect(() => {
//     let isMounted = true;

//     const fetchProducts = async () => {
//       try {
//         setProductsLoading(true);

//         const filterPayload: {
//           category?: string;
//           search?: string;
//           page: number;
//           limit: number;
//         } = {
//           page: currentPage,
//           limit: currentLimit,
//         };

//         if (selectedCategory !== "all") {
//           filterPayload.category = selectedCategory;
//         }

//         if (urlSearchQuery.trim()) {
//           filterPayload.search = urlSearchQuery.trim();
//         }

//         const res = await getProducts(filterPayload);

//         if (isMounted) {
//           setProducts(res?.products || []);

//           // Safely extract backend pagination metadata without syntax collisions
//           const total = res?.totalProducts ?? res?.total ?? res?.count ?? 0;
//           const computedPages = Math.ceil(total / currentLimit) || 1;
//           const pages = res?.totalPages ?? computedPages;

//           setTotalProducts(total);
//           setTotalPages(Math.max(1, pages));
//         }
//       } catch (error) {
//         console.error("Failed to fetch products data", error);
//         toast.error("Could not load products. Please try again.");
//       } finally {
//         if (isMounted) {
//           setProductsLoading(false);
//         }
//       }
//     };

//     fetchProducts();

//     return () => {
//       isMounted = false;
//     };
//   }, [selectedCategory, urlSearchQuery, currentPage, currentLimit]);

//   return (
//     <div className="mx-auto max-w-7xl px-4 py-14">
//       <div className="text-xs font-medium uppercase tracking-widest text-primary">
//         Herbal Pharmacy
//       </div>
//       <h1 className="mt-2 font-display text-4xl font-semibold">
//         Remedies from our garden
//       </h1>
//       <p className="mt-2 max-w-2xl text-muted-foreground">
//         Freshly prepared herbal formulas, curated by our practitioners.
//       </p>

//       {/* Search Bar & Category Filter Controls */}
//       <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         {/* Search Input */}
//         <div className="relative w-full max-w-md">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             type="text"
//             placeholder="Search remedies, symptoms, usage..."
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             className="pl-9"
//           />
//         </div>

//         {/* Category Filter Pills (URL Params Driven) */}
//         <div className="flex flex-wrap gap-2">
//           <button
//             onClick={() => handleCategoryChange("all")}
//             className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
//               selectedCategory === "all"
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-secondary hover:bg-secondary/80"
//             }`}
//           >
//             All
//           </button>
//           {specialtiesLoading
//             ? Array.from({ length: 4 }).map((_, idx) => (
//                 <Skeleton key={idx} className="h-8 w-24 rounded-full" />
//               ))
//             : [...(specialties || [])].reverse().map((s) => (
//                 <button
//                   key={s.slug}
//                   onClick={() => handleCategoryChange(s.slug)}
//                   className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
//                     selectedCategory === s.slug
//                       ? "bg-primary text-primary-foreground"
//                       : "bg-secondary hover:bg-secondary/80"
//                   }`}
//                 >
//                   {s.name}
//                 </button>
//               ))}
//         </div>
//       </div>

//       {/* Product Display Grid */}
//       <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//         {productsLoading ? (
//           /* Skeleton Loader */
//           Array.from({ length: currentLimit }).map((_, idx) => (
//             <Card key={idx} className="flex flex-col overflow-hidden">
//               <Skeleton className="h-40 w-full" />
//               <CardContent className="flex flex-1 flex-col p-5 space-y-3">
//                 <Skeleton className="h-3 w-1/3" />
//                 <Skeleton className="h-5 w-3/4" />
//                 <Skeleton className="h-10 w-full" />
//                 <div className="mt-auto flex items-center justify-between pt-4">
//                   <Skeleton className="h-6 w-16" />
//                   <Skeleton className="h-9 w-16 rounded-md" />
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : products.length === 0 ? (
//           /* Empty State */
//           <div className="col-span-full py-16 text-center text-muted-foreground">
//             No herbal remedies match your search or filter criteria.
//           </div>
//         ) : (
//           /* Product Cards */
//           products.map((p) => {
//             const productId = p._id || (p as any).id;
//             const cartItem = cart.find(
//               (item) => item._id === productId
//             );
//             const inCartCount = cartItem ? cartItem.quantity : 0;

//             return (
//               <Card
//                 key={productId}
//                 className="flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-soft"
//               >
//                 <div className="relative h-40 w-full grid place-items-center bg-linear-to-br from-accent to-sage text-6xl overflow-hidden">
//                   {p.image &&
//                   (p.image.startsWith("http") || p.image.startsWith("/")) ? (
//                     <Image
//                       fill
//                       src={p.image}
//                       alt={p.name}
//                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
//                       className="object-cover"
//                     />
//                   ) : (
//                     (p as any).emoji || "🌿"
//                   )}
//                 </div>
//                 <CardContent className="flex flex-1 flex-col p-5">
//                   <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
//                     {specialties?.find((s) => s.slug === p.category)?.name ||
//                       p.category}
//                   </div>
//                   <h3 className="mt-1 font-display text-lg font-semibold">
//                     {p.name}
//                   </h3>
//                   <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
//                     {p.description}
//                   </p>
//                   {p.usage && (
//                     <p className="mt-2 text-xs text-muted-foreground">
//                       <b>Use:</b> {p.usage}
//                     </p>
//                   )}
//                   <div className="mt-auto flex items-center justify-between pt-4">
//                     <div className="font-display text-lg font-semibold text-primary">
//                       {formatNaira(p.price)}
//                     </div>

//                     {/* Interactive Add / Plus / Minus Control */}
//                     {p.stock === 0 ? (
//                       <Button size="sm" disabled variant="outline">
//                         Out of stock
//                       </Button>
//                     ) : inCartCount > 0 ? (
//                       <div className="flex items-center gap-1.5 rounded-lg border bg-secondary/50 p-1">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-7 w-7 rounded-md hover:bg-background"
//                           onClick={() => {
//                             if (inCartCount === 1) {
//                               removeFromCart(productId);
//                               toast.info(`${p.name} removed from cart`);
//                             } else {
//                               updateQuantity(productId, inCartCount - 1);
//                             }
//                           }}
//                         >
//                           <Minus className="h-3.5 w-3.5" />
//                         </Button>
//                         <span className="w-6 text-center text-xs font-semibold select-none">
//                           {inCartCount}
//                         </span>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           className="h-7 w-7 rounded-md hover:bg-background"
//                           disabled={
//                             p.stock !== undefined && inCartCount >= p.stock
//                           }
//                           onClick={() => {
//                             updateQuantity(productId, inCartCount + 1);
//                           }}
//                         >
//                           <Plus className="h-3.5 w-3.5" />
//                         </Button>
//                       </div>
//                     ) : (
//                       <Button
//                         size="sm"
//                         onClick={() => {
//                           addToCart({
//                             ...p,
//                             _id: productId,
//                             quantity: 1,
//                           });
//                           toast.success(`${p.name} added to cart`);
//                         }}
//                       >
//                         Add
//                       </Button>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })
//         )}
//       </div>

//       {/* Pagination Controls Footer */}
//       {!productsLoading && totalPages > 1 && (
//         <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
//           <div className="text-sm text-muted-foreground">
//             Showing Page{" "}
//             <span className="font-medium text-foreground">{currentPage}</span>{" "}
//             of <span className="font-medium text-foreground">{totalPages}</span>
//             {totalProducts > 0 && ` (${totalProducts} total items)`}
//           </div>

//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage <= 1}
//             >
//               <ChevronLeft className="mr-1 h-4 w-4" /> Previous
//             </Button>

//             <div className="flex items-center gap-1">
//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter(
//                   (page) =>
//                     page === 1 ||
//                     page === totalPages ||
//                     Math.abs(page - currentPage) <= 1
//                 )
//                 .map((page, index, array) => {
//                   const showEllipsis =
//                     index > 0 && page - array[index - 1] > 1;
//                   return (
//                     <div key={page} className="flex items-center gap-1">
//                       {showEllipsis && (
//                         <span className="px-2 text-sm text-muted-foreground">
//                           ...
//                         </span>
//                       )}
//                       <Button
//                         variant={currentPage === page ? "default" : "outline"}
//                         size="sm"
//                         className="h-8 w-8 p-0"
//                         onClick={() => handlePageChange(page)}
//                       >
//                         {page}
//                       </Button>
//                     </div>
//                   );
//                 })}
//             </div>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage >= totalPages}
//             >
//               Next <ChevronRight className="ml-1 h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/store/appStore";
import { getProducts, Product } from "@/services/productService";
import {
  getSpecialities,
  SpecialitiesType,
  SpecialtySlug,
} from "@/services/specialitiesService";

export const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

export default function Shop() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Grab cart state and action handlers from store
  const { cart, addToCart } = useApp();

  // Read query params directly from URL with safe fallbacks
  const selectedCategory =
    (searchParams.get("category") as SpecialtySlug | "all") || "all";
  const urlSearchQuery = searchParams.get("search") || "";
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get("page") || "1", 10)
  );
  const currentLimit = Math.max(
    1,
    parseInt(searchParams.get("limit") || "12", 10)
  );

  // Local component states
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [specialties, setSpecialties] = useState<
    SpecialitiesType[] | undefined
  >([]);
  const [specialtiesLoading, setSpecialtiesLoading] = useState<boolean>(true);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState(urlSearchQuery);

  // Helper to update one or multiple URL query parameters at once
  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          value !== "all"
        ) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      return params.toString();
    },
    [searchParams]
  );

  // Update category and reset page back to 1
  const handleCategoryChange = (slug: string) => {
    const queryString = updateQueryParams({ category: slug, page: 1 });
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Update page param in URL & smooth scroll to top
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const queryString = updateQueryParams({ page: newPage });
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: true,
    });
  };

  // Debounce search input and update search param in URL (resets page to 1)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlSearchQuery) {
        const queryString = updateQueryParams({
          search: searchInput.trim(),
          page: 1,
        });
        router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
          scroll: false,
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, urlSearchQuery, updateQueryParams, pathname, router]);

  // Keep search input box in sync if URL parameter is updated externally
  useEffect(() => {
    const searchInput = ()=>{
      setSearchInput(urlSearchQuery);
    }
    searchInput();
  }, [urlSearchQuery]);

  // Fetch Specialties for category filter buttons
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setSpecialtiesLoading(true);
        const res = await getSpecialities();
        setSpecialties(res?.specialities || undefined);
      } catch (error) {
        console.error("Failed to fetch specialties data", error);
      } finally {
        setSpecialtiesLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  // Fetch products strictly using backend pagination and filter query params
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const filterPayload: {
          category?: string;
          search?: string;
          page: number;
          limit: number;
        } = {
          page: currentPage,
          limit: currentLimit,
        };

        if (selectedCategory !== "all") {
          filterPayload.category = selectedCategory;
        }

        if (urlSearchQuery.trim()) {
          filterPayload.search = urlSearchQuery.trim();
        }

        const res = await getProducts(filterPayload);

        if (isMounted) {
          setProducts(res?.products || []);

          // Safely extract backend pagination metadata
          const total = res?.totalProducts ?? res?.total ?? res?.count ?? 0;
          const computedPages = Math.ceil(total / currentLimit) || 1;
          const pages = res?.totalPages ?? computedPages;

          setTotalProducts(total);
          setTotalPages(Math.max(1, pages));
        }
      } catch (error) {
        console.error("Failed to fetch products data", error);
        toast.error("Could not load products. Please try again.");
      } finally {
        if (isMounted) {
          setProductsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, urlSearchQuery, currentPage, currentLimit]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <div className="text-xs font-medium uppercase tracking-widest text-primary">
        Herbal Pharmacy
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold">
        Remedies from our garden
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Freshly prepared herbal formulas, curated by our practitioners.
      </p>

      {/* Search Bar & Category Filter Controls */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search remedies, symptoms, usage..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter Pills (URL Params Driven) */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          {specialtiesLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-8 w-24 rounded-full" />
              ))
            : [...(specialties || [])].reverse().map((s) => (
                <button
                  key={s.slug}
                  onClick={() => handleCategoryChange(s.slug)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                    selectedCategory === s.slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {s.name}
                </button>
              ))}
        </div>
      </div>

      {/* Product Display Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productsLoading ? (
          /* Skeleton Loader */
          Array.from({ length: currentLimit }).map((_, idx) => (
            <Card key={idx} className="flex flex-col overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="flex flex-1 flex-col p-5 space-y-3">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <div className="mt-auto flex items-center justify-between pt-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-16 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="col-span-full py-16 text-center text-muted-foreground">
            No herbal remedies match your search or filter criteria.
          </div>
        ) : (
          /* Product Cards */
          products.map((p) => {
            // 1. Force ID string conversion
            const productId = String(p._id || (p as any).id || "");

            // 2. Safely locate item in cart matching string IDs
            const cartItem = cart.find((item) => {
              const itemId = String(item._id || "");
              return itemId === productId;
            });

            const inCartCount = cartItem ? cartItem.quantity : 0;

            return (
              <Card
                key={productId}
                className="flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="relative h-40 w-full grid place-items-center bg-linear-to-br from-accent to-sage text-6xl overflow-hidden">
                  {p.image &&
                  (p.image.startsWith("http") || p.image.startsWith("/")) ? (
                    <Image
                      fill
                      src={p.image}
                      alt={p.name}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    (p as any).emoji || "🌿"
                  )}
                </div>
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {specialties?.find((s) => s.slug === p.category)?.name ||
                      p.category}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold">
                    {p.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  {p.usage && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <b>Use:</b> {p.usage}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="font-display text-lg font-semibold text-primary">
                      {formatNaira(p.price)}
                    </div>

                    {/* Add Button Logic */}
                    {p.stock === 0 ? (
                      <Button size="sm" disabled variant="outline">
                        Out of stock
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (inCartCount > 0) {
                            toast.info(`${p.name} is already in the cart`);
                            return;
                          }

                          addToCart({
                            ...p,
                            _id: productId,
                            quantity: 1,
                          });
                          toast.success(`${p.name} added to cart`);
                        }}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls Footer */}
      {!productsLoading && totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            Showing Page{" "}
            <span className="font-medium text-foreground">{currentPage}</span>{" "}
            of <span className="font-medium text-foreground">{totalPages}</span>
            {totalProducts > 0 && ` (${totalProducts} total items)`}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => {
                  const showEllipsis =
                    index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="px-2 text-sm text-muted-foreground">
                          ...
                        </span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}