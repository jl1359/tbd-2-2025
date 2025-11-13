import logo from "@/assets/logo.png";

export default function Brand() {
  return (
    <header className="mb-3 leading-none text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-[#18b456]">
        Digital Barter
      </h1>
      <div className="mt-2 inline-flex items-center gap-2 font-bold text-sm text-[#17a852]">
        <span>green credits</span>
        <img
          src={logo}
          alt="Logo hoja"
          className="w-[22px] h-[22px] select-none"
        />
      </div>
    </header>
  );
}
