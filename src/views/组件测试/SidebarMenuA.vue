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
  name: 'SidebarMenuA',
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
    toggleChild(title) {
      this.expanded = { ...this.expanded, [title]: !this.expanded[title] };
    },
    resolveIcon(icon) {
      if (typeof icon === 'string') {
        return `<i class="${icon}"></i>`;
      }
      // custom icon object: { element: 'span', class: '...', text: '' }
      if (icon && icon.element) {
        const cls = icon.class ? `class="${icon.class}"` : '';
        return `<${icon.element} ${cls}>${icon.text || ''}</${icon.element}>`;
      }
      return '';
    },
    handleClick(item, event) {
      if (item.disabled) return;
      if (item.child) {
        this.toggleChild(item.title);
      }
      this.$emit('item-click', event, item);
    },
    isActive(item) {
      if (item.href && this.activePath) {
        return item.href === this.activePath;
      }
      return false;
    },
  },
}
</script>

<style scoped>
.sidebar {
  --vsm-primary: #1e88e5;
  --vsm-bg: #1a1e2b;
  --vsm-text: #cfd8dc;
  --vsm-hover-bg: rgba(30,33,40,0.8);
  --vsm-active-bg: rgba(30,136,229,0.2);
  --vsm-active-border: var(--vsm-primary);
  --vsm-header: #607d8b;
  --vsm-badge-bg: #ef5350;
  --vsm-toggle-bg: #151921;
  --vsm-toggle-color: #fff;
  background: var(--vsm-bg);
  color: var(--vsm-text);
  width: var(--width, 280px);
  transition: width 0.3s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Roboto, sans-serif;
}
.collapsed {
  width: var(--width-collapsed, 60px);
}
.toggle-btn {
  padding: 12px 16px;
  cursor: pointer;
  background: var(--vsm-toggle-bg);
  color: var(--vsm-toggle-color);
  text-align: center;
  font-size: 1.2rem;
  user-select: none;
}
.menu {
  list-style: none;
  margin: 0;
  padding: 8px 0;
  flex: 1;
  overflow-y: auto;
}
.header-item {
  padding: 10px 18px 6px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--vsm-header);
  white-space: nowrap;
}
.header-item.hidden {
  display: none;
}
.menu-item {
  margin: 2px 8px;
}
.menu-link {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  text-decoration: none;
  color: inherit;
  border-radius: 6px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}
.menu-link:hover {
  background: var(--vsm-hover-bg);
}
.menu-link.active {
  background: var(--vsm-active-bg);
  border-left: 3px solid var(--vsm-active-border);
}
.menu-item.disabled .menu-link {
  opacity: 0.5;
  pointer-events: none;
}
.icon {
  width: 24px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}
.title {
  flex: 1;
}
.badge {
  background: var(--vsm-badge-bg);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
}
.arrow {
  margin-left: auto;
  font-size: 1.2rem;
  transition: transform 0.2s;
}
.arrow.open {
  transform: rotate(90deg);
}
.submenu {
  padding-left: 24px;
  list-style: none;
  margin: 0;
}
.sub-item .menu-link {
  padding: 8px 12px;
  font-size: 0.9rem;
}
</style>