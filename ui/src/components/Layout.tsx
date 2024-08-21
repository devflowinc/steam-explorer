import { Link } from "react-router-dom";
import Logo from "./Logo";
import { ImportUserGames } from "./ImportUserGames";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="p-8 pb-4 flex justify-end">
        <ImportUserGames />
      </div>
      <header className="my-12 mt-4 flex justify-center">
        <Link to={"/"}>
          <Logo className="w-[300px] h-auto" />
          <h1 className="font-thin italic text-center mt-2">
            when search isn't enough
          </h1>
        </Link>
      </header>

      <div className="container my-12"> {children}</div>
    </div>
  );
};
