import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AiModerationState {
  analyzingRecipes: Record<string, string>; // stores initial updatedDate
  setAnalyzing: (recipeId: string, initialUpdatedDate: string | null) => void;
  checkAndClearExpired: () => void;
  clearAnalyzing: (recipeId: string) => void;
}

export const useAiModerationStore = create<AiModerationState>()(
  persist(
    (set, get) => ({
      analyzingRecipes: {},
      setAnalyzing: (recipeId, initialUpdatedDate) => {
        set((state) => {
          const newRecords = { ...state.analyzingRecipes };
          newRecords[recipeId] = initialUpdatedDate || "none";
          return { analyzingRecipes: newRecords };
        });
      },
      clearAnalyzing: (recipeId) => {
        set((state) => {
          const newRecords = { ...state.analyzingRecipes };
          delete newRecords[recipeId];
          return { analyzingRecipes: newRecords };
        });
      },
      checkAndClearExpired: () => {
        const now = Date.now();
        let changed = false;
        const newRecords = { ...get().analyzingRecipes };
        
        Object.keys(newRecords).forEach(key => {
          // Expiration check removed as requested. It will spin indefinitely
          // until an error occurs or the session is manually cleared.
        });

        if (changed) {
          set({ analyzingRecipes: newRecords });
        }
      }
    }),
    {
      name: 'ai-moderation-storage',
      storage: createJSONStorage(() => sessionStorage), // Survives F5, but clears on tab close
    }
  )
);
