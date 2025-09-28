import React from "react";

const Menu = ({ joinedRoom, createRoom }) => {
  return (
    <div className="flex gap-3 items-center">
      <button
        onClick={createRoom}
        className="text-gray-800 font-semibold bg-white shadow-amber-50 text-lg px-6 py-3 hover:bg-gray-400 rounded-lg cursor-pointer transition-all"
      >
        Create Room
      </button>
      <button
        onClick={joinedRoom}
        className="text-gray-800 font-semibold bg-yellow-500 shadow-amber-50 text-lg px-6 py-3 hover:bg-yellow-700 rounded-lg cursor-pointer transition-all"
      >
        Joined Room
      </button>
    </div>
  );
};

export default Menu;
