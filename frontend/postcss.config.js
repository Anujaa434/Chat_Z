// PostCSS config for Tailwind (new plugin package)
import tailwind from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwind, autoprefixer],
};
