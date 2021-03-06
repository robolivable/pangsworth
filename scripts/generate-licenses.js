const fs = require('fs/promises')
const run = async (
  _, __, buildPath, dstFolder, bundledLicensesName = 'app.js.LICENSE.txt'
) => {
  const input = await fs.readFile(
    buildPath + '/' + bundledLicensesName, { encoding: 'utf8' }
  )
  const content =
    `/* NOTE: THIS FILE IS GENERATED BY generate-licenses.js! DO NOT MODIFY! ` +
    `*/\nconst LICENSES = \`\n${input}\n\`\nmodule.exports = { LICENSES }`
  await fs.writeFile(dstFolder + '/licenses.js', content)
}
run(...process.argv)
