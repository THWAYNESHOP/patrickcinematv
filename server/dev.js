import { existsSync } from 'fs'
import { resolve } from 'path'
import { spawn } from 'child_process'

const viteBin = resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js')
const supportServerEntry = resolve(process.cwd(), 'server', 'support-server.js')
const viteArgs = [viteBin, '--host', '127.0.0.1', '--port', '5173']

if (!existsSync(viteBin)) {
  console.error('Unable to find Vite. Run npm install before starting the dev server.')
  process.exit(1)
}

function prefixStream(stream, prefix, onLine) {
  let buffer = ''

  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line) continue
      console.log(`${prefix} ${line}`)
      onLine?.(line)
    }
  })
}

function stopChild(child) {
  if (!child.killed) {
    child.kill()
  }
}

function startSupportServer() {
  return new Promise((resolveServer, reject) => {
    const support = spawn(process.execPath, [supportServerEntry], {
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })

    let settled = false
    const startupTimer = setTimeout(() => {
      if (!settled) {
        settled = true
        stopChild(support)
        reject(new Error('Timed out while starting the support server.'))
      }
    }, 15000)

    const handleLine = (line) => {
      const match = line.match(/Support server running on (http:\/\/localhost:\d+)/)
      if (match && !settled) {
        settled = true
        clearTimeout(startupTimer)
        resolveServer({ support, target: match[1] })
      }
    }

    prefixStream(support.stdout, '[support]', handleLine)
    prefixStream(support.stderr, '[support]', handleLine)

    support.on('error', (error) => {
      if (!settled) {
        settled = true
        clearTimeout(startupTimer)
        reject(error)
      }
    })

    support.on('exit', (code) => {
      if (!settled) {
        settled = true
        clearTimeout(startupTimer)
        reject(new Error(`Support server exited before startup with code ${code}.`))
      }
    })
  })
}

function startVite(support, supportTarget) {
  const vite = spawn(process.execPath, viteArgs, {
    env: {
      ...process.env,
      VITE_SUPPORT_SERVER_URL: supportTarget,
    },
    stdio: ['inherit', 'pipe', 'pipe'],
    windowsHide: true,
  })

  prefixStream(vite.stdout, '[vite]')
  prefixStream(vite.stderr, '[vite]')

  vite.on('exit', (code) => {
    stopChild(support)
    process.exit(code ?? 0)
  })

  support.on('exit', (code) => {
    stopChild(vite)
    process.exit(code ?? 0)
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      stopChild(vite)
      stopChild(support)
      process.exit(0)
    })
  }
}

try {
  const { support, target } = await startSupportServer()
  startVite(support, target)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
