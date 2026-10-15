import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { fetchSkills } from '@/api/skills'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { readList } from '@/shared/lib/storage'
import type { LoadingStatus } from '@/store/types'
import type { RootState } from '@/store'
import type { Skill } from './types'

export type SkillsState = {
  items: Skill[]
  status: LoadingStatus
  error: string | null
}

const initialState: SkillsState = {
  items: [],
  status: 'idle',
  error: null,
}

/**
 * Загружает навыки один раз: повторный dispatch при уже начатой загрузке пропускается.
 * К моковым навыкам добавляются навыки зарегистрированных пользователей (из localStorage).
 */
export const loadSkills = createAsyncThunk<Skill[], void, { state: RootState }>(
  'skills/loadSkills',
  async () => [...(await fetchSkills()), ...readList<Skill>(LOCAL_STORAGE_KEYS.REGISTERED_SKILLS)],
  {
    condition: (_arg, { getState }) => getState().skills.status === 'idle',
  },
)

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    addSkill(state, action: PayloadAction<Skill>) {
      state.items.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSkills.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadSkills.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(loadSkills.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Не удалось загрузить навыки'
      })
  },
})

export const skillsReducer = skillsSlice.reducer
export const { addSkill } = skillsSlice.actions

export const selectSkills = (state: RootState) => state.skills.items
export const selectSkillsStatus = (state: RootState) => state.skills.status
export const selectSkillsError = (state: RootState) => state.skills.error
