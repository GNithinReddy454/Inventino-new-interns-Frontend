import { useState, useEffect } from "react";
import { Star, Search, MoreVertical, Trash2 } from "lucide-react";
import { SkeletonTable } from "./Skeleton";
import Pagination from "./Pagination";
import { getAdminReviews, AdminReview } from "@/services/admin.service";

export default function ReviewsView() {
    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("All Ratings");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [reviews, setReviews] = useState<AdminReview[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            try {
                const data = await getAdminReviews();
                setReviews(data ?? []);
            } catch (err) {
                console.error("Failed to fetch admin reviews:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

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
                                                    <div className="absolute right-0 md:right-8 top-10 md:top-8 z-20 bg-white border border-border rounded-xl shadow-xl py-2 w-40 text-sm">
                                                        <button
                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-500 font-medium flex items-center gap-2"
                                                            onClick={() => {
                                                                setReviews(prev => prev.filter(rev => rev._id !== r._id));
                                                                setOpenMenu(null);
                                                            }}
                                                        >
                                                            <Trash2 size={14} /> Remove Review
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
