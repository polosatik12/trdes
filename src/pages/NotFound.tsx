import bg404 from "@/assets/404-bg.png";

const NotFound = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0f14]">
      <img
        src={bg404}
        alt="404 — страница не найдена"
        className="absolute inset-0 w-full h-full object-cover object-top sm:object-center"
      />
      <div className="absolute inset-x-0 bottom-[env(safe-area-inset-bottom,16px)] pb-6 sm:pb-12 flex justify-center">
        <a
          href="/"
          className="mx-4 w-full max-w-xs sm:w-auto sm:max-w-none text-center px-8 py-4 sm:py-3 rounded-lg bg-white/90 text-[#003051] font-bold text-base sm:text-lg hover:bg-white transition-colors shadow-lg"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  );
};

export default NotFound;
