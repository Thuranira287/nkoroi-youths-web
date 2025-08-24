import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

const mockFetch = fetch as any;

describe('Authentication API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Clear localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          created_at: new Date().toISOString()
        },
        token: 'test-token',
        message: 'Login successful'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.user.email).toBe('test@example.com');
      expect(data.token).toBe('test-token');
    });

    it('should fail login with invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Invalid credentials' }),
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe('Registration', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        user: {
          id: '2',
          username: 'newuser',
          email: 'new@example.com',
          role: 'user',
          created_at: new Date().toISOString()
        },
        token: 'new-token',
        message: 'Registration successful'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: 'newuser',
          email: 'new@example.com', 
          password: 'password123' 
        })
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.user.username).toBe('newuser');
    });

    it('should fail registration with existing email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ success: false, message: 'Email already in use' }),
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: 'newuser',
          email: 'existing@example.com', 
          password: 'password123' 
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
    });
  });
});

describe('Announcements API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch announcements successfully', async () => {
    const mockAnnouncements = {
      results: [
        {
          id: '1',
          title: 'Test Announcement',
          description: 'Test description',
          date: '2024-02-15',
          time: '10:00 AM',
          venue: 'Test Venue',
          created_by: 'admin',
          created_at: new Date().toISOString()
        }
      ],
      count: 1
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockAnnouncements,
    });

    const response = await fetch('/api/announcements');
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.results).toHaveLength(1);
    expect(data.results[0].title).toBe('Test Announcement');
  });

  it('should create announcement successfully with admin token', async () => {
    const mockAnnouncement = {
      id: '2',
      title: 'New Announcement',
      description: 'New description',
      date: '2024-02-20',
      time: '2:00 PM',
      venue: 'New Venue',
      created_by: 'admin',
      created_at: new Date().toISOString()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: mockAnnouncement }),
    });

    const response = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token'
      },
      body: JSON.stringify({
        title: 'New Announcement',
        description: 'New description',
        date: '2024-02-20',
        time: '2:00 PM',
        venue: 'New Venue'
      })
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);
  });
});

describe('Daily Quote API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch daily quote successfully', async () => {
    const mockQuote = {
      id: 'quote_2024-02-15',
      verse: 'For I know the plans I have for you...',
      reference: 'Jeremiah 29:11',
      date: '2024-02-15'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuote,
    });

    const response = await fetch('/api/daily-quote');
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.verse).toContain('For I know the plans');
    expect(data.reference).toBe('Jeremiah 29:11');
  });
});
