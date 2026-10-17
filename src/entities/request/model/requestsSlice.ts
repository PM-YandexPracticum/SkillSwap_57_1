import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/store"
import type { SwapRequest, RequestStatus } from "./types"
import { LOCAL_STORAGE_KEYS } from "@/shared/lib/constants"

function readRequests(): SwapRequest[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.REQUESTS)
    if (!saved) {
      return [];
    }
    const parsed: unknown = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed as SwapRequest[];
    }
    return [];
  } catch {
    return [];
  }
}

type RequestsState = {
  items: SwapRequest[];
}

const initialState: RequestsState = {
  items: readRequests(),
}

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    createRequest: (
      state,
      action: PayloadAction<{ skillId: string; fromUserId: string; toUserId: string }>
    ) => {
      const newRequest: SwapRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        skillId: action.payload.skillId,
        fromUserId: action.payload.fromUserId,
        toUserId: action.payload.toUserId,
        status: 'pending' as RequestStatus,
        createdAt: new Date().toISOString(),
      }
      state.items.push(newRequest);
    },
  },
})

export const { createRequest } = requestsSlice.actions;
export const requestsReducer = requestsSlice.reducer;

export const selectHasRequest = (
  state: RootState,
  skillId: string,
  fromUserId: string,
): boolean => {
  return state.requests.items.some(
    (request) =>
      request.skillId === skillId &&
      request.fromUserId === fromUserId &&
      request.status === 'pending',
  );
}
