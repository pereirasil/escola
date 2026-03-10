import { api } from './api'

export const usersService = {
  listPending: () => api.get('/users/pending'),
  listApproved: () => api.get('/users/approved'),
  approve: (id) => api.patch(`/users/${id}/approve`),
  countOrphans: () => api.get('/users/orphan-records'),
  assignOrphans: (schoolId) => api.post(`/users/${schoolId}/assign-orphans`),
}
