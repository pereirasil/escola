import { api } from './api';

export const reunioesService = {
  listar: () => api.get('/meetings'),
  criar: (data) => api.post('/meetings', data),
  atualizar: (id, data) => api.put(`/meetings/${id}`, data),
  excluir: (id) => api.delete(`/meetings/${id}`),
};
