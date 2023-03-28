import { renderToReadableStream } from "react-dom/server"

export async function render(content: JSX.Element) {
  return renderToReadableStream(content)
}
