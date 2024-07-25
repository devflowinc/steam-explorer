import { Link } from "react-router-dom";
import Logo from "./Logo";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <header className="my-12 flex justify-center">
        <Link to={"/"}>
          <Logo className="w-[300px] h-auto" />
        </Link>
      </header>
      <div className="container my-12"> {children}</div>
    </div>
  );
};
