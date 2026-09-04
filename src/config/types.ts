export type GolangciConfigV2 = {
  version: '2'
  linters: {
    default: 'none'
    enable?: readonly string[]
  }
}
