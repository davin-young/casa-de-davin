import { vi, beforeEach } from 'vitest';
import { _resetForTest } from '@/lib/rate-limit';

// Mock environment
process.env.ADMIN_PASSWORD = 'sincerely';
process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-chars-long!!';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock session
const mockSessionData = { isAdmin: false, save: vi.fn().mockResolvedValue(undefined), destroy: vi.fn() };

vi.mock('@/lib/session', () => ({
  getSession: vi.fn().mockResolvedValue(mockSessionData),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendBookingNotification: vi.fn().mockResolvedValue(undefined),
  sendApprovalEmail: vi.fn().mockResolvedValue(undefined),
  sendDeclineEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock Google Calendar
vi.mock('@/lib/google-calendar', () => ({
  createBookingEvent: vi.fn().mockResolvedValue({ eventId: 'mock-event-id', htmlLink: 'https://example.com' }),
  updateEventStatus: vi.fn().mockResolvedValue(undefined),
  isCalendarConfigured: vi.fn().mockReturnValue(false),
}));

// Mock database
const mockInsertReturning = vi.fn().mockResolvedValue([{ id: 'mock-uuid-1234' }]);
const mockInsertValues = vi.fn().mockReturnValue({ returning: mockInsertReturning });
const mockInsert = vi.fn().mockReturnValue({ values: mockInsertValues });

const mockSelectLimit = vi.fn().mockResolvedValue([]);
const mockSelectWhere = vi.fn().mockReturnValue({ limit: mockSelectLimit });
const mockSelectFrom = vi.fn().mockReturnValue({ where: mockSelectWhere, orderBy: vi.fn().mockResolvedValue([]) });
const mockSelect = vi.fn().mockReturnValue({ from: mockSelectFrom });

const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
const mockUpdate = vi.fn().mockReturnValue({ set: mockUpdateSet });

vi.mock('@/db', () => ({
  db: {
    insert: mockInsert,
    select: mockSelect,
    update: mockUpdate,
  },
}));

vi.mock('@/db/schema', () => ({
  bookings: {
    id: 'id',
    ref: 'ref',
    name: 'name',
    room: 'room',
    arrive: 'arrive',
    depart: 'depart',
    status: 'status',
    why: 'why',
    travel: 'travel',
    calendarEventId: 'calendar_event_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
}));

// Reset state between tests
beforeEach(() => {
  vi.clearAllMocks();
  _resetForTest();
  mockSessionData.isAdmin = false;
  mockSessionData.save.mockResolvedValue(undefined);

  // Reset default mock returns
  mockInsertReturning.mockResolvedValue([{ id: 'mock-uuid-1234' }]);
  mockSelectLimit.mockResolvedValue([]);
  mockSelectFrom.mockReturnValue({ where: mockSelectWhere, orderBy: vi.fn().mockResolvedValue([]) });
});

// Export for helpers
export { mockSessionData, mockInsertReturning, mockSelectLimit, mockSelectFrom, mockUpdateWhere };
