import { describe, test, expect } from "vitest";
import { requestsReducer, createRequest, selectHasRequest } from "./requestsSlice";
import type { RootState } from "@/store";

describe('requestsSlice', () => {
  const initialState = { items: []}

  describe('createRequest', () => {
    test('Должен добавить новую заявку в состояние с правильными данными', () => {
      const payload = {
        skillId: 'skill-123',
        fromUserId: 'user-1',
        toUserId: 'user-2',
      }
      const action = createRequest(payload);
      const newState = requestsReducer(initialState, action);

      expect(newState.items).toHaveLength(1);

      const newRequest = newState.items[0];

      expect(newRequest.skillId).toBe(payload.skillId);
      expect(newRequest.fromUserId).toBe(payload.fromUserId);
      expect(newRequest.toUserId).toBe(payload.toUserId);
      expect(newRequest.status).toBe('pending');

      expect(newRequest.id).toBeDefined();
      expect(newRequest.createdAt).toBeDefined();
      expect(() => new Date(newRequest.createdAt)).not.toThrow();
    })
  });

  describe('selectHasRequest', () => {
    const mockStateWithPendingRequest = {
      requests: {
        items: [
          {
            id: 'req-1',
            skillId: 'skill-1',
            fromUserId: 'user-1',
            toUserId: 'user-2',
            status: 'pending',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
        ],
      },
    } as unknown as RootState;

    const mockStateWithAcceptedRequest = {
      requests: {
        items: [
          {
            id: 'req-2',
            skillId: 'skill-1',
            fromUserId: 'user-1',
            toUserId: 'user-2',
            status: 'accepted',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
        ],
      },
    } as unknown as RootState;

    test('Должен вернуть true, если есть pending заявка от этого пользователя на этот навык', () => {
      const result = selectHasRequest(mockStateWithPendingRequest, 'skill-1', 'user-1');
      expect(result).toBe(true);
    });

    test('Должен вернуть false, если заявок больше нет вообще', () => {
      const emptyState = { requests: { items: [] } } as unknown as RootState;
      const result = selectHasRequest(emptyState, 'skill-1', 'user-1');
      expect(result).toBe(false);
    });

    test('Должен вернуть false, если заявка есть, но она уже принята (не pending)', () => {
      const result = selectHasRequest(mockStateWithAcceptedRequest, 'skill-1', 'user-1');
      expect(result).toBe(false);
    });

    test('Должен вернуть false, если заявка от другого пользователя', () => {
      const result = selectHasRequest(mockStateWithPendingRequest, 'skill-1', 'user-999');
      expect(result).toBe(false);
    });

    test('должен вернуть false, если заявка на другой навык', () => {
      const result = selectHasRequest(mockStateWithPendingRequest, 'skill-999', 'user-1');
      expect(result).toBe(false);
    });
  })
})
