"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Star, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  Filter,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAllTestimonials,
  triggerApproveTestimonial,
  triggerFeatureTestimonial,
  deleteTestimonial,
  TestimonialResponse,
  TestimonialPayload,
} from "@/services/testimonialServices";
import { toast } from "sonner";

export default function AdminManageStoriesPage() {
  const [testimonials, setTestimonials] = useState<TestimonialResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [approvalFilter, setApprovalFilter] = useState<string>("all"); // "all" | "approved" | "pending"
  const [featuredFilter, setFeaturedFilter] = useState<string>("all"); // "all" | "featured" | "unfeatured"

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Action loading states by testimonial ID
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await getAllTestimonials();
      setTestimonials(res?.testimonials || []);
    } catch (error) {
      console.error("Failed to fetch admin testimonials", error);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const trigger = ()=>{
        fetchStories();
    }
    trigger();
  }, []);

  // Filtered stories logic
  const filteredStories = useMemo(() => {
    return testimonials.filter((story) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        story.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.care?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" && story.isApproved) ||
        (approvalFilter === "pending" && !story.isApproved);

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && story.isFeatured) ||
        (featuredFilter === "unfeatured" && !story.isFeatured);

      return matchesSearch && matchesApproval && matchesFeatured;
    });
  }, [testimonials, searchQuery, approvalFilter, featuredFilter]);

  // Reset pagination to page 1 when search or filters change
  useEffect(() => {
    const trigger =()=>{
        setCurrentPage(1);
    }
    trigger()
  }, [searchQuery, approvalFilter, featuredFilter, itemsPerPage]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStories.length / itemsPerPage) || 1;
  const paginatedStories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStories, currentPage, itemsPerPage]);

  // Toggle Approval status
  const handleToggleApprove = async (story: TestimonialResponse) => {
    try {
      setActionLoading((prev) => ({ ...prev, [story._id]: true }));
      const payload: TestimonialPayload = {
        name: story.name,
        care: story.care,
        message: story.message,
        rating: Number(story.rating),
        isApproved: !story.isApproved,
        isFeatured: story.isFeatured,
      };

      await triggerApproveTestimonial(story._id, payload);
      
      setTestimonials((prev) =>
        prev.map((item) =>
          item._id === story._id ? { ...item, isApproved: !story.isApproved } : item
        )
      );

      toast.success(
        story.isApproved ? "Story unapproved successfully" : "Story approved successfully"
      );
    } catch (error) {
      console.error("Failed to update approval status", error);
      toast.error("Failed to update approval status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [story._id]: false }));
    }
  };

  // Toggle Featured status
  const handleToggleFeature = async (story: TestimonialResponse) => {
    try {
      setActionLoading((prev) => ({ ...prev, [story._id]: true }));
      const payload: TestimonialPayload = {
        name: story.name,
        care: story.care,
        message: story.message,
        rating: Number(story.rating),
        isApproved: story.isApproved,
        isFeatured: !story.isFeatured,
      };

      await triggerFeatureTestimonial(story._id, payload);

      setTestimonials((prev) =>
        prev.map((item) =>
          item._id === story._id ? { ...item, isFeatured: !story.isFeatured } : item
        )
      );

      toast.success(
        story.isFeatured ? "Removed from featured stories" : "Added to featured stories"
      );
    } catch (error) {
      console.error("Failed to update featured status", error);
      toast.error("Failed to update featured status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [story._id]: false }));
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteTestimonial(deleteId);

      setTestimonials((prev) => prev.filter((item) => item._id !== deleteId));
      toast.success("Testimonial deleted successfully");
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete testimonial", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Manage Patient Stories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, approve, feature, and moderate patient feedback and testimonials.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStories}
          disabled={loading}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-card border rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, message, or care type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pr-1">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </div>

            {/* Approval Filter */}
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Approval</option>
            </select>

            {/* Featured Filter */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Featured</option>
              <option value="featured">Featured Only</option>
              <option value="unfeatured">Non-Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="border rounded-xl bg-card shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading testimonials...</p>
          </div>
        ) : filteredStories.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient & Care</TableHead>
                  <TableHead className="min-w-70">Story / Message</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStories.map((story) => {
                  const isItemLoading = actionLoading[story._id];
                  return (
                    <TableRow key={story._id}>
                      {/* Patient & Care */}
                      <TableCell className="align-top">
                        <div className="font-semibold text-foreground text-sm">{story.name}</div>
                        <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                          {story.care}
                        </Badge>
                      </TableCell>

                      {/* Full Message View */}
                      <TableCell className="align-top min-w-70">
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
                          &ldquo;{story.message}&rdquo;
                        </p>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className="align-top">
                        <div className="flex items-center gap-1 text-primary font-semibold text-xs">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span>{story.rating}</span>
                        </div>
                      </TableCell>

                      {/* Approval Badge */}
                      <TableCell className="align-top">
                        {story.isApproved ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 text-[11px]">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-[11px]">
                            <XCircle className="h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </TableCell>

                      {/* Featured Badge */}
                      <TableCell className="align-top">
                        {story.isFeatured ? (
                          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1 text-[11px]">
                            <Sparkles className="h-3 w-3 fill-purple-600" /> Featured
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
                        {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : "—"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve/Unapprove Toggle */}
                          <Button
                            size="sm"
                            variant={story.isApproved ? "outline" : "default"}
                            disabled={isItemLoading}
                            onClick={() => handleToggleApprove(story)}
                            className="h-8 text-xs font-medium"
                          >
                            {isItemLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : story.isApproved ? (
                              "Unapprove"
                            ) : (
                              "Approve"
                            )}
                          </Button>

                          {/* Feature Toggle Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isItemLoading}
                            onClick={() => handleToggleFeature(story)}
                            className={`h-8 w-8 p-0 ${
                              story.isFeatured ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50" : "text-muted-foreground"
                            }`}
                            title={story.isFeatured ? "Remove from featured" : "Set as featured"}
                          >
                            <Sparkles className={`h-4 w-4 ${story.isFeatured ? "fill-current" : ""}`} />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(story._id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete testimonial"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t text-xs text-muted-foreground bg-muted/20">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="ml-2">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStories.length)} -{" "}
                  {Math.min(currentPage * itemsPerPage, filteredStories.length)} of {filteredStories.length} stories
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-foreground">No testimonials found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search criteria or clear your active filters.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}