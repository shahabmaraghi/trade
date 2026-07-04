"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import StarterKit from "@tiptap/starter-kit"
import ImageResize from "tiptap-extension-resize-image"
import TextDirection from "tiptap-text-direction"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { Toggle } from "@/components/admin/ui/toggle"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  LinkIcon,
  Unlink,
  ImageIcon,
  Undo,
  Redo,
} from "lucide-react"
import "./tiptap-editor.css"

interface TiptapEditorProps {
  initialContent?: string
  onChange?: (html: string) => void
  rtl?: boolean
  placeholder?: string
}

export default function TiptapEditor({
  initialContent = "",
  onChange,
  rtl = false,
  placeholder = "محتوا را وارد کنید...",
}: TiptapEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          HTMLAttributes: { class: "editor-heading" },
        },
      }),
      ImageResize,
      TextDirection.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md mx-auto",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "editor prose text-foreground prose-sm sm:prose dark:prose-invert focus:outline-none max-w-full min-h-[150px] p-4",
        dir: rtl ? "rtl" : "ltr",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (editor && initialContent && !editor.isEmpty && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  const addImage = () => {
    console.log("addImage")
    if (imageInputRef.current) {
      imageInputRef.current.click()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("start upload handler", e.target.files, editor)
    if (e.target.files?.length && editor) {
      const file = e.target.files[0]

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)

      try {
        // Upload the file to the server
        const response = await fetch("/api/admin/blog/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()

        // Insert the image with the S3 URL
        if (data.url && editor) {
          editor.chain().focus().setImage({ src: data.url }).run()
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        // Fallback to local preview if upload fails
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result && editor) {
            editor
              .chain()
              .focus()
              .setImage({ src: event.target.result as string })
              .run()
          }
        }
        reader.readAsDataURL(file)
      }

      // Reset the input
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  const setLink = () => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) return

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className={`tiptap-editor border rounded-md overflow-hidden ${rtl ? "rtl" : "ltr"}`}>
      {editor && (
        <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            aria-label="Code"
          >
            <Code className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            aria-label="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
            aria-label="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
            aria-label="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
            aria-label="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "justify" })}
            onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
            aria-label="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle size="sm" pressed={editor.isActive("link")} onPressedChange={setLink} aria-label="Link">
            <LinkIcon className="h-4 w-4" />
          </Toggle>
          {editor.isActive("link") && (
            <Toggle size="sm" onPressedChange={() => editor.chain().focus().unsetLink().run()} aria-label="Unlink">
              <Unlink className="h-4 w-4" />
            </Toggle>
          )}

          <Toggle size="sm" onPressedChange={() => imageInputRef.current?.click()} aria-label="Image">
            <ImageIcon className="h-4 w-4" />
          </Toggle>
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            onPressedChange={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>
      )}

      <EditorContent editor={editor} className="min-h-[200px]" />

      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center bg-background border rounded-md shadow-md overflow-hidden">
            <Toggle
              size="sm"
              pressed={editor.isActive("bold")}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
              className="rounded-none"
              aria-label="Bold"
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("italic")}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
              className="rounded-none"
              aria-label="Italic"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("underline")}
              onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
              className="rounded-none"
              aria-label="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("link")}
              onPressedChange={setLink}
              className="rounded-none"
              aria-label="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </div>
        </BubbleMenu>
      )}
    </div>
  )
}
