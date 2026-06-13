import JsConfuser from 'js-confuser'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { code, mode, customString } = req.body
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Kode tidak boleh kosong' })
  }

  try {
    let config = {}

    if (mode === 'hard') {
      const userText = customString || 'Nantibisadiubah'
      config = {
        target: 'node',
        preset: 'high',
        compact: true,
        minify: true,
        flatten: true,
        identifierGenerator: function () {
          const originalString =
            `/*${userText}/*^/*($break)*/` +
            `/*${userText}/*^/*($break)*/`
          function hapusKarakterTidakDiinginkan(input) {
            return input.replace(/[^a-zA-Z/*^($break)*/]/g, '')
          }
          function stringAcak(panjang) {
            let hasil = ''
            const karakter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
            for (let i = 0; i < panjang; i++) {
              hasil += karakter.charAt(Math.floor(Math.random() * karakter.length))
            }
            return hasil
          }
          return hapusKarakterTidakDiinginkan(originalString) + stringAcak(2)
        },
        renameVariables: true,
        renameGlobals: true,
        stringEncoding: 0.01,
        stringSplitting: 0.1,
        stringConcealing: true,
        stringCompression: true,
        duplicateLiteralsRemoval: true,
        shuffle: { hash: false, true: false },
        stack: false,
        controlFlowFlattening: false,
        opaquePredicates: false,
        deadCode: false,
        dispatcher: false,
        rgf: false,
        calculator: false,
        hexadecimalNumbers: false,
        movedDeclarations: true,
        objectExtraction: true,
        globalConcealing: true,
      }
    } else {
      // mode === 'basic'
      config = {
        target: 'node',
        preset: 'high',
        calculator: true,
        compact: true,
        hexadecimalNumbers: true,
        controlFlowFlattening: 0.75,
        deadCode: 0.2,
        dispatcher: true,
        duplicateLiteralsRemoval: 0.75,
        flatten: true,
        globalConcealing: true,
        identifierGenerator: 'randomized',
        minify: true,
        movedDeclarations: true,
        objectExtraction: true,
        opaquePredicates: 0.75,
        renameVariables: true,
        renameGlobals: true,
        shuffle: { hash: 0.5, true: 0.5 },
        stack: true,
        stringConcealing: true,
        stringCompression: true,
        stringEncoding: true,
        stringSplitting: 0.75,
        rgf: false,
      }
    }

    const tempDir = '/tmp'
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)
    const tempFile = path.join(tempDir, `temp_${Date.now()}.js`)
    fs.writeFileSync(tempFile, code)

    const obfuscated = await JsConfuser.obfuscate(
      fs.readFileSync(tempFile, 'utf-8'),
      config
    )

    fs.unlinkSync(tempFile)
    return res.status(200).json({ result: obfuscated })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Gagal obfuscate' })
  }
}