import { moduleRegistry } from '../moduleManager'

export function Index() {
  return (
    <html lang="en">
      <head>
        <title>interferer machine</title>
      </head>
      <style>
        {`body {
						font-family: monospace;
				  }`.replace(/\s/g, '')}
      </style>
      <body>
        <div>
          <h1>interferer machine</h1>
          <p>registered modules: {moduleRegistry.size}</p>
          <ul>
            {Array.from(moduleRegistry).map(([id, mod]) => (
              <li key={id}>
                <strong>{id}</strong>
                <p>subscribes to: {mod.subscribesTo.join(', ')}</p>
              </li>
            ))}
          </ul>
        </div>
      </body>
    </html>
  )
}
