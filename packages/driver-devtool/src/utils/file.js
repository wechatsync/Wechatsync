export function getFileType(name) {
  const extRegExp = /\.(md|js)$/
  const extType = extRegExp.exec(name)?.[1]
  return extType
}

export function getIconInfo(name) {
  const extType = getFileType(name)
  const ext2Icon = {
    md: {
      name: 'brands/markdown',
      style: {
        fill: '#008b69',
      },
    },
    js: {
      name: 'brands/js-square',
      style: {
        fill: '#ffd400',
      },
    },
  }

  return (
    ext2Icon[extType] || {
      name: 'stream',
      style: {
        fill: '#505050',
      },
    }
  )
}

export function getEditorMode(name) {
  const extType = getFileType(name)
  const ext2Mode = {
    md: 'markdown',
    js: 'javascript',
  }

  return ext2Mode[extType] || ''
}

export function uniqueId(prefix) {
  let S4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  let guid = `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`

  return `${prefix}${guid}`
}
