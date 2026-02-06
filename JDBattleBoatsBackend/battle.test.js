import Battle from './battle.js';
import { createInstance, inputHandler, battleList } from './LocalCommand.js';

describe('Battle - Constructor and Initialization', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId123');
    });

    test('playerTurn should be initialized to 1', () => {
        expect(battle.playerTurn).toBe(1);
    });

    test('playerAction should be initialized to "attack"', () => {
        expect(battle.playerAction).toBe('attack');
    });

    test('p1ShipData should be an empty object', () => {
        expect(battle.p1ShipData).toEqual({});
    });

    test('p1AttackData should be an empty object', () => {
        expect(battle.p1AttackData).toEqual({});
    });

    test('p2ShipData should be an empty object', () => {
        expect(battle.p2ShipData).toEqual({});
    });

    test('p2AttackData should be an empty object', () => {
        expect(battle.p2AttackData).toEqual({});
    });

    test('gridRows should be 10', () => {
        expect(battle.gridRows).toBe(10);
    });

    test('gridCols should be 10', () => {
        expect(battle.gridCols).toBe(10);
    });

    test('player1Id should be a string', () => {
        expect(typeof battle.player1Id).toBe('string');
    });

    test('player2Id should be a string', () => {
        expect(typeof battle.player2Id).toBe('string');
    });

    test('gameId should be stored correctly', () => {
        expect(battle.gameId).toBe('gameId123');
    });
});

describe('Battle - generatePlayerId', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('should generate ID with default length of 16', () => {
        const playerId = battle.generatePlayerId();
        expect(playerId).toHaveLength(16);
    });

    test('should generate ID with custom length', () => {
        const playerId = battle.generatePlayerId(8);
        expect(playerId).toHaveLength(8);
    });

    test('should return a string', () => {
        const playerId = battle.generatePlayerId();
        expect(typeof playerId).toBe('string');
    });

    test('should produce non-empty IDs', () => {
        const playerId = battle.generatePlayerId();
        expect(playerId.length).toBeGreaterThan(0);
    });

    test('should generate different IDs', () => {
        const id1 = battle.generatePlayerId();
        const id2 = battle.generatePlayerId();
        expect(id1).not.toBe(id2);
    });
});

describe('Battle - getOtherPlayer', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('should return 2 when given player 1', () => {
        expect(battle.getOtherPlayer(1)).toBe(2);
    });

    test('should return 1 when given player 2', () => {
        expect(battle.getOtherPlayer(2)).toBe(1);
    });

    test('should return 2 when no parameter (playerTurn = 1)', () => {
        battle.playerTurn = 1;
        expect(battle.getOtherPlayer()).toBe(2);
    });
});

describe('Battle - Cord Converters', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('stringToArrayCordConverter should convert "5:3" to [5,3]', () => {
        const result = battle.stringToArrayCordConverter('5:3');
        expect(result).toEqual([5, 3]);
    });

    test('arrayToStringCordConverter should convert [5,3] to "5:3"', () => {
        const result = battle.arrayToStringCordConverter([5, 3]);
        expect(result).toBe('5:3');
    });

    test('cordConverter with string input should return array', () => {
        const result = battle.cordConverter('7:8');
        expect(result).toEqual([7, 8]);
    });

    test('cordConverter with array input should return string', () => {
        const result = battle.cordConverter([7, 8]);
        expect(result).toBe('7:8');
    });
});

describe('Battle - Data Selectors', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('selectShipList(1) should return p1ShipList reference', () => {
        expect(battle.selectShipList(1)).toBe(battle.p1ShipList);
    });

    test('selectShipList(2) should return p2ShipList reference', () => {
        expect(battle.selectShipList(2)).toBe(battle.p2ShipList);
    });

    test('selectShipData(1) should return p1ShipData reference', () => {
        expect(battle.selectShipData(1)).toBe(battle.p1ShipData);
    });

    test('selectShipData(2) should return p2ShipData reference', () => {
        expect(battle.selectShipData(2)).toBe(battle.p2ShipData);
    });

    test('selectAttackData(1) should return p1AttackData reference', () => {
        expect(battle.selectAttackData(1)).toBe(battle.p1AttackData);
    });

    test('selectAttackData(2) should return p2AttackData reference', () => {
        expect(battle.selectAttackData(2)).toBe(battle.p2AttackData);
    });
});

describe('Battle - Ship Placement Validation', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('shipCordsFromStartDirectionLength should return an array', () => {
        const result = battle.shipCordsFromStartDirectionLength('0:0', 'right', 3);
        expect(Array.isArray(result)).toBe(true);
    });

    test('shipCordsFromStartDirectionLength should generate correct cells going right', () => {
        const result = battle.shipCordsFromStartDirectionLength('0:0', 'right', 3);
        expect(result).toEqual([[0, 0], [1, 0], [2, 0]]);
    });

    test('shipCordsFromStartDirectionLength should generate correct cells going down', () => {
        const result = battle.shipCordsFromStartDirectionLength('0:0', 'down', 3);
        expect(result).toEqual([[0, 0], [0, 1], [0, 2]]);
    });

    test('validateShipPlacement should return empty array for valid placement', () => {
        const cells = battle.shipCordsFromStartDirectionLength('0:0', 'right', 3);
        const result = battle.validateShipPlacement(cells);
        expect(result).toEqual([]);
    });

    test('validateShipPlacement should return invalid cells for out of bounds', () => {
        const cells = battle.shipCordsFromStartDirectionLength('9:0', 'right', 3);
        const result = battle.validateShipPlacement(cells);
        expect(result.length).toBeGreaterThan(0);
    });
});

describe('Battle - Ship Deployment and Management', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('deployShip should mark cells as ship in shipData', () => {
        const cells = battle.shipCordsFromStartDirectionLength('0:0', 'right', 3);
        battle.deployShip(cells);
        
        expect(battle.p1ShipData['0:0']).toBe('ship');
        expect(battle.p1ShipData['1:0']).toBe('ship');
        expect(battle.p1ShipData['2:0']).toBe('ship');
    });

    test('deployShip should save ship to shipList', () => {
        const cells = battle.shipCordsFromStartDirectionLength('0:0', 'right', 3);
        battle.deployShip(cells);
        
        expect(Object.keys(battle.p1ShipList).length).toBe(1);
    });

    test('identifyShipFromCell should return ship coordinates', () => {
        const cells = battle.shipCordsFromStartDirectionLength('0:0', 'right', 3);
        battle.deployShip(cells);
        
        const result = battle.identifyShipFromCell('0:0');
        expect(result).toBeDefined();
    });
});

describe('Battle - Attack Logic', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
        // Deploy a ship for player 1
        const cells = battle.shipCordsFromStartDirectionLength('0:0', 'right', 3);
        battle.deployShip(cells);
    });

    test('attack on ship should mark as hit', () => {
        battle.playerTurn = 2;
        battle.attack('0:0');
        
        expect(battle.p1ShipData['0:0']).toBe('hit');
        expect(battle.p2AttackData['0:0']).toBe('hit');
    });

    test('attack on empty cell should mark as miss', () => {
        battle.playerTurn = 2;
        battle.attack('5:5');
        
        expect(battle.p1ShipData['5:5']).toBe('miss');
        expect(battle.p2AttackData['5:5']).toBe('miss');
    });

    test('attack should return hit result when targeting ship', () => {
        battle.playerTurn = 2;
        const result = battle.attack('0:0');
        
        expect(result[0]).toBe('hit');
    });

    test('attack should return miss result when targeting empty cell', () => {
        battle.playerTurn = 2;
        const result = battle.attack('5:5');
        
        expect(result[0]).toBe('miss');
    });
});

describe('Battle - Turn Management', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('endTurn should switch from player 1 to player 2', () => {
        battle.playerTurn = 1;
        battle.endTurn();
        expect(battle.playerTurn).toBe(2);
    });

    test('endTurn should switch from player 2 to player 1', () => {
        battle.playerTurn = 2;
        battle.endTurn();
        expect(battle.playerTurn).toBe(1);
    });
});

describe('Battle - Reset and Random Cells', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
    });

    test('testChangeRandomCells should fill random cells', () => {
        battle.testChangeRandomCells();
        
        const hasShips = Object.keys(battle.p1ShipData).length > 0;
        expect(hasShips).toBe(true);
    });

    test('testResetMaps should clear all data', () => {
        battle.p1ShipData['0:0'] = 'ship';
        battle.p2ShipData['1:1'] = 'hit';
        
        battle.testResetMaps();
        
        expect(battle.p1ShipData).toEqual({});
        expect(battle.p2ShipData).toEqual({});
        expect(battle.p1AttackData).toEqual({});
        expect(battle.p2AttackData).toEqual({});
    });
});

describe('Battle - Game Over Logic', () => {
    let battle;

    beforeEach(() => {
        battle = new Battle('gameId');
        battle.testResetMaps();
    });

    test('checkGameOver should return 0 when both players have ships', () => {
        battle.p1ShipData['0:0'] = 'ship';
        battle.p2ShipData['0:0'] = 'ship';
        
        expect(battle.checkGameOver()).toBe(0);
    });

    test('checkGameOver should return 1 when player 1 wins', () => {
        battle.p1ShipData['0:0'] = 'ship';
        battle.p2ShipData['0:0'] = 'hit';
        
        expect(battle.checkGameOver()).toBe(1);
    });

    test('checkGameOver should return 2 when player 2 wins', () => {
        battle.p1ShipData['0:0'] = 'hit';
        battle.p2ShipData['0:0'] = 'ship';
        
        expect(battle.checkGameOver()).toBe(2);
    });

    test('checkGameOver should return 0 with mixed ship states', () => {
        battle.p1ShipData['0:0'] = 'ship';
        battle.p1ShipData['0:1'] = 'hit';
        battle.p2ShipData['0:0'] = 'hit';
        battle.p2ShipData['0:1'] = 'ship';
        
        expect(battle.checkGameOver()).toBe(0);
    });
});

describe('LocalCommand - Integration', () => {
    beforeEach(() => {
        // Clear battleList before each test
        Object.keys(battleList).forEach(key => delete battleList[key]);
    });

    test('createInstance should create and store a battle', () => {
        createInstance();
        
        const gameIds = Object.keys(battleList);
        expect(gameIds.length).toBeGreaterThan(0);
    });

    test('created battle should have correct structure', () => {
        createInstance();
        
        const gameIds = Object.keys(battleList);
        const battle = battleList[gameIds[0]];
        
        expect(battle).toBeDefined();
        expect(typeof battle).toBe('object');
        expect(battle.player1Id).toBeDefined();
        expect(battle.player2Id).toBeDefined();
    });

    test('player IDs should be strings and different', () => {
        createInstance();
        
        const gameIds = Object.keys(battleList);
        const battle = battleList[gameIds[0]];
        
        expect(typeof battle.player1Id).toBe('string');
        expect(typeof battle.player2Id).toBe('string');
        expect(battle.player1Id).not.toBe(battle.player2Id);
    });
});

describe('LocalCommand - inputHandler', () => {
    let testGameId;
    let player1Id;
    let player2Id;

    beforeEach(() => {
        // Clear battleList before each test
        Object.keys(battleList).forEach(key => delete battleList[key]);
        
        createInstance();
        const gameIds = Object.keys(battleList);
        testGameId = gameIds[0];
        const battle = battleList[testGameId];
        player1Id = battle.player1Id;
        player2Id = battle.player2Id;
    });

    test('should return error for invalid game ID', () => {
        const details = {
            gameId: 'INVALID',
            playerId: player1Id,
            actionDetails: ['5:5']
        };
        
        const result = JSON.parse(inputHandler(JSON.stringify(details)));
        
        expect(result.error).toBeDefined();
        expect(result.error).toBe('Invalid Game ID');
    });

    test('should return valid response for valid game ID', () => {
        const details = {
            gameId: testGameId,
            playerId: player1Id,
            actionDetails: [['0:0', 'right', 3]],
            action: 'deploy'
        };
        
        const result = JSON.parse(inputHandler(JSON.stringify(details)));
        
        expect(result).toBeDefined();
        expect(result.error).toBeUndefined();
    });

    test('should return fleet data after deployment', () => {
        const details = {
            gameId: testGameId,
            playerId: player1Id,
            actionDetails: [['0:0', 'right', 3]],
            action: 'deploy'
        };
        
        const result = JSON.parse(inputHandler(JSON.stringify(details)));
        
        expect(result.fleet).toBeDefined();
        expect(Object.keys(result.fleet).length).toBeGreaterThan(0);
    });

    test('should return correct player turn in response', () => {
        const details = {
            gameId: testGameId,
            playerId: player1Id,
            actionDetails: [['0:0', 'right', 3]],
            action: 'deploy'
        };
        
        const result = JSON.parse(inputHandler(JSON.stringify(details)));
        
        expect(result.playerTurn).toBeDefined();
        expect(result.playerTurn).toBe(1);
    });

    test('should return actionData for deployment', () => {
        const details = {
            gameId: testGameId,
            playerId: player1Id,
            actionDetails: [['0:0', 'right', 3]],
            action: 'deploy'
        };
        
        const result = JSON.parse(inputHandler(JSON.stringify(details)));
        
        expect(result.actionData).toBeDefined();
    });
});

describe('LocalCommand - Data Isolation', () => {
    test('different game instances should have isolated data', () => {
        Object.keys(battleList).forEach(key => delete battleList[key]);
        
        createInstance();
        const gameIds1 = Object.keys(battleList);
        const testGameId1 = gameIds1[0];
        
        createInstance();
        const gameIds2 = Object.keys(battleList);
        const testGameId2 = gameIds2[gameIds2.length - 1];
        
        expect(testGameId1).not.toBe(testGameId2);
        
        const battle1 = battleList[testGameId1];
        const battle2 = battleList[testGameId2];
        
        expect(battle1.player1Id).not.toBe(battle2.player1Id);
    });

    test('fleet data should be isolated between game instances', () => {
        Object.keys(battleList).forEach(key => delete battleList[key]);
        
        createInstance();
        const gameIds1 = Object.keys(battleList);
        const testGameId1 = gameIds1[0];
        const player1Id1 = battleList[testGameId1].player1Id;
        
        // Deploy ship in first game
        const details1 = {
            gameId: testGameId1,
            playerId: player1Id1,
            actionDetails: [['0:0', 'right', 3]],
            action: 'deploy'
        };
        JSON.parse(inputHandler(JSON.stringify(details1)));
        
        createInstance();
        const gameIds2 = Object.keys(battleList);
        const testGameId2 = gameIds2[gameIds2.length - 1];
        
        const fleet1 = JSON.stringify(battleList[testGameId1].p1ShipData);
        const fleet2 = JSON.stringify(battleList[testGameId2].p1ShipData);
        
        expect(fleet1).not.toBe(fleet2);
    });
});

describe('LocalCommand - Attack Flow', () => {
    let testGameId;
    let player1Id;
    let player2Id;

    beforeEach(() => {
        Object.keys(battleList).forEach(key => delete battleList[key]);
        
        createInstance();
        const gameIds = Object.keys(battleList);
        testGameId = gameIds[0];
        const battle = battleList[testGameId];
        player1Id = battle.player1Id;
        player2Id = battle.player2Id;
        
        // Deploy ships for both players
        const p1Deploy = {
            gameId: testGameId,
            playerId: player1Id,
            actionDetails: [['0:0', 'right', 3]],
            action: 'deploy'
        };
        JSON.parse(inputHandler(JSON.stringify(p1Deploy)));
        
        battleList[testGameId].endTurn();
        
        const p2Deploy = {
            gameId: testGameId,
            playerId: player2Id,
            actionDetails: [['5:5', 'down', 3]],
            action: 'deploy'
        };
        JSON.parse(inputHandler(JSON.stringify(p2Deploy)));
        
        battleList[testGameId].endTurn();
    });

    test('attack on opponent ship should return hit', () => {
        const details = {
            gameId: testGameId,
            playerId: player1Id,
            actionDetails: [['5:5']],
            action: 'attack'
        };
        
        const result = JSON.parse(inputHandler(JSON.stringify(details)));
        
        expect(result.actionData[0]).toBe('hit');
    });

    test('attack data should be recorded in response', () => {
        const details = {
            gameId: testGameId,
            playerId: player1Id,
            actionDetails: [['5:5']],
            action: 'attack'
        };
        
        const result = JSON.parse(inputHandler(JSON.stringify(details)));
        
        expect(result.attacks).toBeDefined();
        expect(Object.keys(result.attacks).length).toBeGreaterThan(0);
    });
});
