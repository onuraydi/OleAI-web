import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AiModerationState {
  analyzingRecipes: Record<string, number>; // stores timestamp
  setAnalyzing: (recipeId: string, isAnalyzing: boolean) => void;
  checkAndClearExpired: () => void;
}

export const useAiModerationStore = create<AiModerationState>()(
  persist(
    (set, get) => ({
      analyzingRecipes: {},
      setAnalyzing: (recipeId, isAnalyzing) => {
        set((state) => {
          const newRecords = { ...state.analyzingRecipes };
          if (isAnalyzing) {
            newRecords[recipeId] = Date.now();
          } else {
            delete newRecords[recipeId];
          }
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
