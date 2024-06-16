// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// Include the game logic here
class Player {
    makeMove(game: Game, row: number, col: number): void { }
}

class PlayerX extends Player {
    makeMove(game: Game, row: number, col: number): void {
        game.board[row][col] = 'X';
    }
}

class PlayerO extends Player {
    makeMove(game: Game, row: number, col: number): void {
        game.board[row][col] = 'O';
    }
}

class PlayerFactory {
    createPlayer(type: string): Player {
        if (type === 'X') {
            return new PlayerX();
        } else if (type === 'O') {
            return new PlayerO();
        }
        throw new Error("Invalid player type");
    }
}

class Game {
    board: string[][];
    currentPlayer: Player;
    isGameOver: boolean;
    moveCount: number;
    constructor() {
        this.board = [
            ['-', '-', '-'],
            ['-', '-', '-'],
            ['-', '-', '-']
        ];
        const playerFactory = new PlayerFactory();
        this.currentPlayer = playerFactory.createPlayer('X');
        this.isGameOver = false;
        this.moveCount = 0;
    }

    makeMove(row: number, col: number): void {
        if (this.board[row][col] === '-') {
            this.currentPlayer.makeMove(this, row, col);
            this.moveCount++;
            this.currentPlayer = this.currentPlayer instanceof PlayerX ? new PlayerO() : new PlayerX();
        }
    }
    checkWinner(): string | null {

        // Kiểm tra hàng
        for (let i = 0; i < 3; i++) {
            if (this.board[i][0] === this.board[i][1] && this.board[i][1] === this.board[i][2]) {
                if (this.board[i][0] !== '-') {
                    this.isGameOver = true;
                    return this.board[i][0];
                }
            }
        }

        // Kiểm tra cột
        for (let j = 0; j < 3; j++) {
            if (this.board[0][j] === this.board[1][j] && this.board[1][j] === this.board[2][j]) {
                if (this.board[0][j] !== '-') {
                    this.isGameOver = true;
                    return this.board[0][j];
                }
            }
        }

        // Kiểm tra đường chéo
        if (this.board[0][0] === this.board[1][1] && this.board[1][1] === this.board[2][2] ||
            this.board[0][2] === this.board[1][1] && this.board[1][1] === this.board[2][0]) {
            if (this.board[1][1] !== '-') {
                this.isGameOver = true;
                return this.board[1][1];
            }
        }

        // Kiểm tra hòa
        let isDraw = true;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j] === '-') {
                    isDraw = false;
                    break;
                }
            }
            if (!isDraw) break;
        }

        if (isDraw) {
             return 'Draw';
        }
        return null; // Trò chơi tiếp tục nếu không có người thắng hoặc hòa
    }

    // ...remaining methods...
}

// Usage
const game = new Game();

// Get the game board element
const gameBoard = document.getElementById('game-board');
const winnerDisplay = document.getElementById('winner-display');

// Add event listeners to each cell of the game board
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        const cell = document.getElementById(`cell-${i}-${j}`);
        cell.addEventListener('click', () => {
            if (!game.isGameOver && game.board[i][j] === '-') { // Kiểm tra nếu trò chơi chưa kết thúc
                game.makeMove(i, j);
                cell.innerText = game.board[i][j];
                setTimeout(() => {
                  const winner = game.checkWinner();
                  if (winner) {
                    alert(winner === 'Draw' ? 'Hòa!' : `Người thắng là: ${winner} sau ${game.moveCount} nước đi`);
                    if (winner !== 'Draw') {
                        document.getElementById('winner-input').style.display = 'flex'; // Hiển thị input
                      }
                  }
                }, 100);
            }
        });

    }
}

document.getElementById('submit-button').addEventListener('click', async () => {
    const name = (document.getElementById('winner-name') as HTMLInputElement).value;
    const moves = game.moveCount;
    try {
      const message = await window.electronAPI.saveWinner(name, moves);
      alert(message); // Hiển thị thông báo "Lưu thành công"
    } catch (error) {
      alert(error); // Hiển thị thông báo "Lỗi khi lưu"
    }
  });