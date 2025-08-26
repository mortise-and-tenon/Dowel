/**
 * 主题深、浅切换
 */
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
export default function ThemeSwitcher() {
  return (
    <label className="swap swap-rotate">
      {/* this hidden checkbox controls the state */}
      <input type="checkbox" className="theme-controller" value="dark" />

      {/* sun icon */}
      <HiOutlineSun className="swap-off text-2xl" />

      {/* moon icon */}
      <HiOutlineMoon className="swap-on text-2xl" />
    </label>
  );
}
