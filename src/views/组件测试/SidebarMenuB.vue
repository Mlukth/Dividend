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
  name: 'SidebarMenuB',
  props: {
    menu: { type: Array, required: true },
    modelCollapsed: { type: Boolean, default: false },
    width: { type: String, default: '280px' },
    widthCollapsed: { type: String, default: '60px' },
    activePath: { type: String, default: '' },
  },
  emits: ['update:modelCollapsed', 'item-click'],
  data() {
    return {
      collapsed: this.modelCollapsed,
      expanded: {},
    }
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
  --bg: #ffffff;
  --text: #2c3e50;
  --hover-bg: #f4f6f9;
  --active-bg: #eef2f6;
  --active-border: #3498db;
  --header: #95a5a6;
  --badge-bg: #e74c3c;
  --toggle-bg: #ecf0f1;
  --toggle-color: #2c3e50;
  background: var(--bg);
  color: var(--text);
  width: var(--width, 280px);
  transition: width 0.3s;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', Arial, sans-serif;
  box-shadow: 1px 0 8px rgba(0,0,0,0.05);
  border-right: 1px solid #e9ecef;
}
.collapsed { width: var(--width-collapsed, 60px); }
.toggle-btn {
  padding: 14px;
  background: var(--toggle-bg);
  color: var(--toggle-color);
  text-align: center;
  cursor: pointer;
  font-size: 1.2rem;
}
.menu { list-style: none; padding: 10px 0; margin: 0; flex: 1; overflow-y: auto; }
.header-item {
  padding: 12px 20px 6px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--header);
  white-space: nowrap;
}
.header-item.hidden { display: none; }
.menu-item { margin: 2px 10px; }
.menu-link {
  display: flex; align-items: center; padding: 10px 14px;
  text-decoration: none; color: inherit; border-radius: 8px;
  white-space: nowrap; cursor: pointer; transition: background 0.15s;
}
.menu-link:hover { background: var(--hover-bg); }
.menu-link.active { background: var(--active-bg); font-weight: 600; border-left: 3px solid var(--active-border); }
.menu-item.disabled .menu-link { opacity: 0.4; pointer-events: none; }
.icon { width: 24px; margin-right: 12px; display: flex; align-items: center; color: #7f8c8d; }
.title { flex: 1; }
.badge { background: var(--badge-bg); color: #fff; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; }
.arrow { margin-left: auto; font-size: 1.2rem; transition: transform 0.2s; color: #bdc3c7; }
.arrow.open { transform: rotate(90deg); }
.submenu { padding-left: 28px; list-style: none; }
.sub-item .menu-link { font-size: 0.9rem; padding: 8px 14px; }
</style>