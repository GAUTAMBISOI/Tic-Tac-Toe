import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import Menu from "./Menu";
import { Copy } from "lucide-react";

const socket = io("localhost:5000");
const initialBoard = Array(9).fill(null);
const Board = () => {
  const [board, setBoard] = useState(initialBoard);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [player, setPlayer] = useState("");
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);

  const createRoom = () => {
    socket.emit("createRoom", (id) => {
      setRoomId(id);
      setJoined(true);
      setPlayer("X");
    });
  };

  const joinedRoom = () => {
    const id = prompt("ENTER THE ID");
    if (!id.trim()) {
      toast.error("Please enter a valid ID");
      return;
    }
    socket.emit("joinedRoom", id, (res) => {
      if (res.success) {
        toast.success("Succesfully added");
        setRoomId(id);
        setJoined(true);
        setPlayer("0");
      } else {
        toast.error("Failed to joined room ");
      }
    });
  };

  const isMyTurn = () => {
    return (isXTurn && player === "X") || (!isXTurn && player === "0");
  };

  const checkWinner = (board) => {
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
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setWinningLine(line);
        return;
      }
    }
  };
  const handleClick = (idx) => {
    if (board[idx] || !isMyTurn() || winner) return;
    const newBoard = [...board];
    newBoard[idx] = player;
    setBoard(newBoard);
    socket.emit("makeMove", { roomId, index: idx, player });
    checkWinner(newBoard);
    setIsXTurn(!isXTurn);
  };

  useEffect(() => {
    socket.on("opponentMove", ({ index, player: p }) => {
      const newBoard = [...board];
      newBoard[index] = p;
      setBoard(newBoard);
      checkWinner(newBoard);
      setIsXTurn(!isXTurn);
    });
    return () => socket.off("opponentMove");
  }, [board, isXTurn]);

  const copyText = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard");
  };

  const handleRematch = () => {
    setBoard(initialBoard);
    setWinner(null);
    setWinningLine([]);
    setIsXTurn(true);
    socket.emit("rematch", roomId);
  };

  useEffect(() => {
    socket.on("rematch", () => {
      setBoard(initialBoard);
      setWinner(null);
      setWinningLine([]);
      setIsXTurn(true);
      toast.success("Rematch Started");
    });

    return ()=>socket.off("rematch");
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white bg-[#101029]">
      <h1 className="text-4xl font-extrabold mb-6">Tic Tac Toe</h1>
       {! joined ? <Menu createRoom={createRoom} joinedRoom={joinedRoom}/> : 
      <>
        <div className="flex items-center space-x-2 mb-6">
          <span className="font-mono text-lg font-semibold bg-white text-gray-800 px-3 py-1 rounded-lg shadow-lg">
            {" "}
            Room : {roomId}
          </span>
          <Copy
            onClick={copyText}
            size={18}
            className="text-yellow-300 hover:text-yellow-900 cursor-pointer"
          />
        </div>

        {/* board */}
        <div className="grid grid-cols-3 gap-4">
          {board.map((cell, idx) => {
            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                className={`w-24 h-24 text-3xl font-bold flex items-center justify-center bg-white text-gray-800 shadow-lg rounded-lg ${
                  winningLine.includes(idx)
                    ? "bg-yellow-300 text-yellow-900"
                    : ""
                } ${
                  !isMyTurn() || cell || winner
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:scale-105 transform transition-all"
                }`}
                disabled={!isMyTurn() || cell || winner}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {winner && <p className="mt-6 text-2xl font-bold text-yellow-300">{winner} wins</p>}

        {(winner ||
          board.every((cell) => cell)) && (
            <button
              onClick={handleRematch}
              className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-md text-white"
            >
              Rematch
            </button>
          )}

        {!isMyTurn() && !winner && !board.every((cell) => cell) && (
          <p className="mt-6 text-lg text-gray-200">
            Waiting for opponent's move....
          </p>
        )}
      </>

     }
    </div>
  );
};

export default Board;
