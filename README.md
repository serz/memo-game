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
- [x] Create win condition check
  - [x] Track game duration
  - [x] Store and compare best times
  - [x] Show game statistics
  - [x] Add winner trophy display

### Phase 3: UI/UX
- [ ] Design game menu
  - [ ] Add settings button (top right)
  - [ ] Create settings modal
    - [ ] Number of players (2-4)
    - [ ] Card theme selection
    - [ ] Reset game data option
  - [ ] Add apply/cancel buttons
- [x] Add player name input
  - [x] Create player name edit modal
  - [x] Add name validation
  - [x] Add name persistence
  - [x] Add name update animation
- [x] Create score display
- [x] Add animations for matches
  - [x] Card flip animation
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

### Phase 4: Enhanced Features
- [ ] Add difficulty levels (different grid sizes)
- [ ] Implement local multiplayer
- [ ] Add statistics tracking
- [ ] Create leaderboard (optional)
- [ ] Add theme selection (different card sets)

### Phase 5: Polish
- [ ] Add proper error handling
- [ ] Implement save game feature
- [ ] Add settings menu
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