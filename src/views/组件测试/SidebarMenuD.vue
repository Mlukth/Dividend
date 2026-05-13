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
  name: 'SidebarMenuD',
  props: {
    menu: { type: Array, required: true },
    modelCollapsed: { type: Boolean, default: false },
    width: { type: String, default: '280px' },
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
  background: linear-gradient(180deg, #2b1b3d 0%, #1a1a2e 100%);
  color: #e0d7ff;
  width: var(--width, 280px);
  transition: width 0.3s;
  height: 100%;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}
.collapsed { width: var(--width-collapsed, 60px); }
.toggle-btn {
  padding: 16px;
  background: rgba(255,255,255,0.05);
  text-align: center;
  cursor: pointer;
  color: #c0b3ff;
  font-size: 1.2rem;
}
.menu { list-style: none; padding: 12px 0; margin: 0; flex: 1; overflow-y: auto; }
.header-item {
  padding: 14px 22px 6px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #a090d0;
  white-space: nowrap;
}
.header-item.hidden { display: none; }
.menu-item { margin: 4px 12px; }
.menu-link {
  display: flex; align-items: center; padding: 10px 16px;
  text-decoration: none; color: inherit; border-radius: 12px;
  white-space: nowrap; cursor: pointer;
  background: rgba(255,255,255,0.03);
  transition: 0.2s;
  border: 1px solid transparent;
}
.menu-link:hover {
  background: rgba(138, 43, 226, 0.15);
  border-color: rgba(138,43,226,0.3);
}
.menu-link.active {
  background: rgba(138,43,226,0.3);
  border-color: #8a2be2;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(138,43,226,0.4);
}
.menu-item.disabled .menu-link { opacity: 0.4; pointer-events: none; }
.icon { width: 24px; margin-right: 12px; display: flex; align-items: center; }
.title { flex: 1; }
.badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #fff; font-size: 0.7rem; padding: 2px 8px; border-radius: 20px;
}
.arrow { margin-left: auto; font-size: 1.2rem; transition: transform 0.2s; }
.arrow.open { transform: rotate(90deg); }
.submenu { padding-left: 20px; list-style: none; }
.sub-item .menu-link { margin: 2px 0; padding: 8px 16px; }
</style>