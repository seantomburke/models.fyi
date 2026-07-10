import type { Provider } from './types.ts'

export const providers: Provider[] = [
  { id: 'anthropic', name: 'Anthropic', color: '#D97757', openSource: false },
  { id: 'openai', name: 'OpenAI', color: '#10A37F', openSource: false },
  { id: 'google', name: 'Google', color: '#4285F4', openSource: false },
  { id: 'xai', name: 'xAI', color: '#1D1D1F', openSource: false },
  { id: 'meta', name: 'Meta', color: '#0668E1', openSource: true },
  { id: 'deepseek', name: 'DeepSeek', color: '#4D6BFE', openSource: true },
  { id: 'alibaba', name: 'Alibaba (Qwen)', color: '#FF6A00', openSource: true },
  { id: 'zhipu', name: 'Z.ai (GLM)', color: '#3B82F6', openSource: true },
]
