import { FlickeringGrid } from "components/magicui/flickering-grid";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      {/* <div className="bg-gradient-to-br from-primary hidden lg:block via-black to-primary/50" /> */}
      <div>
        <FlickeringGrid
          squareSize={4}
          gridGap={5}
          maxOpacity={0.5}
          flickerChance={0.2}
          color="#03fc88"
        />
      </div>
      <Outlet />
    </div>
  );
}