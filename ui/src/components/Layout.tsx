import { Link } from "react-router-dom";
import { FaGithubAlt } from "react-icons/fa";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import { SiMatrix } from "react-icons/si";
import Logo from "./Logo";
import { ImportUserGames } from "./ImportUserGames";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="p-8 pb-4 flex justify-between">
        <div className="flex space-x-1">
          <a className="text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center" href="https://discord.gg/E9sPRZqpDT">
            <FaDiscord className="w-5 h-5" />
          </a>
          <a className="text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center" href="https://github.com/devflowinc/steamdb">
            <FaGithubAlt className="w-5 h-5" />
          </a>
          <a className="text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 inline-flex items-center"href="https://x.com/trieveai">
            <FaXTwitter className="w-5 h-5" />
          </a>
          <a className="text-muted dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-3 inline-flex items-center" href="https://matrix.to/#/#trieve-general:trieve.ai">
            <SiMatrix className="w-5 h-5" />
          </a>
        </div>
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
