"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, Upload } from "lucide-react";
import { productService } from "@/services/product.service";

export interface EditableProduct {
    _id: string;
    productId: string;
    productName: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    category: string;
    stock: number;
    material?: string;
    color?: string;
    size?: string;
    isActive: boolean;
    trendy: boolean;
    bestSeller: boolean;
    hashtags?: string[];
    story?: string;
    images?: { id: string; url: string }[];
}

interface EditProductModalProps {
    product: EditableProduct | null;
    categories: string[];
    onClose: () => void;
    onSaved: (updated: any) => void;
}

export default function EditProductModal({ product, categories, onClose, onSaved }: EditProductModalProps) {
    const [form, setForm] = useState({
        productName: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        stock: "",
        material: "",
        color: "",
        size: "",
        isActive: true,
        trendy: false,
        bestSeller: false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [existingImages, setExistingImages] = useState<{ id: string; url: string }[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setForm({
                productName: product.productName || "",
                description: product.description || "",
                price: String(product.price ?? ""),
                originalPrice: product.originalPrice ? String(product.originalPrice) : "",
                category: product.category || "",
                stock: String(product.stock ?? ""),
                material: product.material || "",
                color: product.color || "",
                size: product.size || "",
                isActive: product.isActive ?? true,
                trendy: product.trendy ?? false,
                bestSeller: product.bestSeller ?? false,
            });
            setExistingImages(product.images || []);
            setNewFiles([]);
        }
    }, [product]);

    if (!product) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        if (!form.productName.trim() || !form.price || !form.category) {
            setError("Name, price, and category are required.");
            return;
        }
        setError("");
        setIsSaving(true);
        try {
            const payload: Record<string, any> = {
                productName: form.productName.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                category: form.category,
                stock: Number(form.stock) || 0,
                material: form.material.trim(),
                color: form.color.trim(),
                size: form.size.trim(),
                isActive: form.isActive,
                trendy: form.trendy,
                bestSeller: form.bestSeller,
            };
            if (form.originalPrice) {
                payload.originalPrice = Number(form.originalPrice);
            }

            const updated = await productService.update(product.productId, payload);

            // Upload new images if any
            if (newFiles.length > 0) {
                const imageFormData = new FormData();
                newFiles.forEach((file) => imageFormData.append("images", file));
                await productService.addImages(product.productId, imageFormData);
            }

            onSaved(updated?.data ?? updated);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Failed to update product";
            setError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        try {
            await productService.deleteImage(product!.productId, imageId);
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to delete image");
        }
    };

    const handleNewFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const maxNew = 5 - existingImages.length;
            setNewFiles((prev) => [...prev, ...files].slice(0, maxNew));
        }
        if (e.target) e.target.value = "";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                        <input
                            name="productName"
                            value={form.productName}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all resize-none"
                        />
                    </div>

                    {/* Price & Original Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price *</label>
                            <input
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Original Price</label>
                            <input
                                name="originalPrice"
                                type="number"
                                value={form.originalPrice}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                        </div>
                    </div>

                    {/* Category & Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category *</label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stock</label>
                            <input
                                name="stock"
                                type="number"
                                value={form.stock}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                        </div>
                    </div>

                    {/* Material */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Material</label>
                        <input
                            name="material"
                            value={form.material}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                        />
                    </div>

                    {/* Color & Size */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Colors</label>
                            <input
                                name="color"
                                value={form.color}
                                onChange={handleChange}
                                placeholder="e.g., rose,gold,silver"
                                className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Comma-separated color names</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sizes</label>
                            <input
                                name="size"
                                value={form.size}
                                onChange={handleChange}
                                placeholder="e.g., S,M,L,XL"
                                className="w-full px-4 py-2.5 bg-[#FDF2F5] border border-pink-200 rounded-xl text-sm focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Comma-separated sizes</p>
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Images</label>
                        <div className="flex flex-wrap gap-2">
                            {existingImages.map((img) => (
                                <div key={img.id} className="w-16 h-16 relative rounded-lg overflow-hidden border border-pink-200 group">
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteImage(img.id)}
                                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={8} strokeWidth={3} />
                                    </button>
                                </div>
                            ))}
                            {newFiles.map((file, idx) => (
                                <div key={`new-${idx}`} className="w-16 h-16 relative rounded-lg overflow-hidden border border-green-200 group">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={8} strokeWidth={3} />
                                    </button>
                                </div>
                            ))}
                            {(existingImages.length + newFiles.length) < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center text-pink-400 hover:text-[#E91E63] hover:border-[#E91E63] transition-all"
                                >
                                    <Upload size={16} />
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleNewFiles}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">{existingImages.length + newFiles.length}/5 images</p>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-[#E91E63] w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="trendy" checked={form.trendy} onChange={handleChange} className="accent-[#E91E63] w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700">Trendy</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="bestSeller" checked={form.bestSeller} onChange={handleChange} className="accent-[#E91E63] w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700">Best Seller</span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#E91E63] rounded-xl hover:bg-[#C2185B] transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
