<template>
  <div class="right-panel">
    <div class="chat-panel" ref="chatPanel">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message"
        :class="[
          'role-' + msg.role.toLowerCase(),
          { 'ai-msg': msg.source !== 'manual' },
        ]"
      >
        <div class="msg-header">
          <span class="role-tag">{{ roles.find(r => r.id === msg.role)?.name }}</span>
          <span v-if="msg.source !== 'manual'" class="ai-badge">AI</span>
          <span v-if="msg.edited" class="edited-badge">已编辑</span>
        </div>
        <div class="content" v-html="renderContent(msg)"></div>
        <div class="msg-actions">
          <button @click="$emit('edit-msg', msg)">✏️</button>
          <button @click="$emit('delete-msg', msg.id)">🗑</button>
          <button
            v-if="msg.source === 'manual'"
            @click="$emit('polish', msg)"
            :disabled="polishing[msg.id]"
          >
            {{ polishing[msg.id] ? '✨...' : '✨' }}
          </button>
        </div>
      </div>
    </div>
    <div class="input-area">
      <textarea
        v-model="draft"
        @keydown.enter.exact.prevent="sendDraft"
        :placeholder="`以${currentRoleName}发言...`"
        rows="3"
      ></textarea>
      <div class="input-btns">
        <button @click="sendDraft" :disabled="!draft.trim()">发送</button>
        <button @click="$emit('fill')" :disabled="fillLoading || messages.length === 0">
          {{ fillLoading ? '填补中...' : '🤖 AI填补' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  messages: { type: Array, required: true },
  currentRole: { type: String, required: true },
  roles: { type: Array, required: true },
  fillLoading: { type: Boolean, default: false },
  polishing: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['send', 'edit-msg', 'delete-msg', 'polish', 'fill']);

const draft = ref('');

const currentRoleName = computed(() => props.roles.find(r => r.id === props.currentRole)?.name || '');

function renderContent(msg) {
  if (msg.source === 'ai_polish' && msg.revisionMarks) {
    return msg.revisionMarks
      .replace(/\[-(.*?)-\]/g, '<del style="color:#DC2626;">$1</del>')
      .replace(/\{\+(.*?)\+\}/g, '<ins style="color:#16A34A;">$1</ins>');
  }
  return msg.content.replace(/\n/g, '<br/>');
}

function sendDraft() {
  if (!draft.value.trim()) return;
  emit('send', draft.value.trim());
  draft.value = '';
}
</script>

<style scoped>
.right-panel { flex: 1; display: flex; flex-direction: column; }
.chat-panel { flex: 1; border: 1px solid #E5E7EB; border-radius: 12px; padding: 1rem; overflow-y: auto; margin-bottom: 0.5rem; background: #FFFFFF; }
.message { padding: 0.8rem; border-radius: 8px; margin-bottom: 0.8rem; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.role-a { border-left: 4px solid #60A5FA; }
.role-b { border-left: 4px solid #F87171; }
.role-c { border-left: 4px solid #34D399; }
.ai-msg { background-color: #F4F9F4; }
.msg-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
.role-tag { font-weight: 600; color: #1F2937; }
.ai-badge { background: #10B981; color: #ECFDF5; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; }
.edited-badge { background: #FBBF24; color: #78350F; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; }
.msg-actions { margin-top: 0.5rem; text-align: right; }
.msg-actions button { background: none; border: none; cursor: pointer; font-size: 1rem; margin-left: 0.2rem; opacity: 0.7; }
.msg-actions button:hover { opacity: 1; }
.input-area { display: flex; gap: 0.5rem; }
.input-area textarea { flex: 1; padding: 0.6rem; border-radius: 8px; border: 1px solid #E5E7EB; resize: vertical; font-size: 0.9rem; }
.input-btns { display: flex; flex-direction: column; gap: 0.3rem; }
</style>
