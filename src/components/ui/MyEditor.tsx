"use client";

import { Button } from "@heroui/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { FaListOl, FaQuoteRight } from "react-icons/fa";
import { MdFormatListBulleted } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from "react-icons/fa";
import TextAlign from '@tiptap/extension-text-align'

// Component tùy chỉnh để hiển thị ảnh với resize
const ResizableImage = ({ node, updateAttributes }) => {
  const [size, setSize] = useState({
    width: node.attrs.width || 300,
    height: node.attrs.height || "auto",
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(size.width, 10) || 300;
    const startHeight = imgRef.current?.naturalHeight
      ? (startWidth / imgRef.current.naturalWidth) * imgRef.current.naturalHeight
      : parseInt(size.height, 10) || 200;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      const aspectRatio = imgRef.current
        ? imgRef.current.naturalWidth / imgRef.current.naturalHeight
        : 1;
      const newHeight = newWidth / aspectRatio;

      setSize({ width: `${newWidth}px`, height: `${newHeight}px` });

      // Cập nhật ngay lập tức để phản ánh thay đổi trong editor
      updateAttributes({ width: `${newWidth}px`, height: `${newHeight}px` });
    };

    const onMouseUp = () => {
      updateAttributes({ width: `${size.width}`, height: `${size.height}` });
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <NodeViewWrapper className="inline-block relative">
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt}
        style={{
          width: size.width,
          height: size.height,
          display: "inline-block",
        }}
      />
      <div
        ref={resizerRef}
        onMouseDown={startResizing}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "10px",
          height: "10px",
          background: "blue",
          cursor: "se-resize",
        }}
      />
    </NodeViewWrapper>
  );
};

export default function Editor({
  content,
  onChange,
}: {
  content?: string;
  onChange?: (val: string) => void;
}) {
  const [editorContent, setEditorContent] = useState(content || "");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"], // Áp dụng cho heading và paragraph
        alignments: ["left", "center", "right", "justify"], // Các kiểu căn chỉnh hỗ trợ
        defaultAlignment: "left", // Căn mặc định
      }),
      Image.extend({
        addAttributes() {
          return {
            src: { default: null },
            alt: { default: null },
            title: { default: null },
            width: { default: "300px" },
            height: { default: "auto" },
          };
        },
        parseHTML() {
          return [
            {
              tag: "img",
              getAttrs: (dom: HTMLElement) => ({
                src: dom.getAttribute("src"),
                alt: dom.getAttribute("alt"),
                title: dom.getAttribute("title"),
                width: dom.getAttribute("width"),
                height: dom.getAttribute("height"),
              }),
            },
          ];
        },
        renderHTML({ HTMLAttributes }) {
          return ["img", HTMLAttributes];
        },
        addNodeView() {
          return ReactNodeViewRenderer(ResizableImage);
        },
      }).configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: editorContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      if (onChange) onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editorContent) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      const editorDom = editor.view.dom as HTMLElement;
      editorDom.style.minHeight = "300px";
      editorDom.style.width = "100%";
      editorDom.style.padding = "10px";
      editorDom.style.overflowWrap = "break-word";
      editorDom.style.whiteSpace = "normal";
    }
  }, [editor]);

  const insertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file && editor) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          editor
            .chain()
            .focus()
            .setImage({ src, width: "300px", height: "auto" } as any)
            .run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const toolbarButtons = [
    { label: "B", action: () => editor?.chain().focus().toggleBold().run() },
    { label: "I", action: () => editor?.chain().focus().toggleItalic().run() },
    {
      label: "H1",
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "H2",
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: <MdFormatListBulleted size={20} />,
      action: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: <FaListOl size={20} />,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: <FaQuoteRight />,
      action: () => editor?.chain().focus().toggleBlockquote().run(),
    },
    {
      label: <FaImage size={20} />,
      action: insertImage,
    },
    {
      label: <FaAlignLeft size={20} />,
      action: () => editor.chain().focus().setTextAlign('left').run(),
    },
    {
      label: <FaAlignCenter size={20} />,
      action: () => editor?.chain().focus().setTextAlign("center").run(),
    },
    {
      label: <FaAlignRight size={20} />,
      action: () => editor?.chain().focus().setTextAlign("right").run(),
    },
    {
      label: <FaAlignJustify size={20} />,
      action: () => editor?.chain().focus().setTextAlign("justify").run(),
    },
  ];

  return (
    <div className="border p-3 rounded-lg shadow-md relative w-full">
      <div className="flex gap-2 mb-3 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            onPress={button.action}
            className="p-2 border rounded"
            variant="bordered"
            isIconOnly
          >
            {button.label}
          </Button>
        ))}
      </div>

      <EditorContent
        editor={editor}
        className="w-full border rounded-lg focus:outline-none mt-3 custom-editor"
        style={{
          overflowWrap: "break-word",
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      />
    </div>
  );
}