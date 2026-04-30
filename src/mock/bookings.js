const bookings = [
  {
    id: 'BKG-1001',
    township: 'Sunrise Township',
    plotNumber: 'A-12',
    plotId: 'PLT-001',
    plotSize: 120.50,
    clientMobile: '+91-9876543210',
    status: 'booking_created', // booking created, payment_pending, payment_confirmed, workflow_selected, on_hold, closed
    createdAt: '2025-04-01'
  },
  {
    id: 'BKG-1002',
    township: 'Green Meadows',
    plotNumber: 'P-45',
    plotId: 'PLT-004',
    plotSize: 90.00,
    clientMobile: '+91-9123456780',
    status: 'payment_pending',
    createdAt: '2025-04-02'
  },
  {
    id: 'BKG-1003',
    township: 'River View',
    plotNumber: 'R-05',
    plotId: 'PLT-006',
    plotSize: 150.00,
    clientMobile: '+91-9988776655',
    status: 'payment_confirmed',
    createdAt: '2025-04-03'
  },
  {
    id: 'BKG-1004',
    township: 'Navsar Enclave',
    plotNumber: 'N-88',
    plotId: 'PLT-008',
    plotSize: 110.25,
    clientMobile: '+91-9012345678',
    status: 'workflow_selected',
    createdAt: '2025-04-04'
  },
  {
    id: 'BKG-1005',
    township: 'Navsar Enclave',
    plotNumber: 'N-89',
    plotId: 'PLT-009',
    plotSize: 110.25,
    clientMobile: '+91-9001122334',
    status: 'on_hold',
    createdAt: '2025-04-05'
  },
  {
    id: 'BKG-1006',
    township: 'Sunrise Township',
    plotNumber: 'A-15',
    plotId: 'PLT-011',
    plotSize: 125.75,
    clientMobile: '+91-8234567890',
    status: 'closed',
    createdAt: '2025-03-28'
  }
];

export default bookings;