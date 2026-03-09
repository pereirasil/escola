import { api } from './api'

export const usersService = {
  listPending: () => api.get('/users/pending'),
  approve: (id) => api.patch(`/users/${id}/approve`),
}
