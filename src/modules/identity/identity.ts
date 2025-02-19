export interface Identity {
  id: string;
  tenantId: string;
  role: 'admin' | 'user';
}
