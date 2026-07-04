"use client"

import { useEffect, useState } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { ListItemNode, ListNode } from "@lexical/list"
import { CodeHighlightNode, CodeNode } from "@lexical/code"
import { AutoLinkNode, LinkNode } from "@lexical/link"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { TRANSFORMERS } from "@lexical/markdown"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import { $getRoot, $insertNodes } from "lexical"
import ToolbarPlugin from "./toolbar-plugin"

// Define theme for the editor
const theme = {
  ltr: "ltr",
  rtl: "rtl",
  paragraph: "mb-1",
  quote: "border-l-4 border-gray-300 pl-4 italic",
  heading: {
    h1: "text-2xl font-bold",
    h2: "text-xl font-bold",
    h3: "text-lg font-bold",
    h4: "text-base font-bold",
    h5: "text-sm font-bold",
  },
  list: {
    ol: "list-decimal pl-5",
    ul: "list-disc pl-5",
    nested: {
      listitem: "pl-2",
    },
  },
  image: "max-w-full h-auto",
  link: "text-blue-500 underline",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
  },
}

// Define nodes for the editor
const nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
]

// HTML Import Plugin
function HtmlImportPlugin({ initialHtml, setImportComplete }: { initialHtml: string; setImportComplete: () => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!initialHtml) {
      setImportComplete()
      return
    }

    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(initialHtml, "text/html")
      const nodes = $generateNodesFromDOM(editor, dom)
      $getRoot().clear()
      $insertNodes(nodes)
      setImportComplete()
    })
  }, [editor, initialHtml, setImportComplete])

  return null
}

interface LexicalEditorProps {
  initialContent?: string
  onChange?: (html: string) => void
  rtl?: boolean
}

export default function LexicalEditor({ initialContent = "", onChange, rtl = false }: LexicalEditorProps) {
  const [importComplete, setImportComplete] = useState(false)
  const [editorState, setEditorState] = useState()

  // Initialize the editor with configuration
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    nodes,
    onError: (error: Error) => console.error(error),
    editorState: null,
  }

  // Handle editor changes
  const handleEditorChange = (editorState: any) => {
    setEditorState(editorState)

    if (onChange && importComplete) {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editorState)
        onChange(htmlString)
      })
    }
  }

  return (
    <div className={`lexical-editor border rounded-md overflow-hidden ${rtl ? "rtl" : "ltr"}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner p-4">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="editor-input min-h-[200px] outline-none" dir={rtl ? "rtl" : "ltr"} />
              }
              placeholder={
                <div className="editor-placeholder text-gray-400 absolute top-[60px] left-[15px] pointer-events-none">
                  {rtl ? "محتوا را وارد کنید..." : "Enter some text..."}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <OnChangePlugin onChange={handleEditorChange} />
            <HtmlImportPlugin initialHtml={initialContent} setImportComplete={() => setImportComplete(true)} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  )
}
