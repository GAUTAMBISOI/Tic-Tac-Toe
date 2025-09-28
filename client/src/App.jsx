import React from "react";
import { Toaster } from "react-hot-toast";
import Board from "./components/Board";

const App = () => {
  return (
    <div>
      <Board />
      <Toaster />
    </div>
  );
};

export default App;
