import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const dist = resolve('dist')
const shell = await readFile(resolve(dist, 'index.html'), 'utf8')

const pages = {
  '/': `<main><h1>TAYU: learn money by playing</h1><p>A free financial-literacy adventure for grades K–12. Practice spending, saving, giving, business, budgeting, banking, investing, bonds, and taxes.</p><nav><a href="/modules">Explore learning modules</a> <a href="/educators">Educator standards map</a> <a href="/about">About TAYU</a></nav></main>`,
  '/about': `<main><h1>About TAYU</h1><p>TAYU is a story-driven financial-literacy learning experience. Learners make choices, see consequences, retry mistakes, and build a persistent learning passport.</p><p><a href="/educators">View curriculum standards and educator resources</a></p></main>`,
  '/educators': `<main><h1>TAYU educator standards map</h1><p>TAYU modules are labeled with Fairfax County Public Schools financial-literacy units and Virginia Economics and Personal Finance Standards of Learning.</p><ul><li>Market &amp; Jars: FCPS Units 2 and 8; EPF.1 and EPF.16</li><li>Lemonade Stand: FCPS Units 5 and 14; EPF.2–EPF.4</li><li>Budget Town: FCPS Units 2 and 8; EPF.10, EPF.11, EPF.16</li><li>Bank of TAYU: FCPS Units 7 and 9; EPF.6, EPF.12, EPF.13</li><li>Money Garden and Bond Street: FCPS Unit 13; EPF.8 and EPF.17</li><li>Tax Office: FCPS Unit 11; EPF.8 and EPF.15</li></ul><p>Grade pathways: K–2 modules 1–2; grades 3–5 modules 1–3; grades 6–12 all seven modules.</p></main>`,
}

for (const [route, markup] of Object.entries(pages)) {
  const title = route === '/' ? 'TAYU | Learn Money by Playing' : route === '/about' ? 'About TAYU' : 'Educator Standards Map | TAYU'
  const html = shell
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
  const output = route === '/' ? resolve(dist, 'index.html') : resolve(dist, route.slice(1), 'index.html')
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html)
}
