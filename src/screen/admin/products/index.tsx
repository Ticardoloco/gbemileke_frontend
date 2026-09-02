/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "@/services/productService";
import { getSpecialities, SpecialitiesType, SpecialtySlug } from "@/services/specialitiesService";

export default function AdminManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Search & Pagination States
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 8;

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Input States
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SpecialtySlug>("anti-natal");
  const [specialties, setSpecialties] = useState<SpecialitiesType[] | undefined>([])
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [imagePreview, setImagePreview] = useState<string>(""); // Base64 or existing Cloudinary URL for UI display
  const [imageFile, setImageFile] = useState<File | null>(null); // Actual binary file for Multer upload
  const [description, setDescription] = useState("");
  const [usage, setUsage] = useState("");

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchSpecialties = async ()=>{
    try {
      const res = await getSpecialities();
      setSpecialties(res?.specialities || undefined)
    } catch (error) {
      console.error("Failed to fetch Specialties", error);
    }
  }

  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        search: search || undefined,
        category: categoryFilter || undefined,
        page,
        limit,
      });
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to load products:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    const trigger = ()=>{
      fetchProductsList();
      fetchSpecialties()
    }
    trigger();
  }, [fetchProductsList]);

  // Handle File Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB.");
      return;
    }

    // Save actual File object for FormData submission
    setImageFile(file);

    // Generate preview URL for local UI preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Reset or pre-fill modal form
  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setCategory(product.category as SpecialtySlug);
      setPrice(product.price);
      setStock(product.stock);
      setImagePreview(product.image);
      setImageFile(null); // No new file selected yet during edit
      setDescription(product.description);
      setUsage(product.usage);
    } else {
      setEditingProduct(null);
      setName("");
      setCategory("anti-natal");
      setPrice("");
      setStock("");
      setImagePreview("");
      setImageFile(null);
      setDescription("");
      setUsage("");
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Submit Handler for Create / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || price === "" || stock === "" || !description || !usage) {
      toast.error("Please fill in all required text fields.");
      return;
    }

    // Validate image presence
    if (!editingProduct && !imageFile) {
      toast.error("Please select a product image file.");
      return;
    }

    // Build FormData to send multipart stream to Multer
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", String(price));
    formData.append("stock", String(stock));
    formData.append("description", description);
    formData.append("usage", usage);

    if (imageFile) {
      formData.append("image", imageFile); // Field name MUST match 'upload.single("image")' in Express
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formData);
        toast.success("Product created successfully!");
      }
      handleCloseForm();
      fetchProductsList();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      await deleteProduct(deletingProduct._id);
      toast.success("Product deleted successfully.");
      setDeletingProduct(null);
      fetchProductsList();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
          <p className="text-sm text-slate-500">
            View, add, update, and manage store product inventory.
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="w-full md:w-1/3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Specialty Categories</option>
            {specialties?.toReversed().map((spec) => (
              <option key={spec.slug} value={spec.slug}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Specialty Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading inventory products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400 line-clamp-1">
                          {item.description}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold capitalize">
                        {item.category?.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      ₦{item.price?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          item.stock > 5
                            ? "bg-emerald-100 text-emerald-800"
                            : item.stock > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenForm(item)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingProduct(item)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-medium text-xs rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-200"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={handleCloseForm}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Traditional Herbal Mixture"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Specialty Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SpecialtySlug)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    required
                  >
                    {specialties?.toReversed().map((spec) => (
                      <option key={spec.slug} value={spec.slug}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="e.g. 5000"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) =>
                      setStock(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="e.g. 25"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Image *
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 shrink-0">
                      No Image
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description and key benefits..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Usage Instructions *
                </label>
                <textarea
                  rows={2}
                  value={usage}
                  onChange={(e) => setUsage(e.target.value)}
                  placeholder="Dosage or usage directions..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Product</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">{deletingProduct.name}</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={submitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}