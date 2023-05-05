# BlackJack Project Repository

This repository contains the code for a BlackJack game developed as part of the TypeScript bootcamp at Evolution Gaming. 
### [Video demonstration](https://www.youtube.com/watch?v=vbYx2ggWno0)

### Build with
- [MobX](https://mobx.js.org/README.html) for state management
- [React](https://reactjs.org/) for the user interface
- [Node.js](https://nodejs.org/en/docs) for server-side development
- [Socket.io](https://socket.io/) for real-time communication
- [Framer Motion](https://www.framer.com/motion/) for animations
- [React-Toastify](https://fkhadra.github.io/react-toastify/introduction/) for notifications
- [TypeScript](https://typescriptlang.org/) for type checking and better code organization
- [Jest](https://jestjs.io/ru/) for tests
- [Styled-components](https://www.styled-components.com/) for styles

## Main functionality
- [x] Creating a new game table or joining an existing one by ID.
- [x] Entering the game with a specified name and balance.
- [x] A form for topping up the balance (available only before the start of a round).
- [x] Sound settings: volume, mute (notifications, background music, click sounds).
- [x] Game interface with five slots for placing bets.
- [x] The ability to add and remove chips.
- [x] The start game button is unavailable until all players make bets or all slots are filled.
- [x] Displaying the current game status (game process, waiting for bets, waiting for the end of the round and setting bets).
- [x] Players chat with notifications
- [x] Animations (keyframes and framer motion)

___
To run the project you need to install all dependencies in server and blackjack folders via 
 ```sh
   npm install
   ```
Then you need to start server with
 ```sh
  npm start
   ``` 
script in server folder. And start client part with the same script in blackjack folder

## Plans
- [ ] Add responsive design (to play on mobiles)
- [ ] Add database.
- [ ] Add timer to make a decision (bet/action).
