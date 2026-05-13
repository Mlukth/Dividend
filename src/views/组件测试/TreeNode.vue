<template>
  <div class="tree-node-wrapper" :style="{ marginLeft: level * 24 + 'px' }">
    <div class="tree-node-card">
      <div class="strip" :style="{ backgroundColor: urgencyColor(node) }"></div>
      <div class="node-body">
        <div class="node-title">{{ node.taskName }}</div>
        <div class="node-info">{{ node.estimatedHours }}h · 截止 {{ formatDate(node.expectedCompletionTime) }}</div>
      </div>
    </div>
    <div v-if="node.children && node.children.length">
      <TreeNode 
        v-for="child in node.children" 
        :key="child.id" 
        :node="child" 
        :level="level + 1" 
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 0 }
})

const today = new Date()
today.setHours(0, 0, 0, 0)

function daysUntil(dateStr) {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
}

function urgencyColor(node) {
  const days = daysUntil(node.expectedCompletionTime)
  if (days <= 0) return '#f56c6c'
  if (days <= 3) return '#e6a23c'
  if (days <= 7) return '#67c23a'
  return '#b0c4de'
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.tree-node-wrapper {
  margin-bottom: 4px;
}
.tree-node-card {
  display: flex;
  background: #f8fafc;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.strip {
  width: 6px;
  flex-shrink: 0;
}
.node-body {
  padding: 10px 14px;
}
.node-title {
  font-weight: 600;
  font-size: 15px;
}
.node-info {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}
</style>