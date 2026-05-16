const GAS_URL = import.meta.env.VITE_GAS_URL;

export const api = {
  async get(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${GAS_URL}?${qs}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
  async post(body) {
    const formData = new URLSearchParams();
    formData.append("data", JSON.stringify(body));
    const res = await fetch(GAS_URL, { method: "POST", body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
  list:   ()     => api.get({ action: "list" }),
  create: (body) => api.post({ action: "create", ...body }),
  update: (body) => api.post({ action: "update", ...body }),
  delete: (id)   => api.post({ action: "delete", id }),
};
