import React from "react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 flex justify-center items-center px-6 py-6 bg-slate-800 border-t h-18 z-[100]">
      <h1 className="font-bold text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl truncate">
        POS
      </h1>
    </header>
  );
};

export default Header;
