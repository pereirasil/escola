import { api } from './api'

export const pagamentosService = {
  listar: () => api.get('/payments'),
  buscarPorId: (id) => api.get(`/payments/${id}`),
  criar: (data) => api.post('/payments', data),
  atualizar: (id, data) => api.put(`/payments/${id}`, data),
  enviarBoleto: (id) => api.post(`/payments/${id}/send-boleto`),
  gerarBoleto: (id) => api.post(`/payments/${id}/generate-boleto`),
  gerarPix: (id) => api.post(`/payments/${id}/generate-pix`),
  buscarBoletoPdf: (id) => api.get(`/payments/${id}/boleto-pdf`, { responseType: 'blob' }),
}
