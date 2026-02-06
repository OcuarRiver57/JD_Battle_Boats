GAME DESCRIPTION
2 players go against one another by placing ships on a grid and guessing where there opponents ships are until you have found all of your opponent ships.
It is very similar to Battleship.

DETAILED DESCRIPTION
game has 2 players.
each player gets a grid (normally 10x10) for placing their ships on.
all ships are one grid square wide and between 2 and 5 grid squares long inclusive.
players do not know where their opponent placed their ships.
players take turns picking a grid square on their opponents grid to attack.
the game responds with either a hit or a miss.
the game continues until one player has hit all grid sqares containing the opponents ships.

FUNCTIONALITY & FEATURES
• User can see their own boat locations 
• User can see where the opponent has attacked
• User can see where they have attacked
• User can select squares on left grid to place boats at start of game
• User can select squares on right grid during their turn to attack opponent
• an AI oppoent for solo play.
    ai will have multiple levels
        easy: will pick radmom spots
        medium: will pick random spots but if it gets a hit then it will target the area around the hit
        hard: will pick from a random set of search patterns and target areas where it gets hits
        impossible: same as hard but if it gets a hit then it will see then it will not miss any shots on the ship that it hit.
• PVP
    there will be a game manager to keep a list of multiple game instances and handle api requests
        user will load client and client will make api requests to game manager with its actions
            api reqest will have:
                game id code (can be shard with other player to do pvp)
                player 1 & 2 id code (not shown and generated at the start of a game. used to make sure a third player cant connect and take your turn)
                cordinates (what grid square you clicked or hovered over)
                    or 
                power up clicked
            api request will return:
                sucess or failure baised on if it is your turn or if your player id is wrong
                whose turn it is
                current state of your ships and attack history
                power up inventory
                game effects or status effects
        PROBLEM!
            how can the api send an update to the player if they dont request it?
            should the client send timed request?
• Timer for turn and game time is displayed
• Turn indicator
• Special power ups like:
    • TACTICAL RETREAT: Move one boat per game but tells opponent which boat moved but not where it went
        (opponent attack history turns hits into misses for boat that moved, but ship does not heal, give to player at any time)

    • ENGINEERS: Heal one ship, tells opponent that you healed but not what ship 
        (adds warning that a ship has healed but does not change history display, give to player early game maybe it changes the colors of the hit indicators until the healed ship is hit again)

    • RADAR SCAN: Show location of a single guaranteed hit
        (highlight a single spot on attack map that will hit but picks opponent boat at random and can pick a boat you have already attacked, to give to losing player in late game)

    • CYBER ATTACK: Hide opponents attack history from them for a turn or two
        (give to player any time)

    • WILD BARRAGE Attack 3 times in one round, but 2 of the shots are random
        (attacks have a chance of picking the spots that have already been hit)

    • COORDINATED BARRAGE can attack twice in one round
        (attacks must be a distance from one another)

    • DEVINE INTERVENTION the killing blow on the last ship is evaded and the ship is randomly moved on the map
        (can only happen when you have one ship remaning and the opponet fires the sinking shot, power up does not show and is randomly activated)

    • POWER UP RULES
        • some power ups can only be used once per game
        • power ups are given without warning under certain conditions?
        • power ups may be lost if not used in a certain amount of rounds
        • cannot receive new power up if already in possession of one

• status effects
    • Fog of war (turns random hits in attack history into misses for 2-3 turns)
    • Rocky water (places rocks in the water that block ship placement but count as hits on opponent attack history. does not count as ship)
    • Extraterrestrial intervention (the smallest ship still in play on both players fleet is moved to a random location on the board)
    • Pirate attack (the smallest ship still in play on both players fleet takes one attack of on a random part of it)
    
• game modes
    • instant death 
        all ships sink in one shot 
    • engines on
        players can move one ship instead of attacking on their turn
    • duel
        players each get 1 ship of random but equal size
    • battle brother
        each player is aided by an ai and both the player and the ai get an attack turn
        maybe make it 4 player option instead of ai?