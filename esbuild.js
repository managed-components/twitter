console.log('Building CSS')
const { execSync } = require('child_process')

execSync(
  'npx tailwindcss -i ./assets/css/app.css -o ./dist/output.css',
  (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`)
      return
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`)
      return
    }
    console.log(`stdout: ${stdout}`)
  }
)

console.log('Building script')
require('esbuild').buildSync({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'node',
  target: ['esnext'],
  loader: { '.html': 'text', '.svg': 'text', '.css': 'text' },
  tsconfig: 'tsconfig.build.json',
  outfile: 'dist/index.js',
})
