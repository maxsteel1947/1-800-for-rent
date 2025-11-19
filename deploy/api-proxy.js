// Simple API proxy for static deployment
// This will be handled by a separate server

// For now, we'll use mock data
const mockData = {
  properties: [
    { id: "1", name: "Sunrise PG", address: "123 Main St", rooms: 10, amenities: ["WiFi", "AC"], rentPerRoom: 8000, depositPerRoom: 10000, occupied: 7 }
  ],
  tenants: [
    { id: "1", name: "Alice", phone: "9999999999", propertyId: "1", room: "A1", rent: 8000, deposit: 10000, moveIn: "2025-11-01" }
  ],
  payments: [
    { id: "1", tenantId: "1", propertyId: "1", amount: 8000, date: "2025-11-05", method: "UPI", status: "paid" }
  ],
  documents: [
    { id: "1", filename: "sample.pdf", original: "sample.pdf", tenantId: "1", propertyId: "1", uploadedAt: "2025-11-18T16:44:48.003Z" }
  ],
  maintenance: [
    { id: "1", status: "open", createdAt: "2025-11-18T17:23:24.007Z", propertyId: "1", room: "A1", issue: "Leaking tap" }
  ]
};

// Export for use in the app
window.mockAPI = {
  get: (endpoint) => Promise.resolve({ data: mockData[endpoint.replace('/api/', '')] || [] }),
  post: (endpoint, data) => Promise.resolve({ data: { id: Date.now().toString(), ...data } }),
  delete: (endpoint) => Promise.resolve({ data: { message: 'Deleted' } })
};
