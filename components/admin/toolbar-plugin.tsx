"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useCallback, useEffect, useState } from "react"
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical"
import { $wrapNodes } from "@lexical/selection"
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from "@lexical/rich-text"
import { $createListNode } from "@lexical/list"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react"

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode())
      }
    })
  }

  const formatList = (listType: "bullet" | "number") => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createListNode(listType))
      }
    })
  }

  return (
    <div className="toolbar flex flex-wrap gap-1 p-2 border-b bg-gray-50">
      <button
        className={`p-1 rounded hover:bg-gray-200 ${isBold ? "bg-gray-200" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        title="Bold"
        type="button"
        aria-label="Format text as bold"
      >
        <Bold size={18} />
      </button>
      <button
        className={`p-1 rounded hover:bg-gray-200 ${isItalic ? "bg-gray-200" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        title="Italic"
        type="button"
        aria-label="Format text as italic"
      >
        <Italic size={18} />
      </button>
      <button
        className={`p-1 rounded hover:bg-gray-200 ${isUnderline ? "bg-gray-200" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        title="Underline"
        type="button"
        aria-label="Format text as underlined"
      >
        <Underline size={18} />
      </button>
      <button
        className={`p-1 rounded hover:bg-gray-200 ${isStrikethrough ? "bg-gray-200" : ""}`}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
        title="Strikethrough"
        type="button"
        aria-label="Format text with a strikethrough"
      >
        <Strikethrough size={18} />
      </button>
      <span className="w-px h-6 mx-1 bg-gray-300" />
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => formatHeading("h1")}
        title="Heading 1"
        type="button"
        aria-label="Format as heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => formatHeading("h2")}
        title="Heading 2"
        type="button"
        aria-label="Format as heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => formatQuote()}
        title="Quote"
        type="button"
        aria-label="Format as blockquote"
      >
        <Quote size={18} />
      </button>
      <span className="w-px h-6 mx-1 bg-gray-300" />
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => formatList("bullet")}
        title="Bullet List"
        type="button"
        aria-label="Format as bullet list"
      >
        <List size={18} />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => formatList("number")}
        title="Numbered List"
        type="button"
        aria-label="Format as numbered list"
      >
        <ListOrdered size={18} />
      </button>
      <span className="w-px h-6 mx-1 bg-gray-300" />
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        title="Align Left"
        type="button"
        aria-label="Align text to the left"
      >
        <AlignLeft size={18} />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        title="Align Center"
        type="button"
        aria-label="Align text to the center"
      >
        <AlignCenter size={18} />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        title="Align Right"
        type="button"
        aria-label="Align text to the right"
      >
        <AlignRight size={18} />
      </button>
      <span className="w-px h-6 mx-1 bg-gray-300" />
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        title="Undo"
        type="button"
        aria-label="Undo last change"
      >
        <Undo size={18} />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-200"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        title="Redo"
        type="button"
        aria-label="Redo last undone change"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}
