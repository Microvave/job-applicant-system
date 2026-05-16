import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export function useApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list();
      setApplicants(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.create(form);
      await fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, form) => {
    setSaving(true);
    try {
      await api.update({ id, ...form });
      await fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      await api.delete(id);
      await fetchAll();
    } finally {
      setSaving(false);
    }
  };

  return { applicants, loading, saving, error, fetchAll, handleCreate, handleUpdate, handleDelete };
}
