const { generateToken, genOtp6, sha256 } = require('../token');

describe('Token Utils', () => {
  describe('generateToken', () => {
    it('should generate a 32 character hex string', () => {
      const token = generateToken();
      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('genOtp6', () => {
    it('should generate a 6 digit string', () => {
      const otp = genOtp6();
      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate OTP between 100000 and 999999', () => {
      for (let i = 0; i < 100; i++) {
        const otp = parseInt(genOtp6());
        expect(otp).toBeGreaterThanOrEqual(100000);
        expect(otp).toBeLessThanOrEqual(999999);
      }
    });

    it('should generate different OTPs', () => {
      const otps = new Set();
      for (let i = 0; i < 100; i++) {
        otps.add(genOtp6());
      }
      // With 100 attempts, we should have multiple unique OTPs
      expect(otps.size).toBeGreaterThan(50);
    });
  });

  describe('sha256', () => {
    it('should hash a string using SHA256', () => {
      const hash = sha256('hello');
      expect(hash).toHaveLength(64); // SHA256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should produce consistent hashes', () => {
      const hash1 = sha256('test');
      const hash2 = sha256('test');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = sha256('hello');
      const hash2 = sha256('world');
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const hash = sha256('');
      expect(hash).toHaveLength(64);
    });

    it('should handle special characters', () => {
      const hash = sha256('!@#$%^&*()');
      expect(hash).toHaveLength(64);
    });
  });
});
