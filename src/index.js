import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
        <button className={"square" + props.winner} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, winner) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winner={winner}
            />
        );
    }

    render() {
        const rows = Array(3).fill(null)
            .map((row, i) => {
                const squares = Array(3).fill(null)
                    .map((square, j) => {
                        let index = (i * 3) + j;
                        const winnerClass = this.props.winners.length > 0 && this.props.winners.indexOf(index) >= 0 ? " winner": "";
                        return this.renderSquare(index, winnerClass)
                    });
                return <div className="board-row">{squares}</div>
            });
        return <div>{rows}</div>
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                last: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            reverseMoves: false,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                last: i,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    toggleSort() {
        this.setState({
            reverseMoves: !this.state.reverseMoves,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const {winner, winningSquares} = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + " (" + Math.floor(step.last/3) + ", " + (step.last%3) + ")":
                'Go to game start';
            return (
                <li key={move} >
                    <button
                        onClick={() => this.jumpTo(move)}
                        className={move === this.state.stepNumber ? "current-move": ""}
                    >
                        {desc}
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else if (history.length > 9 && this.state.stepNumber >= 9) {
            status = 'Game is a draw';
        }
        else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winners={winningSquares ? winningSquares : []}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{this.state.reverseMoves ? moves.reverse() : moves}</ol>
                    <button onClick={() => this.toggleSort()}>Sort Moves</button>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game/>,
    document.getElementById('root')
);

// helper function
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                winningSquares: lines[i],
            };
        }
    }
    return {winner: null, winningSquares: null};
}
