// import { getRequestConfig } from "next-intl/server";
// import { routing } from "./routing";
// import { cookies } from "next/headers";

// export default getRequestConfig(async () => {
//   const cookieStore = await cookies(); // 🔥 Chờ lấy cookies
//   let locale = cookieStore.get("locale")?.value || routing.defaultLocale; // 🛠 Lấy locale từ Cookie

//   if (!routing.locales.includes(locale as any)) {
//     locale = routing.defaultLocale;
//   }

//   console.log("🌍 Server-side detected locale:", locale);

//   return {
//     locale: locale as "en" | "vi",
//     messages: (await import(`../../messages/${locale}.json`)).default,
//   };
// });
