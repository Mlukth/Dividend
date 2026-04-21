// src/api/file.js

/**
 * 批量移动文件
 * @param {Array} moves - 移动操作数组 [{ sourcePath: '组件测试/某个文件', targetFolder: '抽卡' }]
 * @returns {Promise}
 */
export function moveFiles(moves) {
  return fetch('/api/move-files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moves })
  }).then(res => res.json())
}