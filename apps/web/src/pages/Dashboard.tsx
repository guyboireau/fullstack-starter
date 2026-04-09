import { useState, useEffect, useCallback, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type ItemStatus = 'todo' | 'in_progress' | 'done';

interface Item {
  id: string;
  title: string;
  description: string | null;
  status: ItemStatus;
  created_at: string;
}

interface ItemForm {
  title: string;
  description: string;
  status: ItemStatus;
}

const EMPTY_FORM: ItemForm = { title: '', description: '', status: 'todo' };

const STATUS_LABELS: Record<ItemStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function Dashboard() {
  const { session } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch {
      // Fallback: direct Supabase query if API is not running
      const { data, error: sbError } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) {
        setError(sbError.message);
      } else {
        setItems(data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (item: Item) => {
    setForm({
      title: item.title,
      description: item.description || '',
      status: item.status,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingId ? `/api/items/${editingId}` : '/api/items';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error('Failed to save item');

      closeModal();
      fetchItems();
    } catch {
      // Fallback: direct Supabase
      if (editingId) {
        const { error: sbError } = await supabase
          .from('items')
          .update(form)
          .eq('id', editingId);
        if (sbError) setError(sbError.message);
      } else {
        const { error: sbError } = await supabase
          .from('items')
          .insert({ ...form, user_id: session?.user?.id });
        if (sbError) setError(sbError.message);
      }

      closeModal();
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete');
      fetchItems();
    } catch {
      // Fallback: direct Supabase
      const { error: sbError } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (sbError) setError(sbError.message);
      else fetchItems();
    }
  };

  // Stats
  const totalItems = items.length;
  const todoCount = items.filter((i) => i.status === 'todo').length;
  const inProgressCount = items.filter((i) => i.status === 'in_progress').length;
  const doneCount = items.filter((i) => i.status === 'done').length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Manage your items and track progress</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{totalItems}</div>
          <div className="stat-icon">📦</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">To Do</div>
          <div className="stat-value">{todoCount}</div>
          <div className="stat-icon">📋</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgressCount}</div>
          <div className="stat-icon">⚡</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{doneCount}</div>
          <div className="stat-icon">✅</div>
        </div>
      </div>

      {/* Items List */}
      <div className="items-header">
        <h3>Items</h3>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + New Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No items yet. Create your first one!</p>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            + Create Item
          </button>
        </div>
      ) : (
        <div className="items-list">
          {items.map((item) => (
            <div key={item.id} className="item-row">
              <div className="item-content">
                <div className="item-title">{item.title}</div>
                {item.description && (
                  <div className="item-desc">{item.description}</div>
                )}
              </div>
              <span className={`badge badge-${item.status.replace('_', '-')}`}>
                {STATUS_LABELS[item.status]}
              </span>
              <div className="item-actions">
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => openEdit(item)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger btn-icon btn-sm"
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Item' : 'New Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="item-title">Title</label>
                <input
                  id="item-title"
                  type="text"
                  className="form-input"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-desc">Description</label>
                <input
                  id="item-desc"
                  type="text"
                  className="form-input"
                  placeholder="Optional details…"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-status">Status</label>
                <select
                  id="item-status"
                  className="form-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as ItemStatus,
                    })
                  }
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving…'
                    : editingId
                      ? 'Update'
                      : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
