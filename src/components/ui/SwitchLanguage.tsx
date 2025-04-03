// "use client";

// import Cookies from "js-cookie";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function LanguageSwitcher() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [locale, setLocale] = useState<string | undefined>(undefined);

//   useEffect(() => {
//     const storedLocale = Cookies.get("locale");
//     console.log("Detected locale from Cookie:", storedLocale);

//     if (storedLocale) {
//       setLocale(storedLocale);
//     }
//   }, []);

//   const changeLanguage = (newLocale: string) => {
//     Cookies.set("locale", newLocale, { expires: 365, path: "/" });
//     setLocale(newLocale);

//     const newPath = getPathname({ href: pathname, locale: newLocale });
//     console.log("Switching to:", newLocale, "New Path:", newPath);

//     router.replace(newPath);
//   };

//   return (
//     <div className="flex gap-2">
//       <button
//         onClick={() => changeLanguage("vi")}
//         className={`p-2 rounded ${
//           locale === "vi" ? "bg-blue-500 text-white" : "bg-gray-200"
//         }`}
//       >
//         🇻🇳
//       </button>
//       <button
//         onClick={() => changeLanguage("en")}
//         className={`p-2 rounded ${
//           locale === "en" ? "bg-blue-500 text-white" : "bg-gray-200"
//         }`}
//       >
//         🇺🇸
//       </button>
//     </div>
//   );
// }
