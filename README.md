# Game Description

The User Deploys 4 Battle Boats on to a 10x10 grid and then goes back and forth with an AI selecting grid squares on their opponent's grid to attack until they have hit all of their opponents ships.

# Detailed Description

- The Game Board is two 10x10 Grids.
  
  - The first grid is your home grid, it is used to deploy and view your fleet of boats and their status.
  
  - The second grid is your attack grid, it is used to attack your opponent and see the results of your attacks (hit or miss).

- The game starts with the user deploying four boats that are 2, 3, 4, or 5 grid squares long and 1 grid square wide.

- The AI will randomly place 4 boats of the same size on their home grid.

- The User and the AI cannot see each others boat locations.

- The User and the AI will take turns selecting grid squares on their opponent's grid to attack.

- The game will end when the User or the AI has attacked and all of the grid squares containing their opponents boats.

# Planned Features

## UI

#### Place boat UI

- Boat List to view what boats need placing

- Your 10x10 grid to place boats on

- boat placement validation and clear feedback

#### Attacking UI

- Your 10x10 grid to display your boats and opponent attacks

- opponent 10x10 grid to display your attacks and their results (hit or miss)

- Timer for turn and game time is displayed

- Turn indicator

## Game Functions

### AI

- All AI place boats randomly without overlap or going outside bounds.

- Difficulty levels:
  
  - very easy:
    
    - attacks random locations on grid
  
  - easy:
    
    - attacks random locations on grid with no repeat attacks 
  
  - medium:
    
    - attacks random locations on grid with no repeat attacks 
    - it gets a hit then it targets area around hit until another hit or all adjacent squares have been hit
  
  - hard: 
    
    - will attack from one of multiple search patterns instead of random locations
    
    - if it gets a hit then it targets area around hit until another hit or all adjacent squares have been hit
  
  - very hard:
    
    - will attack from one of multiple search patterns instead of random locations
    - if it gets a hit then it will automatically know where the rest of the ship is and not miss any shots until it is sunk.
  
  - impossible:
    
    - will know all of your ship locations from the start and not miss any shots.
    - you get first turn but if you miss one shot then you will lose.

### PVP

- A server Browser to view currently open games

- 2 players place ships and when both are done game starts

- players play like normal

- in game chat?

- player accounts that save win data?

- web socket?

### More Gameplay Features

#### Special power ups

- TACTICAL RETREAT
  
  - Move one boat per game but tells opponent which boat moved but not where it went
  
  - opponent attack history turns hits into misses for boat that moved, but ship does not heal
  
  - give to player at any time

- ENGINEERS:
  
  - Heal one ship
  
  - cover opponent attack screen for two seconds and update attack screen to remove hits on healed ship
  
  - give to player early to mid game

- RADAR SCAN: 
  
  - Show location of a single guaranteed hit
  
  - highlight a single spot on attack map that will hit but picks opponent boat at random and can pick a boat you have already attacked
  
  - give to losing player in late game

- CYBER ATTACK:
  
  - Hide opponents attack history from them for a turn or two
  
  - give to player any time

- WILD BARRAGE:
  
  - Attack 3 times in one round, but 2 of the shots are  completely random
  
  - give to player mid to late game

- COORDINATED BARRAGE:
  
  - can attack twice in one round
     attacks must four or more grid squares from one another

- DEVINE INTERVENTION:
  
  - The killing blow on the last boat is evaded and the ship is randomly moved on the map
  
  - can only happen when you have one boat remaining and it has one hit left before sinking, and is hit.
  
  - power up does not show and is randomly activated
  
  - give to player when they are losing significantly 

- POWER UP RULES
  
  - some power ups can only be used once per game
  
  - power ups are given without warning under certain conditions
  
  - power ups may be lost if not used in a certain amount of turns
  
  - cannot receive new power up if already in possession of one

#### Status effects

- Fog of war
  
  - turns random hits in attack history into misses for 2-3 turns

- Rocky water
  
  - places rocks in the water that block ship placement but count as hits on opponent attack history. does not count as ship

- Extraterrestrial intervention 
  
  - the smallest ship still in play on both players fleet is moved to a random location on the board

- Pirate attack 
  
  - the smallest ship still in play on both players fleet takes one attack of on a random part of it

#### Game modes

- instant death 
  
  - all ships sink in one shot but are normal size

- engines on
  
  - players can move one ship instead of attacking on their turn
  - move cool down of two moves

- duel
  
  - players each get 1 ship of random but equal size

- battle brother
  
  - each player is aided by an ai and both the player and the ai get an attack turn 
  
  - maybe a 4 player option instead of ai

- budget cuts
  
  - all ships are 2 long