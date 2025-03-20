export const useTranslationState = () => useState('i18n-state', () => ({
  loadedLocales: {} as Record<string, boolean>,
  isLoading: {} as Record<string, boolean>,
  pendingKeys: new Set<string>(),
  missedAfterLoad: new Set<string>()
}));