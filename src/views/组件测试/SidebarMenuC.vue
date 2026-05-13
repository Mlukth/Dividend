<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="toggle-btn" @click="collapsed = !collapsed">
      <span v-if="collapsed">☰</span>
      <span v-else>✕</span>
    </div>
    <ul class="menu">
      <template v-for="item in menu" :key="item.title || item.header">
        <li v-if="item.header" class="header-item" :class="{ hidden: collapsed && item.hiddenOnCollapse }">
          <span v-if="!collapsed">{{ item.header }}</span>
        </li>
        <li v-else-if="item.component" :is="item.component" v-bind="item.props" />
        <li v-else class="menu-item" :class="{ disabled: item.disabled }">
          <a
            :href="item.href || '#'"
            class="menu-link"
            :class="{ active: isActive(item) }"
            @click.prevent="handleClick(item, $event)"
          >
            <span v-if="item.icon" class="icon" v-html="resolveIcon(item.icon)" />
            <span v-if="!collapsed" class="title">{{ item.title }}</span>
            <span v-if="item.badge && !collapsed" class="badge">{{ item.badge.text }}</span>
            <span
              v-if="item.child && !collapsed"
              class="arrow"
              :class="{ open: expanded[item.title] }"
              @click.stop="toggleChild(item.title)"
            >
              ›
            </span>
          </a>
          <ul v-if="item.child && !collapsed && expanded[item.title]" class="submenu">
            <li v-for="child in item.child" :key="child.title" class="menu-item sub-item"
                :class="{ disabled: child.disabled }">
              <a
                :href="child.href || '#'"
                class="menu-link"
                :class="{ active: isActive(child) }"
                @click.prevent="handleClick(child, $event)"
              >
                <span v-if="child.icon" class="icon" v-html="resolveIcon(child.icon)" />
                <span class="title">{{ child.title }}</span>
                <span v-if="child.badge" class="badge">{{ child.badge.text }}</span>
              </a>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </aside>
</template>

<script>
export default {
  name: 'SidebarMenuC',
  props: {
    menu: { type: Array, required: true },
    modelCollapsed: { type: Boolean, default: false },
    width: { type: String, default: '260px' },
    widthCollapsed: { type: String, default: '60px' },
    activePath: { type: String, default: '' },
  },
  emits: ['update:modelCollapsed', 'item-click'],
  data() {
    return { collapsed: this.modelCollapsed, expanded: {} }
  },
  watch: {
    modelCollapsed(v) { this.collapsed = v },
    collapsed(v) { this.$emit('update:modelCollapsed', v) },
  },
  methods: {
    toggleChild(title) { this.expanded = { ...this.expanded, [title]: !this.expanded[title] }; },
    resolveIcon(icon) {
      if (typeof icon === 'string') return `<i class="${icon}"></i>`;
      if (icon && icon.element) {
        const cls = icon.class ? `class="${icon.class}"` : '';
        return `<${icon.element} ${cls}>${icon.text || ''}</${icon.element}>`;
      }
      return '';
    },
    handleClick(item, event) {
      if (item.disabled) return;
      if (item.child) this.toggleChild(item.title);
      this.$emit('item-click', event, item);
    },
    isActive(item) {
      return item.href && this.activePath ? item.href === this.activePath : false;
    },
  },
}
</script>

<style scoped>
.sidebar {
  --line: #e0e0e0;
  --bg: #fafafa;
  --text: #333;
  --hover-bg: #f0f0f0;
  --active-color: #111;
  background: var(--bg);
  color: var(--text);
  width: var(--width, 260px);
  transition: width 0.25s;
  height: 100%;
  border-right: 1px solid var(--line);
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}
.collapsed { width: var(--width-collapsed, 60px); }
.toggle-btn {
  padding: 12px;
  text-align: center;
  cursor: pointer;
  border-bottom: 1px solid var(--line);
  font-size: 1.2rem;
  color: #666;
}
.menu { list-style: none; margin: 0; padding: 0; flex: 1; overflow-y: auto; }
.header-item {
  padding: 16px 20px 6px;
  font-size: 0.7rem;
  letter-spacing: 0.8px;
  color: #999;
  white-space: nowrap;
}
.header-item.hidden { display: none; }
.menu-item { margin: 0; }
.menu-link {
  display: flex; align-items: center; padding: 10px 20px;
  text-decoration: none; color: inherit; white-space: nowrap;
  border-bottom: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s;
}
.menu-link:hover { background: var(--hover-bg); }
.menu-link.active {
  font-weight: 600;
  border-bottom: 1px solid var(--active-color);
  background: transparent;
}
.menu-item.disabled .menu-link { opacity: 0.4; pointer-events: none; }
.icon { width: 22px; margin-right: 12px; display: flex; align-items: center; }
.title { flex: 1; }
.badge { background: #333; color: #fff; font-size: 0.65rem; padding: 1px 6px; border-radius: 10px; margin-left: 8px; }
.arrow { margin-left: auto; font-size: 1.1rem; transition: transform 0.2s; }
.arrow.open { transform: rotate(90deg); }
.submenu { padding-left: 0; list-style: none; border-top: 1px solid #f0f0f0; }
.sub-item .menu-link { padding: 8px 20px 8px 48px; font-size: 0.9rem; }
</style>