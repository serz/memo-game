# Memo Card Game

A mobile memory card game built with React Native and Expo.

## Game Rules
- Players take turns flipping two cards at a time
- If the cards match, the current player keeps them and gets another turn
- If the cards don't match, they are flipped face down and the next player takes their turn
- The game continues until all pairs are found
- The player with the most pairs wins

## TODO List

### Phase 1: Basic Game Setup
- [x] Create game board layout
- [x] Design card component
  - [x] Front face (image)
  - [x] Back face (card pattern)
  - [x] Flip animation
- [x] Implement card grid system
- [x] Add basic card flipping mechanism

### Phase 2: Game Logic
- [x] Create card matching logic
  - [x] Track flipped cards
  - [x] Compare cards when two are flipped
  - [x] Keep matched pairs face up
- [x] Implement turn system
  - [x] Add player switching
  - [x] Track current player's score
  - [x] Keep turn on match
- [x] Add score tracking
  - [x] Store and compare best times
  - [x] Show game statistics
  - [x] Add winner trophy display

### Phase 3: UI/UX
- [x] Design game menu
  - [x] Add settings button (top right)
  - [x] Create settings modal
    - [x] Number of players (1-4)
    - [x] Card theme selection
      - [x] Animals theme
      - [x] Food theme
      - [x] Random mix theme
    - [x] Reset game data option
  - [x] Add apply/cancel buttons
- [x] Add player name input
  - [x] Create player name edit modal
  - [x] Save player names
  - [x] Load saved names

### Phase 4: Animations & Effects
- [x] Add card animations
  - [x] Flip animation
  - [x] Match celebration
- [x] Add game animations
  - [x] Match celebration animation
  - [x] Score change animation
  - [x] Player turn indicator
  - [x] Game over celebration
  - [x] Best time celebration
- [x] Add feedback effects
  - [x] Add haptic feedback
    - [x] Mismatched pairs
    - [x] Win celebration
  - [ ] Implement sound effects (optional)

### Phase 5: Polish
- [ ] Add proper error handling
- [ ] Implement save game feature
- [x] Add settings menu
- [ ] Optimize performance
- [ ] Add app icon and splash screen

## Getting Started
```bash
npm install
npx expo start
```

## Tech Stack
- React Native
- Expo
- React Native Reanimated (for animations)
- Expo Haptics (for haptic feedback)
- AsyncStorage (for data persistence)
- Expo Vector Icons (for UI icons)

## Features
- Single and multiplayer modes (1-4 players)
- Multiple card themes (Animals, Food, Random mix)
- Best time tracking for single player
- Player name customization
- Settings persistence
- Haptic feedback
- Smooth animations

