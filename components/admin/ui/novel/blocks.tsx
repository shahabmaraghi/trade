import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core"
import { type ReactSlashMenuItem, createReactBlockSpec } from "@blocknote/react"
import { ImageIcon, ListIcon, QuoteIcon, TextIcon } from "lucide-react"
import Image from "next/image"

// Custom Image block that supports our styling
export const imageBlockSpec = createReactBlockSpec({
  type: "image",
  propSchema: {
    ...defaultBlockSpecs.paragraph.propSchema,
    url: {
      default: "",
    },
    caption: {
      default: "",
    },
    width: {
      default: "100%",
    },
  },
  content: "none",

  render: ({ block }) => {
    return (
      <div style={{ width: block.props.width }}>
        <Image
          src={block.props.url || "/placeholder.svg"}
          alt={block.props.caption}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
        {block.props.caption && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "gray",
            }}
          >
            {block.props.caption}
          </p>
        )}
      </div>
    )
  },
})

// Define custom menu items for slash command
export const customSlashMenuItems: ReactSlashMenuItem[] = [
  {
    name: "Text",
    execute: ({ editor }) => {
      editor.insertBlocks(
        [
          {
            type: "paragraph",
          },
        ],
        editor.getTextCursorPosition().block,
        "after",
      )
    },
    aliases: ["text", "paragraph", "p"],
    icon: <TextIcon size={18} />,
    group: "Basic",
  },
  {
    name: "Heading",
    execute: ({ editor }) => {
      editor.insertBlocks(
        [
          {
            type: "heading",
            props: {
              level: 1,
            },
          },
        ],
        editor.getTextCursorPosition().block,
        "after",
      )
    },
    aliases: ["heading", "header", "h", "h1"],
    icon: <TextIcon size={18} />,
    group: "Basic",
  },
  {
    name: "Image",
    execute: ({ editor }) => {
      editor.insertBlocks(
        [
          {
            type: "image",
            props: {
              url: prompt("Enter image URL") || "",
            },
          },
        ],
        editor.getTextCursorPosition().block,
        "after",
      )
    },
    aliases: ["image", "img", "picture", "photo"],
    icon: <ImageIcon size={18} />,
    group: "Media",
  },
  {
    name: "Bulleted List",
    execute: ({ editor }) => {
      editor.insertBlocks(
        [
          {
            type: "bulletListItem",
          },
        ],
        editor.getTextCursorPosition().block,
        "after",
      )
    },
    aliases: ["bulleted list", "bullet", "ul", "list"],
    icon: <ListIcon size={18} />,
    group: "Basic",
  },
  {
    name: "Quote",
    execute: ({ editor }) => {
      editor.insertBlocks(
        [
          {
            type: "blockquote",
          },
        ],
        editor.getTextCursorPosition().block,
        "after",
      )
    },
    aliases: ["quote", "blockquote", "q"],
    icon: <QuoteIcon size={18} />,
    group: "Basic",
  },
]

// Create a custom schema with our new blocks
export const customSchema = BlockNoteSchema.create({
  blockSpecs: {
    image: imageBlockSpec,
  },
})
