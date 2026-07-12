"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Search, Eye, Trash2, ChevronDown, X } from "lucide-react";
import { useToast } from "@/app/components/GlobalToast";
import { contactService, ContactData } from "@/services/contact.service";
import { SkeletonTable } from "../_components/Skeleton";

interface InquiriesViewProps {
  onBack: () => void;
}

// Transform backend contact to UI format
function transformContact(contact: any) {
  const name = contact.fullName || "Unknown";
  const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "UN";
  
  return {
    id: contact._id,
    name,
    email: contact.email || "—",
    initials,
    bg: "bg-[#DF4C77]",
    subject: contact.subject || "No Subject",
    message: contact.message || "No Message",
    date: new Date(contact.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    status: contact.isRead ? "Read" : "New",
  };
}

export default function InquiriesView({ onBack }: InquiriesViewProps) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const { showToast } = useToast();

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await contactService.getContacts();
      const rawData = response.data?.contacts || response.data || response;
      const dataArray = Array.isArray(rawData) ? rawData : [];
      setInquiries(dataArray.map(transformContact));
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
      showToast("Error", "Could not load inquiries", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleDelete = async (id: string) => {
    try {
      await contactService.deleteContact(id);
      setInquiries(inquiries.filter((inq) => inq.id !== id));
      showToast("Success", "Inquiry deleted successfully", "success");
    } catch (error) {
      showToast("Error", "Failed to delete inquiry", "error");
    }
  };

  const handleRead = async (inqToRead: any) => {
    setSelectedInquiry(inqToRead);
    if (inqToRead.status === "New") {
      try {
        await contactService.markAsRead(inqToRead.id);
        setInquiries(
          inquiries.map((inq) =>
            inq.id === inqToRead.id ? { ...inq, status: "Read" } : inq
          )
        );
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-[#FDF1F4] text-[#E85D8B]";
      case "Read":
        return "bg-[#E8F3FF] text-[#4C9BFF]";
      case "Replied":
        return "bg-[#EAF5F0] text-[#4CBF84]";
      case "Archived":
        return "bg-[#F3F4F6] text-[#6B7280]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.email.toLowerCase().includes(search.toLowerCase()) ||
      inq.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full rounded-[28px] bg-[#FCF6F4] p-4 md:p-6 text-[#2A1F2F]">
      <div className="mx-auto w-full max-w-[1240px] space-y-6">
        <div>
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-[#8F8694] transition hover:text-[#E85D8B]"
          >
            <ArrowLeft size={14} />
            Back to Customers
          </button>
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#2B212E]">
            Customer Inquiries
          </h1>
          <p className="mt-1 text-[13px] text-[#9C93A1]">
            Messages sent by customers through the contact and product inquiry forms.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[20px] border border-[#F0E6E9] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]">
            <p className="text-[11px] font-medium text-[#A79DA8]">Total Inquiries</p>
            <p className="mt-2 text-[38px] font-bold leading-none text-[#E85D8B]">{inquiries.length}</p>
            <p className="mt-2 text-[11px] font-medium text-[#4CBF84]">↗ All time</p>
          </div>
          <div className="rounded-[20px] border border-[#F0E6E9] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]">
            <p className="text-[11px] font-medium text-[#A79DA8]">New</p>
            <p className="mt-2 text-[38px] font-bold leading-none text-[#E85D8B]">{inquiries.filter(i => i.status === 'New').length}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E85D8B]"></span>
              <p className="text-[11px] font-medium text-[#A79DA8]">Awaiting first read</p>
            </div>
          </div>
          <div className="rounded-[20px] border border-[#F0E6E9] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]">
            <p className="text-[11px] font-medium text-[#A79DA8]">Read</p>
            <p className="mt-2 text-[38px] font-bold leading-none text-[#E85D8B]">{inquiries.filter(i => i.status === 'Read').length}</p>
            <p className="mt-2 text-[11px] font-medium text-[#A79DA8]">Not yet replied</p>
          </div>
          <div className="rounded-[20px] border border-[#F0E6E9] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]">
            <p className="text-[11px] font-medium text-[#A79DA8]">Replied</p>
            <p className="mt-2 text-[38px] font-bold leading-none text-[#E85D8B]">{inquiries.filter(i => i.status === 'Replied').length}</p>
            <p className="mt-2 text-[11px] font-medium text-[#A79DA8]">—</p>
          </div>
          <div className="rounded-[20px] border border-[#F0E6E9] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(43,33,46,0.04)]">
            <p className="text-[11px] font-medium text-[#A79DA8]">Archived</p>
            <p className="mt-2 text-[38px] font-bold leading-none text-[#E85D8B]">{inquiries.filter(i => i.status === 'Archived').length}</p>
            <p className="mt-2 text-[11px] font-medium text-[#A79DA8]">—</p>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="overflow-hidden rounded-[24px] border border-[#F1E6EA] bg-white shadow-[0_10px_30px_rgba(43,33,46,0.05)]">
          <div className="border-b border-[#F4E9ED] p-4 md:p-5">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#B5ADB8]"
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-[42px] w-full rounded-[12px] border border-[#EDE2E7] bg-white pl-9 pr-4 text-[13px] text-[#2A1F2F] placeholder:text-[#B5ADB8] outline-none transition focus:border-[#E85D8B]"
                />
              </div>

              <div className="flex gap-3">
                <div className="relative min-w-[140px]">
                  <select className="h-[42px] w-full appearance-none rounded-[12px] border border-[#EDE2E7] bg-white pl-4 pr-9 text-[13px] text-[#2A1F2F] outline-none transition focus:border-[#E85D8B]">
                    <option value="All Status">All Status</option>
                    <option value="New">New</option>
                    <option value="Read">Read</option>
                    <option value="Replied">Replied</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B5ADB8]"
                  />
                </div>

                <div className="relative min-w-[140px]">
                  <select className="h-[42px] w-full appearance-none rounded-[12px] border border-[#EDE2E7] bg-white pl-4 pr-9 text-[13px] text-[#2A1F2F] outline-none transition focus:border-[#E85D8B]">
                    <option value="All Dates">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B5ADB8]"
                  />
                </div>

                <div className="relative min-w-[140px]">
                  <select className="h-[42px] w-full appearance-none rounded-[12px] border border-[#EDE2E7] bg-white pl-4 pr-9 text-[13px] text-[#2A1F2F] outline-none transition focus:border-[#E85D8B]">
                    <option value="Newest">Sort: Newest</option>
                    <option value="Oldest">Sort: Oldest</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B5ADB8]"
                  />
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-4 md:p-6">
              <SkeletonTable rows={8} cols={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
              <thead className="bg-[#FDF1F4]">
                <tr className="text-left text-[10px] uppercase tracking-[0.08em] text-[#8D8491]">
                  <th className="px-6 py-4 font-semibold">Inquiry ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Subject & Message</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EDF0]">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-[14px] text-[#9C93A1]"
                    >
                      No inquiries found
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      className={`transition hover:bg-[#FFFDFE] relative`}
                    >
                      <td className="relative px-6 py-4 text-[13px] font-medium text-[#6F6573]">
                        {inq.status === "New" && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#E85D8B]"></div>
                        )}
                        {inq.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${inq.bg} text-[11px] font-bold text-white`}>
                            {inq.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-[#2A1F2F]">
                              {inq.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-[#AAA0AB]">
                              {inq.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[250px]">
                        <p className="text-[13px] font-semibold text-[#2A1F2F] truncate max-w-[280px]">
                          {inq.subject}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#8F8694] truncate max-w-[280px]">
                          {inq.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-[#6F6573]">
                        {inq.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusColor(
                            inq.status
                          )}`}
                        >
                          {inq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleRead(inq)}
                            className="rounded-lg p-2 text-[#9C93A1] transition hover:bg-[#F8F3F6] hover:text-[#2A1F2F]"
                            title="View/Read Inquiry"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(inq.id)}
                            className="rounded-lg p-2 text-[#9C93A1] transition hover:bg-red-50 hover:text-red-500"
                            title="Delete Inquiry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="relative w-full max-w-2xl rounded-[24px] bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#F4E9ED] text-[#8F8694] transition hover:bg-[#E85D8B] hover:text-white"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-[20px] font-bold text-[#2A1F2F] mb-6">Inquiry Details</h2>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#F4E9ED]">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${selectedInquiry.bg} text-[14px] font-bold text-white`}>
                {selectedInquiry.initials}
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#2A1F2F]">{selectedInquiry.name}</p>
                <p className="text-[13px] text-[#6F6573]">{selectedInquiry.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[12px] font-medium text-[#A79DA8]">Received On</p>
                <p className="text-[14px] font-semibold text-[#2A1F2F]">{selectedInquiry.date}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#A79DA8] mb-1">Subject</p>
                <p className="text-[15px] font-semibold text-[#2A1F2F]">{selectedInquiry.subject}</p>
              </div>
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#A79DA8] mb-2">Message</p>
                <div className="rounded-[16px] bg-[#FCF6F4] p-5 text-[14px] leading-relaxed text-[#4A3F52] whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="rounded-[12px] bg-[#F4E9ED] px-6 py-2.5 text-[13px] font-semibold text-[#2A1F2F] transition hover:bg-[#EAE0E4]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
