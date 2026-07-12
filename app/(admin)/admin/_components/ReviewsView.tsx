import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Search, MoreVertical, Trash2, Pencil, X, BarChart3, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { SkeletonTable } from "./Skeleton";
import Pagination from "./Pagination";
import {
    getAdminReviews,
    AdminReview,
    getReviewStatistics,
    ReviewStatistics,
    updateAdminReview,
    deleteAdminReview,
} from "@/services/admin.service";

// ─── Toast notification ──────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right ${
                type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
            }`}
        >
            {type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {message}
        </div>
    );
}

// ─── Edit Review Modal ───────────────────────────────────────────────────────
function EditReviewModal({
    review,
    onClose,
    onSave,
    isSaving,
}: {
    review: AdminReview;
    onClose: () => void;
    onSave: (id: string, rating: number, comment: string) => void;
    isSaving: boolean;
}) {
    const [rating, setRating] = useState(review.rating);
    const [comment, setComment] = useState(review.comment);
    const [hoverRating, setHoverRating] = useState(0);
    const backdropRef = useRef<HTMLDivElement>(null);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-pink-50/50">
                    <h3 className="text-lg font-bold text-foreground">Edit Review</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-pink-100 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Customer & Product info */}
                    <div className="space-y-1.5">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Customer</p>
                        <p className="text-sm font-medium text-foreground">{review.customerName}</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Product</p>
                        <p className="text-sm font-medium text-foreground">{review.productName}</p>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Rating</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="p-0.5 transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={24}
                                        className={
                                            star <= (hoverRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-200 fill-gray-200"
                                        }
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground self-center">
                                {hoverRating || rating} / 5
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Comment</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                            placeholder="Enter review comment..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-gray-50/50">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-5 py-2.5 text-sm font-medium text-muted-foreground bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(review._id, rating, comment)}
                        disabled={isSaving || !comment.trim()}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-[#E91E63] rounded-xl hover:bg-[#C2185B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
function DeleteConfirmModal({
    review,
    onClose,
    onConfirm,
    isDeleting,
}: {
    review: AdminReview;
    onClose: () => void;
    onConfirm: (id: string) => void;
    isDeleting: boolean;
}) {
    const backdropRef = useRef<HTMLDivElement>(null);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                <div className="px-6 py-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                        <Trash2 size={22} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Delete Review</h3>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete the review by{" "}
                        <span className="font-semibold text-foreground">{review.customerName}</span>?
                        This action cannot be undone.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-6 py-4 border-t border-border bg-gray-50/50">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-muted-foreground bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(review._id)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Statistics Card ─────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReviewsView() {
    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("All Ratings");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [stats, setStats] = useState<ReviewStatistics | null>(null);

    // Modal states
    const [editingReview, setEditingReview] = useState<AdminReview | null>(null);
    const [deletingReview, setDeletingReview] = useState<AdminReview | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [reviewsData, statsData] = await Promise.all([
                getAdminReviews(),
                getReviewStatistics(),
            ]);
            setReviews(reviewsData ?? []);
            setStats(statsData);
        } catch (err) {
            console.error("Failed to fetch admin reviews:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
            }
        };
        if (openMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenu]);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleEditSave = async (id: string, rating: number, comment: string) => {
        setIsSaving(true);
        try {
            const result = await updateAdminReview(id, { rating, comment });
            if (result !== null) {
                // Update local state immediately
                setReviews((prev) =>
                    prev.map((r) => (r._id === id ? { ...r, rating, comment } : r))
                );
                setEditingReview(null);
                setToast({ message: "Review updated successfully!", type: "success" });
                // Refresh stats since rating may have changed
                const newStats = await getReviewStatistics();
                setStats(newStats);
            } else {
                setToast({ message: "Failed to update review. Please try again.", type: "error" });
            }
        } catch {
            setToast({ message: "Failed to update review. Please try again.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            const result = await deleteAdminReview(id);
            if (result !== null) {
                setReviews((prev) => prev.filter((r) => r._id !== id));
                setDeletingReview(null);
                setToast({ message: "Review deleted successfully!", type: "success" });
                // Refresh stats
                const newStats = await getReviewStatistics();
                setStats(newStats);
            } else {
                setToast({ message: "Failed to delete review. Please try again.", type: "error" });
            }
        } catch {
            setToast({ message: "Failed to delete review. Please try again.", type: "error" });
        } finally {
            setIsDeleting(false);
        }
    };

    // ── Filtering & Pagination ───────────────────────────────────────────────

    const filtered = reviews.filter((r) => {
        const matchSearch =
            r.customerName.toLowerCase().includes(search.toLowerCase()) ||
            r.productName.toLowerCase().includes(search.toLowerCase()) ||
            r.comment.toLowerCase().includes(search.toLowerCase());

        let matchRating = true;
        if (ratingFilter !== "All Ratings") {
            const ratingNumber = parseInt(ratingFilter.split(" ")[0]);
            matchRating = r.rating === ratingNumber;
        }

        return matchSearch && matchRating;
    });

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const renderStars = (rating: number) => {
        return (
            <div className="flex text-yellow-400 gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={star <= rating ? "fill-yellow-400" : "text-gray-200 fill-gray-200"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 w-full">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Edit Modal */}
            {editingReview && (
                <EditReviewModal
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                    onSave={handleEditSave}
                    isSaving={isSaving}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingReview && (
                <DeleteConfirmModal
                    review={deletingReview}
                    onClose={() => setDeletingReview(null)}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                />
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Reviews Management
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        View and moderate customer product reviews
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Reviews"
                        value={stats.totalReviews}
                        icon={<BarChart3 size={20} className="text-blue-600" />}
                        color="bg-blue-50"
                    />
                    <StatCard
                        label="Average Rating"
                        value={stats.averageRating.toFixed(1)}
                        icon={<Star size={20} className="text-yellow-500 fill-yellow-500" />}
                        color="bg-yellow-50"
                    />
                    <StatCard
                        label="Active Reviews"
                        value={stats.activeReviews}
                        icon={<TrendingUp size={20} className="text-green-600" />}
                        color="bg-green-50"
                    />
                    <StatCard
                        label="Inactive Reviews"
                        value={stats.inactiveReviews}
                        icon={<XCircle size={20} className="text-red-500" />}
                        color="bg-red-50"
                    />
                </div>
            )}

            {/* Star Distribution */}
            {stats && stats.totalReviews > 0 && (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <h3 className="text-sm font-bold text-foreground mb-3">Rating Distribution</h3>
                    <div className="space-y-2">
                        {[
                            { label: "5 Stars", count: stats.fiveStar },
                            { label: "4 Stars", count: stats.fourStar },
                            { label: "3 Stars", count: stats.threeStar },
                            { label: "2 Stars", count: stats.twoStar },
                            { label: "1 Star", count: stats.oneStar },
                        ].map((item) => {
                            const percentage = stats.totalReviews > 0 ? (item.count / stats.totalReviews) * 100 : 0;
                            return (
                                <div key={item.label} className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-muted-foreground w-14">{item.label}</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-foreground w-8 text-right">{item.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search reviews by customer, product, or keyword..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                    />
                </div>
                <div className="w-full md:w-auto flex gap-3">
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:outline-none cursor-pointer min-w-[140px]"
                    >
                        <option>All Ratings</option>
                        <option>5 Stars</option>
                        <option>4 Stars</option>
                        <option>3 Stars</option>
                        <option>2 Stars</option>
                        <option>1 Stars</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-4">
                        <SkeletonTable rows={6} cols={6} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-pink-50/50 text-muted-foreground font-bold text-xs uppercase tracking-wider hidden md:table-header-group">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4 w-32">Rating</th>
                                    <th className="px-6 py-4 w-1/3">Comment</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center">
                                                <Star size={32} className="mb-3 text-muted-foreground opacity-30" />
                                                <p className="text-sm font-medium">No reviews found matching your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((r) => (
                                        <tr key={r._id} className="hover:bg-muted/20 transition-colors flex flex-col md:table-row p-4 md:p-0 border-b border-border md:border-b-0">
                                            <td className="px-0 md:px-6 py-2 md:py-4 font-bold text-foreground flex justify-between md:table-cell">
                                                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">Customer</span>
                                                {r.customerName}
                                            </td>
                                            <td className="px-0 md:px-6 py-2 md:py-4 text-muted-foreground flex justify-between md:table-cell">
                                                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">Product</span>
                                                {r.productName}
                                            </td>
                                            <td className="px-0 md:px-6 py-2 md:py-4 flex justify-between md:table-cell">
                                                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">Rating</span>
                                                {renderStars(r.rating)}
                                            </td>
                                            <td className="px-0 md:px-6 py-2 md:py-4 flex flex-col justify-start md:table-cell w-full relative">
                                                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold mb-1">Comment</span>
                                                <div className="truncate md:max-w-xs xl:max-w-md text-sm text-foreground whitespace-normal md:whitespace-nowrap" title={r.comment}>
                                                    &quot;{r.comment}&quot;
                                                </div>
                                            </td>
                                            <td className="px-0 md:px-6 py-2 md:py-4 text-muted-foreground text-xs font-medium flex justify-between md:table-cell mt-2 md:mt-0 pt-3 border-t md:border-t-0 border-border">
                                                <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">Date</span>
                                                {r.status ?? "—"}
                                            </td>
                                            <td className="px-0 md:px-6 py-2 md:py-4 text-right flex justify-end md:table-cell relative">
                                                <button
                                                    onClick={() => setOpenMenu(openMenu === r._id ? null : r._id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex"
                                                >
                                                    <span className="md:hidden font-bold text-xs mr-2">Actions</span>
                                                    <MoreVertical size={16} />
                                                </button>
                                                {openMenu === r._id && (
                                                    <div ref={menuRef} className="absolute right-0 md:right-8 top-10 md:top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-44 text-sm">
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-blue-600 font-medium flex items-center gap-2"
                                                            onClick={() => {
                                                                setEditingReview(r);
                                                                setOpenMenu(null);
                                                            }}
                                                        >
                                                            <Pencil size={14} /> Edit Review
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500 font-medium flex items-center gap-2"
                                                            onClick={() => {
                                                                setDeletingReview(r);
                                                                setOpenMenu(null);
                                                            }}
                                                        >
                                                            <Trash2 size={14} /> Delete Review
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            pageSize={pageSize}
                            onPageChange={(p) => { setCurrentPage(p); setOpenMenu(null); }}
                            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
