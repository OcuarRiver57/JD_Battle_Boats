GAME DESCRIPTION
My application is a game where 2 players place “boats” on a small grid, where each ship is one “unit” wide and 2 or more “units” long. Keeping their boats hidden from their opponent. Each player will take turns picking spots on the grid to launch attacks, and their opponent will respond with “hit” or “miss”. If a boat has all the units it occupies are attacked, then that boat is sunk. When all of a player's boats are sunk, the other player wins.

PROJECT DESCRIPTION
This is a remaster of a project I made in python. The remaster will have graphics and a GUI instead of text only interaction. The remaster will take advantage of the way React and JavaScript work, as well as take advantage of the strategies and skills I have learned since my original project.

APPERANCE
User will see 2 square grids

Left Grid:
Shows user boats and previous enemy attacks

Right Grid:
Shows previous user attacks and allows user to pick current attacks

FUNCTIONALITY & FEATURES
• User can see their boat locations
• User can see enemy attack history
• User can see their own attack history
• User can select spots on left grid to place boats at start of game
• User can select spots on right grid during their turn to attack
• At least one of the following:
    • AI opponent ( don’t expect anything to smart)
    • Same screen pvp (will have to save data locally )
    • Multi-screen pvp (no idea how to do this but it would be awesome)
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

    • POWER UP RULES
        • some power ups can only be used once per game
        • power ups are given without warning under certain conditions?
        • power ups may be lost if not used in a certain amount of rounds
        • cannot receive new power up if already in possession of one

I would love more ideas for gameplay features like more types of boats or more power ups or ways to earn power ups. I have thought about round events like fog that makes your hit history display all misses for that round, or rocky water that limits where you can place your boats. Or alien invasion where 1 boat from each side is randomly moved. I think this project will be fun so if you have any ideas please leave them in the comments!