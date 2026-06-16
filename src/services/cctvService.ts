export const cctvService = {
  analyzeImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${API_BASE}/cctv/analyze-image`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },

  analyzeVideo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${API_BASE}/cctv/analyze-video`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },
};
