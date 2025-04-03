import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Tắt lỗi unused variables
      "@typescript-eslint/no-explicit-any": "off", // Tắt lỗi use of any
      "react-hooks/exhaustive-deps": "off", // Tắt cảnh báo dependencies của React Hooks
    },
  },
];

export default eslintConfig;
