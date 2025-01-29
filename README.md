# Memo Card Game 🎴

A modern memory card game built with React Native and Expo. Challenge yourself in single-player mode to beat your best time, or compete with friends in multiplayer mode (up to 4 players).

## ✨ Features

- 🎮 Single and multiplayer modes (1-4 players)
- 🎨 Multiple card themes:
  - 🐼 Animals
  - 🍕 Food
  - 🎲 Random mix
- ⏱️ Best time tracking for single player
- 📝 Customizable player names
- ⚙️ Persistent settings
- 📱 Haptic feedback
- 🎯 Smooth animations

## 🎯 Game Rules
- Players take turns flipping two cards at a time
- If the cards match, the current player keeps them and gets another turn
- If the cards don't match, they are flipped face down and the next player takes their turn
- The game continues until all pairs are found
- In multiplayer: player with the most pairs wins
- In single player: try to beat your best time!

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/memo-card-game.git
cd memo-card-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

## 🛠️ Tech Stack
- React Native
- Expo
- React Native Reanimated (for animations)
- Expo Haptics (for haptic feedback)
- AsyncStorage (for data persistence)
- Expo Vector Icons (for UI icons)
- Expo AV (for sound effects)

## 📱 Screenshots
[Add screenshots here]

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
      - [x] Random theme (randomly selects one theme)
      - [x] Mixed theme (combines emojis from all themes)
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
  - [x] Matched cards fade to gray
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
  - [x] Add sound effects
    - [x] Card flip sound
    - [x] Match success sound
    - [x] Victory sound (for winners and best times)

### Phase 5: Polish & Error Handling
- [x] Add proper error handling
  - [x] Centralized error management
  - [x] Graceful error recovery
  - [x] User-friendly error messages
  - [x] Silent mode for non-critical errors
  - [x] Retry mechanisms for storage operations
- [ ] Implement save game feature
- [x] Add settings menu
  - [x] Player count control
  - [x] Theme selection
  - [x] Data reset option
- [ ] Optimize performance
- [ ] Add app icon and splash screen

