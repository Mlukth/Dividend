// src/utils/fileTree.js

/**
 * 构建文件树，同时生成与路由定义一致的 routePath（已编码）
 */
export function buildFileTree(modules) {
  const tree = []
  const uncategorizedFolder = {
    type: 'folder',
    name: '未分类',
    path: '__root__',
    children: []
  }

  for (const path in modules) {
    const relativePath = path.replace('../views/', '').replace('.vue', '')
    const parts = relativePath.split('/')
    
    // 生成与路由一致的编码路径
    const encodedRoutePath = `/auto/${relativePath
      .replace(/\\/g, '/')
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/')}`

    if (parts.length === 1) {
      const fileName = parts[0]
      const routeName = relativePath
        .replace(/[^\w\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()

      uncategorizedFolder.children.push({
        type: 'file',
        name: fileName,
        path: relativePath,
        fullPath: path,
        routePath: encodedRoutePath,
        routeName,
        component: modules[path],
        meta: { title: fileName, auto: true },
        mtime: null,      // 预留，后续从 API 获取
        size: null
      })
      continue
    }

    let currentLevel = tree
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isFile = index === parts.length - 1

      if (isFile) {
        const fileName = part
        const routeName = relativePath
          .replace(/[^\w\u4e00-\u9fa5]/g, '-')
          .replace(/-+/g, '-')
          .toLowerCase()

        currentLevel.push({
          type: 'file',
          name: fileName,
          path: relativePath,
          fullPath: path,
          routePath: encodedRoutePath,
          routeName,
          component: modules[path],
          meta: { title: fileName, auto: true },
          mtime: null,
          size: null
        })
      } else {
        let folder = currentLevel.find(item => item.type === 'folder' && item.name === part)
        if (!folder) {
          folder = {
            type: 'folder',
            name: part,
            path: currentPath,
            children: []
          }
          currentLevel.push(folder)
        }
        currentLevel = folder.children
      }
    })
  }

  if (uncategorizedFolder.children.length > 0) {
    tree.push(uncategorizedFolder)
  }

  sortFilesInTree(tree)
  return tree
}

function sortFilesInTree(nodes) {
  nodes.forEach(node => {
    if (node.type === 'folder') {
      if (!Array.isArray(node.children)) node.children = []
      const files = node.children.filter(c => c.type === 'file')
      const folders = node.children.filter(c => c.type === 'folder')
      files.sort((a, b) => similarityScore(a.name, b.name))
      node.children = [...folders, ...files]
      sortFilesInTree(folders)
    }
  })
}

function similarityScore(strA, strB) {
  let i = 0
  const minLen = Math.min(strA.length, strB.length)
  while (i < minLen && strA[i] === strB[i]) i++
  return -i
}