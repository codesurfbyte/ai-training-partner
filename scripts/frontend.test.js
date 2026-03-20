const assert = require('assert')
const fs = require('fs')
const path = require('path')

function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8')
}

function run() {
  const countPage = read('app/page.tsx')
  assert(
    countPage.includes('export default function GymCoach()'),
    'root page should render the count experience'
  )
  assert(
    countPage.includes('Count Log'),
    'root page should use the new count log visual design'
  )
  assert(
    fs.existsSync(path.join(process.cwd(), 'app/page.tsx')),
    'root page should exist'
  )
  assert(
    !fs.existsSync(path.join(process.cwd(), 'app/count/page.tsx')),
    'count route should be moved to the root page'
  )
  assert(
    !fs.existsSync(path.join(process.cwd(), 'app/book/page.tsx')),
    'book page should be removed'
  )

  console.log('frontend tests passed')
}

run()
