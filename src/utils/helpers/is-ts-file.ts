import path from 'path'
export const isTypeScriptFile = () => {
  return path.extname(__filename) === '.ts'
}
