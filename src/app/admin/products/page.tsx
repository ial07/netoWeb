"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product, ProductFormData } from "@/types";
import Image from "next/image";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  discount_percentage: null,
  stock: 0,
  category: "electronics",
  image_url: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=50");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discount_percentage: product.discount_percentage,
      stock: product.stock,
      category: product.category,
      image_url: product.image_url,
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.name),
        discount_percentage:
          form.discount_percentage === 0 ? null : form.discount_percentage,
      };

      let res: Response;

      if (editingProduct) {
        // Update via service — for admin we call a simulated endpoint
        res = await fetch(`/api/admin/products`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
      } else {
        res = await fetch(`/api/admin/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      setSuccess(
        editingProduct
          ? "Product updated successfully!"
          : "Product created successfully!",
      );
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`))
      return;

    try {
      const res = await fetch(`/api/admin/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      setSuccess(`"${product.name}" deleted successfully`);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleUpdateStock = async (product: Product, newStock: number) => {
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, stock: newStock }),
      });

      if (res.ok) {
        fetchProducts();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          Product Management
        </h2>
        <button
          onClick={handleNew}
          className="h-10 px-5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Product
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {editingProduct ? "Edit Product" : "New Product"}
          </h3>

          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }
                required
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border/50 text-sm text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Description *
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseFloat(e.target.value) || 0 })
                }
                required
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={form.discount_percentage ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount_percentage: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                  })
                }
                placeholder="No discount"
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                }
                required
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="https://..."
                className="w-full h-10 px-3 rounded-lg bg-surface border border-border/50 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : null}
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 px-6 rounded-lg bg-surface-light text-text-secondary text-sm font-medium hover:bg-surface-lighter transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-lighter border-t-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p>No products yet. Click &quot;Add Product&quot; to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Price
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Discount
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border/30 hover:bg-surface-light/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-surface-lighter flex-shrink-0">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-text-primary truncate max-w-[200px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-text-secondary">
                    {product.category}
                  </td>
                  <td className="py-3 px-4 text-right text-text-primary font-medium">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {product.discount_percentage ? (
                      <span className="text-secondary font-medium">
                        {product.discount_percentage}%
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() =>
                          handleUpdateStock(
                            product,
                            Math.max(0, product.stock - 1),
                          )
                        }
                        className="h-6 w-6 flex items-center justify-center rounded bg-surface-lighter text-text-muted hover:text-text-primary text-xs"
                      >
                        −
                      </button>
                      <span
                        className={`min-w-[2rem] text-center font-medium ${
                          product.stock === 0
                            ? "text-danger"
                            : product.stock < 5
                              ? "text-warning"
                              : "text-text-primary"
                        }`}
                      >
                        {product.stock}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateStock(product, product.stock + 1)
                        }
                        className="h-6 w-6 flex items-center justify-center rounded bg-surface-lighter text-text-muted hover:text-text-primary text-xs"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="h-7 px-3 rounded-md bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="h-7 px-3 rounded-md bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
