import deobfuscator from 'deobfuscator'
import prettier from 'prettier'
import esprima from 'esprima'
import escodegen from 'escodegen'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { code, mode } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Kode tidak boleh kosong' })
  }

  try {
    let result

    if (mode === 'hard') {
      // deobfuscate menggunakan library deobfuscator
      result = deobfuscator.deobfuscate(code, {
        arrays: { unpack: true },
        controlFlow: { flattening: true },
        deadCode: { remove: true },
        dispatcher: true,
        obfuscator: 'all',
        opaquePredicates: { remove: true },
        strings: { split: true },
        simplify: true,
        stringArray: { remove: true },
      })
      // Prettify hasil akhir
      result = prettier.format(result, { parser: 'babel', printWidth: 120 })
    } else {
      // mode === 'basic' -> hanya unminify & beautify
      const ast = esprima.parseScript(code, { tolerant: true, loc: true })
      result = escodegen.generate(ast, {
        format: {
          indent: { style: '  ' },
          newline: '\n',
          space: ' ',
          json: false,
          renumber: false,
          hexadecimal: false,
          quotes: 'single',
          escapeless: true,
          compact: false,
          parentheses: true,
          semicolons: true,
        },
      })
      result = prettier.format(result, { parser: 'babel' })
    }

    return res.status(200).json({ result })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Gagal deobfuscate' })
  }
}