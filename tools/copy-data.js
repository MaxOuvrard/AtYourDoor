import { promises as fs } from 'fs'
import path from 'path'

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function main() {
  try {
    const projectRoot = process.cwd()
    const src = path.resolve(projectRoot, 'server', 'data')
    const dest = path.resolve(projectRoot, '.output', 'server', 'data')

    console.log('Copying data from', src, 'to', dest)
    await copyDir(src, dest)
    console.log('Copy complete')
  } catch (e) {
    console.error('Failed to copy data directory:', e)
    process.exitCode = 1
  }
}

main()
