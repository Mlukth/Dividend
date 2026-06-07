<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

// ============ OmniParser V2 模拟数据 ============
interface ParsedElement {
  type: 'text' | 'icon';
  content: string;
  bbox: [number, number, number, number];
  confidence: number;
  interactivity: boolean;
}

interface OmniParserResponse {
  som_image_base64: string;
  parsed_content_list: ParsedElement[];
  latency: number;
  screen_width: number;
  screen_height: number;
}

const mockResponse: OmniParserResponse = {
  som_image_base64: '(标注后的图像 base64，此处省略)',
  parsed_content_list: [
    { type: 'text', content: 'Where to?', bbox: [24, 88, 340, 136], confidence: 0.96, interactivity: true },
    { type: 'text', content: 'Tripadvisor', bbox: [24, 28, 196, 64], confidence: 0.98, interactivity: false },
    { type: 'icon', content: 'a bell icon representing notifications or alerts', bbox: [340, 28, 376, 64], confidence: 0.91, interactivity: true },
    { type: 'icon', content: 'a shopping cart icon', bbox: [376, 28, 412, 64], confidence: 0.89, interactivity: true },
    { type: 'text', content: 'Nearby', bbox: [24, 160, 100, 192], confidence: 0.95, interactivity: true },
    { type: 'text', content: 'Hotels', bbox: [108, 160, 176, 192], confidence: 0.97, interactivity: true },
    { type: 'text', content: 'Things to Do', bbox: [184, 160, 304, 192], confidence: 0.94, interactivity: true },
    { type: 'text', content: 'Restaurants', bbox: [312, 160, 412, 192], confidence: 0.96, interactivity: true },
    { type: 'text', content: 'Flights', bbox: [24, 200, 88, 232], confidence: 0.93, interactivity: true },
    { type: 'text', content: 'Vacation Rentals', bbox: [96, 200, 252, 232], confidence: 0.91, interactivity: true },
    { type: 'icon', content: 'a heart icon representing saved or favorite items', bbox: [16, 272, 48, 304], confidence: 0.88, interactivity: true },
    { type: 'text', content: 'Top hotels in Shanghai', bbox: [56, 272, 300, 304], confidence: 0.94, interactivity: false },
    { type: 'text', content: 'See all', bbox: [340, 272, 412, 304], confidence: 0.97, interactivity: true },
    { type: 'icon', content: 'a hotel building icon', bbox: [24, 320, 56, 352], confidence: 0.85, interactivity: false },
    { type: 'text', content: 'The Bund Hotel', bbox: [64, 320, 220, 348], confidence: 0.93, interactivity: true },
    { type: 'text', content: '4.5', bbox: [64, 348, 92, 376], confidence: 0.98, interactivity: false },
    { type: 'icon', content: 'five stars indicating a rating', bbox: [96, 348, 196, 376], confidence: 0.87, interactivity: false },
    { type: 'text', content: '2,847 reviews', bbox: [200, 348, 320, 376], confidence: 0.92, interactivity: true },
    { type: 'icon', content: 'a hotel building icon', bbox: [24, 396, 56, 428], confidence: 0.84, interactivity: false },
    { type: 'text', content: 'Jing An Shangri-La', bbox: [64, 396, 248, 424], confidence: 0.91, interactivity: true },
    { type: 'text', content: '4.7', bbox: [64, 424, 92, 452], confidence: 0.99, interactivity: false },
    { type: 'icon', content: 'five stars indicating a rating', bbox: [96, 424, 196, 452], confidence: 0.86, interactivity: false },
    { type: 'text', content: '3,412 reviews', bbox: [200, 424, 328, 452], confidence: 0.90, interactivity: true },
    { type: 'icon', content: 'a woman holding a cup of coffee', bbox: [24, 480, 180, 620], confidence: 0.82, interactivity: false },
    { type: 'text', content: 'Explore Shanghai', bbox: [196, 500, 380, 536], confidence: 0.93, interactivity: true },
    { type: 'text', content: 'Discover the best time to visit', bbox: [196, 540, 400, 568], confidence: 0.88, interactivity: false },
    { type: 'text', content: 'Learn more', bbox: [196, 580, 300, 612], confidence: 0.96, interactivity: true },
    { type: 'icon', content: 'a navigation bar icon at bottom', bbox: [24, 760, 72, 812], confidence: 0.79, interactivity: true },
    { type: 'icon', content: 'a search or explore icon', bbox: [112, 760, 160, 812], confidence: 0.83, interactivity: true },
    { type: 'icon', content: 'a plus icon for creating new content', bbox: [200, 760, 248, 812], confidence: 0.90, interactivity: true },
    { type: 'icon', content: 'a chat or messages icon', bbox: [288, 760, 336, 812], confidence: 0.81, interactivity: true },
    { type: 'icon', content: 'a user profile icon', bbox: [376, 760, 412, 812], confidence: 0.92, interactivity: true },
  ],
  latency: 1.24,
  screen_width: 430,
  screen_height: 844,
};

// ============ 状态管理 ============
const activeTab = ref<'visual' | 'text' | 'json'>('visual');
const hoveredIndex = ref<number | null>(null);
const selectedIndex = ref<number | null>(null);
const filterType = ref<'all' | 'text' | 'icon'>('all');

const canvasScale = computed(() => 0.62);

const filteredElements = computed(() => {
  if (filterType.value === 'all') return mockResponse.parsed_content_list;
  return mockResponse.parsed_content_list.filter((el) => el.type === filterType.value);
});

const selectedElement = computed(() => {
  if (selectedIndex.value === null) return null;
  return mockResponse.parsed_content_list[selectedIndex.value] ?? null;
});

const textOutput = computed(() => {
  return mockResponse.parsed_content_list
    .map((el, i) => `[${i}] [${el.type}] [${el.content}]`)
    .join('\n');
});

const jsonOutput = computed(() => {
  return JSON.stringify(
    {
      som_image_base64: '(base64 encoded image data...)',
      parsed_content_list: mockResponse.parsed_content_list,
      latency: mockResponse.latency,
      screen_width: mockResponse.screen_width,
      screen_height: mockResponse.screen_height,
    },
    null,
    2
  );
});

const stats = computed(() => {
  const list = mockResponse.parsed_content_list;
  const textCount = list.filter((el) => el.type === 'text').length;
  const iconCount = list.filter((el) => el.type === 'icon').length;
  const interactiveCount = list.filter((el) => el.interactivity).length;
  const avgConfidence = list.reduce((sum, el) => sum + el.confidence, 0) / list.length;
  return { total: list.length, textCount, iconCount, interactiveCount, avgConfidence };
});

function handleBoxHover(index: number | null) {
  hoveredIndex.value = index;
}

function handleBoxClick(index: number) {
  selectedIndex.value = selectedIndex.value === index ? null : index;
}

function handleListHover(index: number | null) {
  hoveredIndex.value = index;
}

function handleListClick(index: number) {
  selectedIndex.value = selectedIndex.value === index ? null : index;
}

function getConfidenceColor(conf: number): string {
  if (conf >= 0.95) return '#22c55e';
  if (conf >= 0.85) return '#eab308';
  return '#ef4444';
}

function getConfidenceLabel(conf: number): string {
  if (conf >= 0.95) return 'High';
  if (conf >= 0.85) return 'Medium';
  return 'Low';
}

// ✅ 安全复制函数
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
  } catch (e) {
    console.warn('Clipboard copy failed:', e);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <!-- 顶部标题栏 -->
    <header class="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">OmniParser V2 Output Viewer</h1>
            <p class="text-xs text-gray-500">UI Screenshot → Structured Data 复刻展示</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Latency: {{ mockResponse.latency }}s
          </span>
          <span class="px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {{ mockResponse.screen_width }}x{{ mockResponse.screen_height }}
          </span>
        </div>
      </div>
    </header>

    <!-- 统计卡片 -->
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="grid grid-cols-5 gap-3">
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-2xl font-bold text-white">{{ stats.total }}</div>
          <div class="text-xs text-gray-500 mt-1">Total Elements</div>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-2xl font-bold text-blue-400">{{ stats.textCount }}</div>
          <div class="text-xs text-gray-500 mt-1">Text Elements</div>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-2xl font-bold text-purple-400">{{ stats.iconCount }}</div>
          <div class="text-xs text-gray-500 mt-1">Icon Elements</div>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-2xl font-bold text-amber-400">{{ stats.interactiveCount }}</div>
          <div class="text-xs text-gray-500 mt-1">Interactive</div>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-2xl font-bold text-emerald-400">{{ (stats.avgConfidence * 100).toFixed(1) }}%</div>
          <div class="text-xs text-gray-500 mt-1">Avg Confidence</div>
        </div>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center gap-1 bg-gray-900 rounded-xl p-1 w-fit border border-gray-800">
        <button
          v-for="tab in (['visual', 'text', 'json'] as const)"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === tab
              ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          ]"
        >
          {{ tab === 'visual' ? '🔍 Visual Annotation' : tab === 'text' ? '📝 Text Output' : '{ } JSON Output' }}
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="max-w-7xl mx-auto px-6 py-4">
      <!-- Visual 标注视图 -->
      <div v-if="activeTab === 'visual'" class="flex gap-4">
        <!-- 左侧：模拟截图 + 标注框 -->
        <div class="flex-shrink-0">
          <div class="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div class="text-xs text-gray-500 mb-3 font-mono">Input: UI Screenshot (simulated)</div>
            <div
              class="relative bg-white rounded-2xl overflow-hidden shadow-2xl"
              :style="{
                width: mockResponse.screen_width * canvasScale + 'px',
                height: mockResponse.screen_height * canvasScale + 'px'
              }"
            >
              <!-- 模拟 UI 界面 -->
              <div class="absolute inset-0 bg-gray-50" :style="{ transform: `scale(${canvasScale})`, transformOrigin: 'top left', width: mockResponse.screen_width + 'px', height: mockResponse.screen_height + 'px' }">
                <!-- 状态栏 -->
                <div class="h-11 bg-gray-50 flex items-center justify-between px-6">
                  <span class="text-xs text-gray-800 font-semibold">9:41</span>
                  <div class="flex gap-1">
                    <div class="w-4 h-2 bg-gray-800 rounded-sm"></div>
                    <div class="w-4 h-2 bg-gray-800 rounded-sm"></div>
                    <div class="w-6 h-3 bg-gray-800 rounded-sm"></div>
                  </div>
                </div>

                <!-- 顶部导航 -->
                <div class="px-4 py-3 flex items-center justify-between bg-white">
                  <span class="text-lg font-bold text-green-700">Tripadvisor</span>
                  <div class="flex gap-3 items-center">
                    <div class="w-5 h-5 rounded bg-gray-300 flex items-center justify-center text-xs">🔔</div>
                    <div class="w-5 h-5 rounded bg-gray-300 flex items-center justify-center text-xs">🛒</div>
                  </div>
                </div>

                <!-- 搜索栏 -->
                <div class="px-4 py-2">
                  <div class="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm text-gray-400 shadow-sm">
                    Where to?
                  </div>
                </div>

                <!-- 分类标签 -->
                <div class="px-4 py-2 flex gap-2 overflow-hidden">
                  <span class="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 whitespace-nowrap">Nearby</span>
                  <span class="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 whitespace-nowrap">Hotels</span>
                  <span class="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 whitespace-nowrap">Things to Do</span>
                  <span class="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 whitespace-nowrap">Restaurants</span>
                </div>
                <div class="px-4 py-1 flex gap-2">
                  <span class="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 whitespace-nowrap">Flights</span>
                  <span class="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 whitespace-nowrap">Vacation Rentals</span>
                </div>

                <!-- 推荐区域 -->
                <div class="px-4 pt-4 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-red-500">❤️</span>
                    <span class="text-sm font-semibold text-gray-800">Top hotels in Shanghai</span>
                  </div>
                  <span class="text-xs text-green-700 font-medium">See all</span>
                </div>

                <!-- 酒店卡片 -->
                <div class="px-4 py-3 space-y-3">
                  <div class="flex gap-3 items-start">
                    <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-sm">🏨</div>
                    <div>
                      <div class="text-sm font-medium text-gray-800">The Bund Hotel</div>
                      <div class="flex items-center gap-1 mt-0.5">
                        <span class="text-xs font-semibold text-gray-800">4.5</span>
                        <span class="text-yellow-400 text-xs">★★★★★</span>
                        <span class="text-xs text-gray-400">2,847 reviews</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-3 items-start">
                    <div class="w-8 h-8 bg-orange-100 rounded flex items-center justify-center text-orange-600 text-sm">🏨</div>
                    <div>
                      <div class="text-sm font-medium text-gray-800">Jing An Shangri-La</div>
                      <div class="flex items-center gap-1 mt-0.5">
                        <span class="text-xs font-semibold text-gray-800">4.7</span>
                        <span class="text-yellow-400 text-xs">★★★★★</span>
                        <span class="text-xs text-gray-400">3,412 reviews</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Explore 区域 -->
                <div class="px-4 py-3">
                  <div class="flex gap-3 items-center bg-green-50 rounded-xl p-3">
                    <div class="w-32 h-28 bg-gradient-to-br from-green-200 to-emerald-300 rounded-lg flex items-center justify-center text-3xl">☕</div>
                    <div>
                      <div class="text-sm font-semibold text-gray-800">Explore Shanghai</div>
                      <div class="text-xs text-gray-500 mt-1">Discover the best time to visit</div>
                      <div class="text-xs text-green-700 font-medium mt-2">Learn more →</div>
                    </div>
                  </div>
                </div>

                <!-- 底部 Tab 栏 -->
                <div class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2">
                  <div class="flex flex-col items-center gap-0.5">
                    <div class="w-5 h-5 bg-gray-400 rounded"></div>
                    <span class="text-[9px] text-gray-500">Home</span>
                  </div>
                  <div class="flex flex-col items-center gap-0.5">
                    <div class="w-5 h-5 bg-gray-300 rounded"></div>
                    <span class="text-[9px] text-gray-400">Explore</span>
                  </div>
                  <div class="flex flex-col items-center gap-0.5">
                    <div class="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">+</div>
                  </div>
                  <div class="flex flex-col items-center gap-0.5">
                    <div class="w-5 h-5 bg-gray-300 rounded"></div>
                    <span class="text-[9px] text-gray-400">Messages</span>
                  </div>
                  <div class="flex flex-col items-center gap-0.5">
                    <div class="w-5 h-5 bg-gray-300 rounded-full"></div>
                    <span class="text-[9px] text-gray-400">Profile</span>
                  </div>
                </div>
              </div>

              <!-- OmniParser 标注框覆盖层 -->
              <div
                class="absolute inset-0"
                :style="{ transform: `scale(${canvasScale})`, transformOrigin: 'top left', width: mockResponse.screen_width + 'px', height: mockResponse.screen_height + 'px' }"
              >
                <div
                  v-for="(el, i) in mockResponse.parsed_content_list"
                  :key="i"
                  class="absolute cursor-pointer transition-all duration-150"
                  :class="[
                    hoveredIndex === i || selectedIndex === i
                      ? 'z-20'
                      : 'z-10'
                  ]"
                  :style="{
                    left: el.bbox[0] + 'px',
                    top: el.bbox[1] + 'px',
                    width: (el.bbox[2] - el.bbox[0]) + 'px',
                    height: (el.bbox[3] - el.bbox[1]) + 'px',
                    border: hoveredIndex === i || selectedIndex === i
                      ? `2px solid ${el.type === 'text' ? '#3b82f6' : '#a855f7'}`
                      : `1.5px solid ${el.type === 'text' ? 'rgba(59,130,246,0.5)' : 'rgba(168,85,247,0.5)'}`,
                    backgroundColor: hoveredIndex === i || selectedIndex === i
                      ? el.type === 'text' ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)'
                      : 'transparent',
                  }"
                  @mouseenter="handleBoxHover(i)"
                  @mouseleave="handleBoxHover(null)"
                  @click="handleBoxClick(i)"
                >
                  <span
                    class="absolute -top-4 -left-0 text-[9px] font-mono font-bold px-1 rounded"
                    :style="{
                      backgroundColor: el.type === 'text' ? '#3b82f6' : '#a855f7',
                      color: '#fff',
                    }"
                  >
                    {{ i }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 图例 -->
            <div class="flex items-center gap-4 mt-3">
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-sm border-2 border-blue-500 bg-blue-500/10"></div>
                <span class="text-xs text-gray-400">Text</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-3 h-3 rounded-sm border-2 border-purple-500 bg-purple-500/10"></div>
                <span class="text-xs text-gray-400">Icon</span>
              </div>
              <div class="flex items-center gap-1.5 ml-auto">
                <span class="text-xs text-gray-500 font-mono">Hover / Click to inspect</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：元素详情面板 -->
        <div class="flex-1 min-w-0">
          <!-- 筛选 -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xs text-gray-500">Filter:</span>
            <button
              v-for="ft in (['all', 'text', 'icon'] as const)"
              :key="ft"
              @click="filterType = ft"
              :class="[
                'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                filterType === ft
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-gray-200'
              ]"
            >
              {{ ft === 'all' ? `All (${stats.total})` : ft === 'text' ? `Text (${stats.textCount})` : `Icon (${stats.iconCount})` }}
            </button>
          </div>

          <!-- 元素列表 -->
          <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div class="grid grid-cols-[40px_1fr_80px_80px_60px] gap-0 text-xs text-gray-500 font-medium px-3 py-2.5 border-b border-gray-800 bg-gray-900/50">
              <span>#</span>
              <span>Content</span>
              <span>Type</span>
              <span>BBox (xyxy)</span>
              <span>Conf</span>
            </div>
            <div class="max-h-[600px] overflow-y-auto divide-y divide-gray-800/50">
              <div
                v-for="(el, idx) in filteredElements"
                :key="idx"
                class="grid grid-cols-[40px_1fr_80px_80px_60px] gap-0 px-3 py-2 items-center text-xs cursor-pointer transition-colors"
                :class="[
                  selectedIndex === mockResponse.parsed_content_list.indexOf(el)
                    ? 'bg-emerald-500/10'
                    : hoveredIndex === mockResponse.parsed_content_list.indexOf(el)
                    ? 'bg-gray-800/50'
                    : 'hover:bg-gray-800/30'
                ]"
                @mouseenter="handleListHover(mockResponse.parsed_content_list.indexOf(el))"
                @mouseleave="handleListHover(null)"
                @click="handleListClick(mockResponse.parsed_content_list.indexOf(el))"
              >
                <span class="font-mono text-gray-500">{{ mockResponse.parsed_content_list.indexOf(el) }}</span>
                <span class="truncate text-gray-200" :title="el.content">{{ el.content }}</span>
                <span
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium w-fit"
                  :class="el.type === 'text' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'"
                >
                  {{ el.type }}
                </span>
                <span class="font-mono text-gray-400 text-[10px]">{{ el.bbox[0]}},{{ el.bbox[1] }}</span>
                <span
                  class="font-mono text-[10px] font-semibold"
                  :style="{ color: getConfidenceColor(el.confidence) }"
                >
                  {{ (el.confidence * 100).toFixed(0) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- 选中元素详情 -->
          <div v-if="selectedElement" class="mt-4 bg-gray-900 rounded-xl border border-emerald-500/30 p-4">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-emerald-400 text-sm font-semibold">Element Detail</span>
              <span class="text-xs text-gray-500 font-mono">#{{ selectedIndex }}</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-gray-500 block mb-1">Type</span>
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="selectedElement.type === 'text' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'"
                >
                  {{ selectedElement.type }}
                </span>
              </div>
              <div>
                <span class="text-gray-500 block mb-1">Interactivity</span>
                <span class="px-2 py-0.5 rounded text-xs font-medium" :class="selectedElement.interactivity ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-700 text-gray-400'">
                  {{ selectedElement.interactivity ? 'Interactive' : 'Static' }}
                </span>
              </div>
              <div class="col-span-2">
                <span class="text-gray-500 block mb-1">Content</span>
                <span class="text-gray-200 break-all">{{ selectedElement.content }}</span>
              </div>
              <div class="col-span-2">
                <span class="text-gray-500 block mb-1">Bounding Box (xyxy)</span>
                <code class="text-emerald-400 font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                  [{{ selectedElement.bbox.join(', ') }}]
                </code>
              </div>
              <!-- ✅ 修复：删除了多余的 </div>，以下元素现在正确在 grid 容器内 -->
              <div>
                <span class="text-gray-500 block mb-1">Confidence</span>
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :style="{ width: (selectedElement.confidence * 100) + '%', backgroundColor: getConfidenceColor(selectedElement.confidence) }"
                    ></div>
                  </div>
                  <span class="font-mono" :style="{ color: getConfidenceColor(selectedElement.confidence) }">
                    {{ (selectedElement.confidence * 100).toFixed(1) }}%
                  </span>
                  <span class="text-gray-500">({{ getConfidenceLabel(selectedElement.confidence) }})</span>
                </div>
              </div>
              <div>
                <span class="text-gray-500 block mb-1">Size (w × h)</span>
                <span class="font-mono text-gray-300">
                  {{ selectedElement.bbox[2] - selectedElement.bbox[0] }} × {{ selectedElement.bbox[3] - selectedElement.bbox[1] }} px
                </span>
              </div>
            </div>
          </div>

          <!-- 无选中时显示格式说明 -->
          <div v-else class="mt-4 bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div class="text-sm font-semibold text-gray-300 mb-3">OmniParser V2 Output Schema</div>
            <pre class="text-xs text-gray-400 font-mono bg-gray-800/50 rounded-lg p-3 overflow-x-auto leading-relaxed"><span class="text-emerald-400">interface</span> <span class="text-yellow-300">OmniParserResponse</span> {
  som_image_base64: <span class="text-blue-400">string</span>       <span class="text-gray-600">// 标注后的图像 (base64)</span>
  parsed_content_list: <span class="text-blue-400">ParsedElement[]</span> <span class="text-gray-600">// 解析元素列表</span>
  latency: <span class="text-blue-400">number</span>              <span class="text-gray-600">// 解析耗时 (秒)</span>
  screen_width: <span class="text-blue-400">number</span>         <span class="text-gray-600">// 截图宽度</span>
  screen_height: <span class="text-blue-400">number</span>        <span class="text-gray-600">// 截图高度</span>
}

<span class="text-emerald-400">interface</span> <span class="text-yellow-300">ParsedElement</span> {
  type: <span class="text-blue-400">"text" | "icon"</span>     <span class="text-gray-600">// 元素类型</span>
  content: <span class="text-blue-400">string</span>           <span class="text-gray-600">// 文本内容 or 图标描述</span>
  bbox: <span class="text-blue-400">[x1, y1, x2, y2]</span>   <span class="text-gray-600">// 边界框 (xyxy像素坐标)</span>
  confidence: <span class="text-blue-400">number</span>        <span class="text-gray-600">// 置信度 0~1</span>
  interactivity: <span class="text-blue-400">boolean</span>     <span class="text-gray-600">// 是否可交互</span>
}</pre>
          </div>
        </div>
      </div>

      <!-- Text 输出视图 -->
      <div v-if="activeTab === 'text'" class="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="text-sm font-semibold text-gray-300">OmniParser V2 — Text Output</div>
            <div class="text-xs text-gray-500 mt-1">原始文本格式输出，每行：[序号] [类型] [内容]</div>
          </div>
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors border border-gray-700"
            @click="copyToClipboard(textOutput)"
          >
            Copy
          </button>
        </div>
        <!-- ✅ 修复：改用 v-for 直接渲染 span，避免 template 在 pre 内的兼容问题 -->
        <pre class="text-sm font-mono leading-loose bg-gray-800/50 rounded-lg p-4 overflow-x-auto"><span
          v-for="(el, i) in mockResponse.parsed_content_list"
          :key="i"
          :class="i === hoveredIndex ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-300'"
          class="px-1 rounded cursor-pointer"
          @mouseenter="hoveredIndex = i"
          @mouseleave="hoveredIndex = null"
        >[{{ i }}] [{{ el.type }}] [{{ el.content }}]
</span></pre>
      </div>

      <!-- JSON 输出视图 -->
      <div v-if="activeTab === 'json'" class="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <div class="text-sm font-semibold text-gray-300">OmniParser V2 — JSON Response</div>
            <div class="text-xs text-gray-500 mt-1">完整的 API 响应 JSON 结构（/parse/ 端点返回值）</div>
          </div>
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors border border-gray-700"
            @click="copyToClipboard(jsonOutput)"
          >
            Copy
          </button>
        </div>
        <pre class="text-xs font-mono leading-relaxed bg-gray-800/50 rounded-lg p-4 overflow-x-auto max-h-[700px] overflow-y-auto text-gray-300">{{ jsonOutput }}</pre>
      </div>
    </div>

    <!-- 底部说明 -->
    <div class="max-w-7xl mx-auto px-6 py-8 border-t border-gray-800 mt-8">
      <div class="text-center">
        <div class="text-sm font-semibold text-gray-400 mb-2">OmniParser V2 能否作为"前端开发素材"？</div>
        <div class="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
          <strong class="text-gray-300">可以，但需补全。</strong>
          OmniParser V2 提供了元素坐标(bbox)、类型(text/icon)、内容(OCR文本/图标描述)、置信度和可交互性——这是前端还原的<strong class="text-emerald-400">核心骨架</strong>。
          但它<strong class="text-amber-400">缺失三项关键信息</strong>：① 颜色值（背景色、文字色需外挂取色模块）；② 层级关系（输出为平面列表，需基于空间包含关系推导 DOM 树）；③ 精确样式（字号、圆角、阴影等）。
          推荐工作流：<strong class="text-gray-300">OmniParser 初稿 → OpenCV 取色 → 层级推导算法 → 人工修正 → 结构化 Design Token JSON</strong>。
        </div>
      </div>
    </div>
  </div>
</template>