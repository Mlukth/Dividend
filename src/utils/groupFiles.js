/**
 * 相似名称分组算法
 * 针对中英文文件名分别处理，返回分组结果
 */

/**
 * 判断字符是否为中文字符（粗略判断，涵盖 CJK 统一表意字符区）
 */
function isChinese(char) {
  const code = char.charCodeAt(0)
  return code >= 0x4e00 && code <= 0x9fff
}

/**
 * 提取字符串中的有效部分（去除非字母数字中文的干扰字符）
 */
function normalizeName(name) {
  // 去掉扩展名 .vue
  return name.replace(/\.vue$/, '')
}

/**
 * 计算两个字符串的最长公共前缀
 */
function longestCommonPrefix(str1, str2) {
  let i = 0
  const minLen = Math.min(str1.length, str2.length)
  while (i < minLen && str1[i] === str2[i]) i++
  return str1.slice(0, i)
}

/**
 * 判断两个文件名是否应该属于同一组（基于语言类型）
 * - 若两个字符串首字符都是中文，则认为中文组
 * - 若首字符都是英文/数字，则认为英文组
 * - 混合情况不归为一组
 */
function sameLanguageGroup(nameA, nameB) {
  if (nameA.length === 0 || nameB.length === 0) return false
  const aIsChinese = isChinese(nameA[0])
  const bIsChinese = isChinese(nameB[0])
  return aIsChinese === bIsChinese
}

/**
 * 对文件列表进行相似名称分组
 * @param {Array} files - 文件节点数组（已包含 mtime 等属性）
 * @returns {Array} groups - 分组对象数组，每个分组包含 id, name, files, latestMtime
 */
export function groupFilesBySimilarName(files) {
  if (!files.length) return []

  // 规范化文件名，移除 .vue
  const normalizedFiles = files.map(f => ({
    ...f,
    normalizedName: normalizeName(f.name)
  }))

  // 先按语言类型粗分（中文 vs 非中文）
  const chineseFiles = normalizedFiles.filter(f => f.normalizedName.length > 0 && isChinese(f.normalizedName[0]))
  const nonChineseFiles = normalizedFiles.filter(f => f.normalizedName.length > 0 && !isChinese(f.normalizedName[0]))

  const groups = []
  
  // 对中文文件聚类
  processFileSet(chineseFiles, groups)
  // 对非中文文件聚类
  processFileSet(nonChineseFiles, groups)

  // 按组内最新 mtime 对分组排序（时间倒序）
  groups.forEach(g => {
    const times = g.files.map(f => f.mtime || 0)
    g.latestMtime = times.length ? Math.max(...times) : 0
  })
  groups.sort((a, b) => b.latestMtime - a.latestMtime)

  // 组内文件按时间倒序排序
  groups.forEach(g => {
    g.files.sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
  })

  return groups
}

/**
 * 处理一组文件，进行聚类
 */
function processFileSet(files, resultGroups) {
  if (files.length === 0) return

  const used = new Set()
  
  for (let i = 0; i < files.length; i++) {
    if (used.has(i)) continue
    const fileA = files[i]
    const group = [fileA]
    used.add(i)
    
    // 寻找与 fileA 有最长公共前缀且语言一致的同伴
    for (let j = i + 1; j < files.length; j++) {
      if (used.has(j)) continue
      const fileB = files[j]
      if (!sameLanguageGroup(fileA.normalizedName, fileB.normalizedName)) continue
      
      const prefix = longestCommonPrefix(fileA.normalizedName, fileB.normalizedName)
      // 公共前缀长度至少 2 个字符（中文算一个字符）
      if (prefix.length >= 2) {
        group.push(fileB)
        used.add(j)
      }
    }
    
    // 确定组名（使用公共前缀，若长度不够则用第一个文件名截断）
    let groupName = fileA.normalizedName
    if (group.length > 1) {
      // 计算组内所有文件的公共前缀
      let common = fileA.normalizedName
      for (let k = 1; k < group.length; k++) {
        common = longestCommonPrefix(common, group[k].normalizedName)
      }
      if (common.length >= 2) {
        groupName = common
      } else {
        // 取第一个文件名的前几个字符作为组名
        groupName = fileA.normalizedName.slice(0, 8) + (fileA.normalizedName.length > 8 ? '…' : '')
      }
    } else {
      // 单个文件直接使用文件名作为组名
      groupName = fileA.normalizedName
    }

    resultGroups.push({
      id: `group-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
      name: groupName,
      autoName: groupName,
      files: group,
      collapsed: false
    })
  }
}

/**
 * 按修改时间倒序对文件列表排序（扁平列表用）
 */
export function sortFilesByTime(files) {
  return [...files].sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
}

/**
 * 按文件名相似度排序（原逻辑）
 */
export function sortFilesBySimilarity(files) {
  return [...files].sort((a, b) => {
    let i = 0
    const minLen = Math.min(a.name.length, b.name.length)
    while (i < minLen && a.name[i] === b.name[i]) i++
    return -i
  })
}