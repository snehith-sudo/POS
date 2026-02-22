import React from "react";

const Header = () => {
  const toggleMobile = () => {
    window.dispatchEvent(new Event("toggleMobileSidebar"));
  };

  return (
    <header className="fixed top-0 left-0 right-0 flex items-center px-4 md:px-6 py-3 bg-slate-800 h-14 z-[100]">
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobile}
        aria-label="Toggle sidebar"
        className="mr-3 p-2 rounded-md text-white md:hidden bg-white/5 hover:bg-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1 flex items-center justify-center md:justify-start">
        <h1 className="font-bold text-white text-lg sm:text-2xl md:text-3xl truncate">POS</h1>
      </div>
    </header>
  );
};

export default Header;
