sed -i '/<\/AnimatePresence>/i \
      {showPitchDeck && <BusinessPitchDeck onClose={() => setShowPitchDeck(false)} />}' src/App.tsx
