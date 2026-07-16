import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  return (
    <header className="h-[70px] bg-[#111827] border-b border-[#1e293b] flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-white">Dashboard</h2>
      <ProfileDropdown />
    </header>
  );
}