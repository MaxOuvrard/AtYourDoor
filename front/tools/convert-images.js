#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const publicDir = path.join(__dirname, '..', 'public', 'images')

if (!fs.existsSync(publicDir)) {
  console.error('No public/images directory found. Aborting.')
  process.exit(1)
}

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const base = filePath.slice(0, -ext.length)
  if (['.png', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext)) {
    try {
      await sharp(filePath).toFile(base + '.webp')
      await sharp(filePath).toFile(base + '.avif')
      console.log('Converted:', filePath)
    } catch (e) {
      console.error('Failed to convert', filePath, e.message)
    }
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full)
    else processFile(full)
  }
}

walk(publicDir)
