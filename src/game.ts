// Selection of functions and classes for automatically running a game
// synchrously, not with gui (cli or automated)

import { PlayerInterface } from "./azul.js";
import { GameState, State } from "./state.js";

/**
 * Represents the final result of a completed Azul game.
 * Contains information about player scores, the winner (if any),
 * and which player started the game.
 */
export class GameResult {
    constructor(
        public scores: Array<number>,
        public winner: PlayerInterface | undefined,
        public starter: PlayerInterface,
    ) {}
}

// Class to run a game with AI players
export class Game {
    // List of players in the game
    players: Array<PlayerInterface> = [];

    constructor(public gamestate: GameState = new GameState()) {}

    // Add a player to the game
    addPlayer(player: PlayerInterface): void {
        this.players.push(player);
    }

    // Runs the game until completion
    play(): GameResult {
        // start game on the gamestate, goes to first players first turn
        if (this.gamestate.state == State.start) {
            this.gamestate.newGame(this.players.length);
        }

        // initialise each player
        this.players.forEach((player) => {
            player.newRound(this.gamestate);
        });
        // run through game
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // get the move from active player
            const move = this.players[this.gamestate.activePlayer].getMove(this.gamestate);
            // play the move
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.gamestate.playMove(move!);
            // go to next turn
            if (!this.gamestate.nextTurn()) {
                // end of turns, go to next round
                if (!this.gamestate.endRound()) {
                    // end of game
                    const scores = this.gamestate.playerBoards.map((pb) => pb.score);
                    let winner = undefined;
                    let max = -Infinity;
                    for (let ind = 0; ind < this.players.length; ind++) {
                        if (scores[ind] > max) {
                            max = scores[ind];
                            winner = this.players[ind];
                        } else if (scores[ind] == max) {
                            winner = undefined;
                        }
                    }

                    return new GameResult(
                        scores,
                        winner,
                        this.players[this.gamestate.activePlayer],
                    );
                }
                // update players with new round
                this.players.forEach((player) => {
                    player.newRound(this.gamestate);
                });
            }
        }
    }
}
