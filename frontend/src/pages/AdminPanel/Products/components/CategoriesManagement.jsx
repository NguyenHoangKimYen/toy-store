import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Check, ArrowUpDown, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categories.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CategoriesManagement = ({ externalSearchQuery = '' }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', order: 99, imageUrl: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', order: 99, imageUrl: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const [saving, setSaving] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      // Backend already sorts by order field
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(externalSearchQuery.toLowerCase())
  );

  // Handle create
  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      setSaving(true);
      const slug = newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await createCategory({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined,
        slug,
        order: parseInt(newCategory.order) || 99,
        imageUrl: newCategory.imageUrl.trim() || undefined,
      });
      toast.success('Category created');
      setNewCategory({ name: '', description: '', order: 99, imageUrl: '' });
      setIsCreating(false);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to create category');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit start
  const handleEditStart = (cat) => {
    setEditingId(cat._id);
    setEditForm({
      name: cat.name,
      description: cat.description || '',
      order: cat.order ?? 99,
      imageUrl: cat.imageUrl || '',
    });
  };

  // Handle edit save
  const handleEditSave = async (id) => {
    if (!editForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      setSaving(true);
      await updateCategory(id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        order: parseInt(editForm.order) || 99,
        imageUrl: editForm.imageUrl.trim() || undefined,
      });
      toast.success('Category updated');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to update category');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.category) return;
    
    try {
      setSaving(true);
      await deleteCategory(deleteDialog.category._id);
      toast.success('Category deleted');
      setDeleteDialog({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
        <ArrowUpDown className="inline w-4 h-4 mr-2" />
        <strong>Order:</strong> Lower numbers appear first on the homepage. Categories with the same order are sorted alphabetically.
      </div>

      {/* Create new category */}
      {isCreating ? (
        <div className="bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-slate-900 dark:text-white">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="Category name *"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
            <Input
              placeholder="Image URL (optional)"
              value={newCategory.imageUrl}
              onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Order"
              value={newCategory.order}
              onChange={(e) => setNewCategory({ ...newCategory, order: e.target.value })}
              className="w-24"
            />
          </div>
          {newCategory.imageUrl && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Image className="w-4 h-4" />
              <span>Preview:</span>
              <img
                src={newCategory.imageUrl}
                alt="Preview"
                className="h-10 w-10 object-cover rounded border border-slate-200 dark:border-slate-700"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={saving} size="sm">
              <Check className="w-4 h-4 mr-1" /> Create
            </Button>
            <Button variant="ghost" onClick={() => setIsCreating(false)} size="sm">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)} variant="outline" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      )}

      {/* Categories table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-20">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-16 hidden lg:table-cell">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider hidden sm:table-cell">
                Slug
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {externalSearchQuery ? 'No categories match your search' : 'No categories found'}
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  {editingId === cat._id ? (
                    // Edit mode
                    <>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={editForm.order}
                          onChange={(e) => setEditForm({ ...editForm, order: e.target.value })}
                          className="w-16 h-8 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {editForm.imageUrl ? (
                          <img 
                            src={editForm.imageUrl} 
                            alt="" 
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="h-8"
                          placeholder="Name *"
                        />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Input
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Input
                          value={editForm.imageUrl}
                          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                          placeholder="Image URL"
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSave(cat._id)}
                            disabled={saving}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View mode
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-sm">
                            {cat.order ?? 99}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {cat.imageUrl ? (
                          <img 
                            src={cat.imageUrl} 
                            alt={cat.name} 
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900 dark:text-white">{cat.name}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                          {cat.description || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                          {cat.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStart(cat)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-purple-600 hover:bg-purple-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteDialog({ open: true, category: cat })}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {filteredCategories.length} of {categories.length} categories
      </p>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.category?.name}"? 
              Products in this category will NOT be deleted but will lose this category assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesManagement;
