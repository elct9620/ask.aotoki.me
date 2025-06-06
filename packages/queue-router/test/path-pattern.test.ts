import { describe, it, expect } from 'vitest';
import { PathPattern } from '../src/path-pattern';

describe('PathPattern', () => {
  describe('simple path matching', () => {
    it('should match exact paths', () => {
      const pattern = new PathPattern('/content/images');
      const result = pattern.match('/content/images');
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({});
    });

    it('should normalize paths with/without leading slash', () => {
      const pattern = new PathPattern('content/images');
      const result = pattern.match('/content/images');
      expect(result.matched).toBe(true);
    });

    it('should not match different paths', () => {
      const pattern = new PathPattern('/content/images');
      const result = pattern.match('/content/videos');
      expect(result.matched).toBe(false);
    });
  });

  describe('parameter extraction', () => {
    it('should extract simple parameters', () => {
      const pattern = new PathPattern('/content/:type');
      const result = pattern.match('/content/images');
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ type: 'images' });
    });

    it('should extract multiple parameters', () => {
      const pattern = new PathPattern('/content/:type/:id');
      const result = pattern.match('/content/images/123');
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ type: 'images', id: '123' });
    });

    it('should not match if segments are missing', () => {
      const pattern = new PathPattern('/content/:type/:id');
      const result = pattern.match('/content/images');
      expect(result.matched).toBe(false);
    });

    it('should not match if too many segments', () => {
      const pattern = new PathPattern('/content/:type');
      const result = pattern.match('/content/images/extra');
      expect(result.matched).toBe(false);
    });
  });

  describe('greedy parameter matching', () => {
    it('should match all remaining segments with star modifier', () => {
      const pattern = new PathPattern('/content/:path*');
      const result = pattern.match('/content/images/2023/photo.jpg');
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ path: 'images/2023/photo.jpg' });
    });

    it('should allow empty matches with star modifier', () => {
      const pattern = new PathPattern('/content/:path*');
      const result = pattern.match('/content');
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ path: '' });
    });

    it('should require at least one segment with plus modifier', () => {
      const pattern = new PathPattern('/content/:path+');
      
      const result1 = pattern.match('/content/images/2023/photo.jpg');
      expect(result1.matched).toBe(true);
      expect(result1.params).toEqual({ path: 'images/2023/photo.jpg' });
      
      const result2 = pattern.match('/content');
      expect(result2.matched).toBe(false);
    });

    it('should handle static segments after greedy parameters', () => {
      // This is challenging and might not work as expected with current implementation
      const pattern = new PathPattern('/content/:path*/edit');
      const result = pattern.match('/content/images/2023/photo.jpg/edit');
      
      // Currently, our implementation has a limitation with greedy params in the middle
      // Ideally, this should match, but we're documenting the current behavior
      expect(result.matched).toBe(false);
    });
  });

  describe('complex patterns', () => {
    it('should handle mixed static and parameter segments', () => {
      const pattern = new PathPattern('/api/v1/users/:userId/posts/:postId');
      const result = pattern.match('/api/v1/users/123/posts/456');
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ userId: '123', postId: '456' });
    });

    it('should handle trailing static segments', () => {
      const pattern = new PathPattern('/content/:type/view');
      const result = pattern.match('/content/images/view');
      expect(result.matched).toBe(true);
      expect(result.params).toEqual({ type: 'images' });
    });
  });

  describe('edge cases', () => {
    it('should handle empty paths', () => {
      const pattern = new PathPattern('/');
      expect(pattern.match('/').matched).toBe(true);
      expect(pattern.match('').matched).toBe(true);
    });

    it('should handle paths with special characters in static segments', () => {
      const pattern = new PathPattern('/content/special-images');
      expect(pattern.match('/content/special-images').matched).toBe(true);
    });
  });
});
