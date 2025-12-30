import { describe, it, expect } from 'vitest';
import { getPriorityColor, sortTasks } from '../utils/tasks/taskHelpers';

describe('taskHelpers', () => {
  describe('getPriorityColor', () => {
    it('should return red colors for high priority', () => {
      const color = getPriorityColor('high');
      expect(color).toContain('text-red-500');
      expect(color).toContain('bg-red-50');
    });

    it('should return amber colors for medium priority', () => {
      const color = getPriorityColor('medium');
      expect(color).toContain('text-amber-500');
      expect(color).toContain('bg-amber-50');
    });

    it('should return green colors for low priority', () => {
      const color = getPriorityColor('low');
      expect(color).toContain('text-green-500');
      expect(color).toContain('bg-green-50');
    });

    it('should return gray colors for unknown priority', () => {
      const color = getPriorityColor('unknown');
      expect(color).toContain('text-gray-500');
    });
  });

  describe('sortTasks', () => {
    it('should sort tasks by priority (high > medium > low)', () => {
      const unsorted = [
        { priority: 'low', text: 'Task 1' },
        { priority: 'high', text: 'Task 2' },
        { priority: 'medium', text: 'Task 3' },
      ];
      const sorted = sortTasks(unsorted);
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });

    it('should sort tasks with same priority by due date', () => {
      const unsorted = [
        { priority: 'high', dueDate: '2025-12-31', text: 'Later' },
        { priority: 'high', dueDate: '2025-12-25', text: 'Earlier' },
      ];
      const sorted = sortTasks(unsorted);
      expect(sorted[0].text).toBe('Earlier');
      expect(sorted[1].text).toBe('Later');
    });

    it('should put tasks without due dates at the end within their priority group', () => {
      const unsorted = [
        { priority: 'medium', dueDate: undefined, text: 'No Date' },
        { priority: 'medium', dueDate: '2025-12-25', text: 'With Date' },
      ];
      const sorted = sortTasks(unsorted);
      expect(sorted[0].text).toBe('With Date');
      expect(sorted[1].text).toBe('No Date');
    });
  });
});
