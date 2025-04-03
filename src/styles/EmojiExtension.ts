// import { Node, mergeAttributes } from "@tiptap/core";

// export const EmojiExtension = Node.create({
//   name: "emoji",

//   inline: true,
//   group: "inline",
//   draggable: false,

//   addAttributes() {
//     return {
//       emoji: {
//         default: "😀",
//       },
//     };
//   },

//   parseHTML() {
//     return [
//       {
//         tag: "span[data-emoji]",
//       },
//     ];
//   },

//   renderHTML({ node }) {
//     return ["span", { "data-emoji": node.attrs.emoji }, node.attrs.emoji];
//   },

//   addCommands() {
//     return {
//       addEmoji:
//         (emoji: string) =>
//         ({ chain }) => {
//           return chain().insertContent(`<span data-emoji="${emoji}">${emoji}</span>`).run();
//         },
//     };
//   },
// });
