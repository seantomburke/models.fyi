import type { Provider } from './types.ts'

export const providers: Provider[] = [
  { id: 'anthropic', name: 'Anthropic', color: '#D97757', openSource: false },
  { id: 'openai', name: 'OpenAI', color: '#10A37F', openSource: false },
  { id: 'google', name: 'Google', color: '#4285F4', openSource: false },
  { id: 'xai', name: 'xAI', color: '#1D1D1F', openSource: false },
  // Meta pivoted closed with Muse Spark (2026); its Llama 4 models stay open at the model level.
  { id: 'meta', name: 'Meta', color: '#0668E1', openSource: false },
  // Moonshot sells Kimi K3 via API today; open weights are promised for late July 2026.
  { id: 'moonshot', name: 'Moonshot AI', color: '#7C3AED', openSource: false },
  { id: 'thinking-machines', name: 'Thinking Machines', color: '#0D9488', openSource: true },
  { id: 'deepseek', name: 'DeepSeek', color: '#4D6BFE', openSource: true },
  { id: 'alibaba', name: 'Alibaba (Qwen)', color: '#FF6A00', openSource: true },
  { id: 'zhipu', name: 'Z.ai (GLM)', color: '#3B82F6', openSource: true },
]
