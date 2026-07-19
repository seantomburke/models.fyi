/**
 * FAQ content organized by category.
 * Each Q&A is used for the FAQ page and JSON-LD schema.
 */

export interface FAQItem {
  question: string
  answer: string
  category: 'Getting Started' | 'Model Selection' | 'Pricing' | 'Technical' | 'Benchmarks'
}

export const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is Models.fyi?',
    answer:
      'Models.fyi simplifies AI model selection for everyone. We compare flagship models from OpenAI, Anthropic, Google, xAI, and others across benchmarks, cost, and capability. Our goal: help you pick the right model for your task without needing a PhD in machine learning.',
  },
  {
    category: 'Getting Started',
    question: 'Do I need technical knowledge to use this site?',
    answer:
      'No. Everything on Models.fyi is written in plain language, with simple analogies and no jargon. The Learn section teaches you what an LLM is, what a context window means, and what benchmarks measure. Start there if you\'re new to AI.',
  },
  {
    category: 'Getting Started',
    question: 'How do I get started choosing a model?',
    answer:
      'Try the "Which model?" quiz first. It asks you who you are, what you\'re trying to do, and your budget, then recommends a model with reasoning you can verify. If you want to compare specific models, head to Compare. If you want to explore performance visually, try Graph.',
  },
  {
    category: 'Getting Started',
    question: 'What is the difference between this site and ChatGPT?',
    answer:
      'ChatGPT is one AI model made by OpenAI. Models.fyi is an educational site that compares ChatGPT with Claude, Gemini, Grok, and open-source alternatives, showing you the pros and cons of each so you can pick the best fit for your task.',
  },

  // Model Selection
  {
    category: 'Model Selection',
    question: 'Which model is the best?',
    answer:
      '"Best" depends on your task. A top-performing reasoning model might be too slow and expensive for a chatbot. A cheap, fast model might struggle with complex logic. That\'s why this site exists: to help you match the model to your needs, not just pick the highest benchmark score.',
  },
  {
    category: 'Model Selection',
    question: 'Should I use Claude or GPT?',
    answer:
      'Both are excellent. Claude is made by Anthropic, GPT by OpenAI. Benchmark scores are close for many tasks. Claude may excel at long-context work and nuanced analysis. GPT may be faster for some use cases. Try both with your actual task and pick based on results, not brand loyalty.',
  },
  {
    category: 'Model Selection',
    question: 'Can I use open-source models?',
    answer:
      'Yes. Open-source models like Llama, DeepSeek, and Mixtral can be cheaper and offer privacy (you run them yourself). But they\'re generally less capable than GPT or Claude. Pick open-source if cost or privacy wins out for your task. Compare them here to find the best match.',
  },
  {
    category: 'Model Selection',
    question: 'Do all models have access to the internet?',
    answer:
      'No. Some models, like GPT-4o and Claude 3.5 Sonnet, can access the web in real time and provide fresh information. Others (especially open-source models) cannot. If your task needs current news, stock prices, or live data, check whether the model has web access before choosing.',
  },
  {
    category: 'Model Selection',
    question: 'What are reasoning or thinking models?',
    answer:
      'Reasoning models spend extra time "thinking" through hard problems before answering, like showing your work on a math exam. They\'re slower and more expensive, but much better at complex logic, coding, and tricky questions. Use them for hard problems; use faster models for simple ones.',
  },

  // Pricing
  {
    category: 'Pricing',
    question: 'Why do model prices vary so much?',
    answer:
      'Powerful models cost more to run. A large, capable model requires more computing power per request than a smaller, faster one. You pay for that. Prices also vary by provider: OpenAI, Anthropic, Google, and others set their own rates. Compare prices on this site before committing.',
  },
  {
    category: 'Pricing',
    question: 'How do I calculate the cost of using a model?',
    answer:
      'Models are priced per token (roughly a word). Input tokens (your prompt) and output tokens (the model\'s answer) are often priced differently. Use the Calculator tool on this site: paste your text, pick your model, and it shows total cost. Most providers also bill by the API call, not per token.',
  },
  {
    category: 'Pricing',
    question: 'Are thinking tokens more expensive?',
    answer:
      'Yes. Thinking tokens are billed at a premium because the model uses extra compute to reason through your question. GPT-4o, for example, charges more per thinking token than regular tokens. If cost is tight, use thinking tokens sparingly, only for questions that truly need them.',
  },
  {
    category: 'Pricing',
    question: 'Can I estimate my monthly AI bill?',
    answer:
      'Yes. Count how many requests you make per month, estimate tokens per request (use the Calculator), multiply by the model\'s price per token, and add any API overhead. Start with a pilot and track real spending. Most providers offer usage dashboards so you can see costs in real time.',
  },

  // Technical
  {
    category: 'Technical',
    question: 'What is a context window?',
    answer:
      'The context window is how much text a model can "see" at once, measured in tokens. A 4K context window means the model sees about 4,000 words of history. If your task involves analyzing long documents or keeping long conversations, you need a large context window.',
  },
  {
    category: 'Technical',
    question: 'Do I need a large context window?',
    answer:
      'Only if your task needs it. If you\'re writing emails or answering quick questions, a 4K window is plenty. If you\'re analyzing 50-page legal documents or code repositories, you need 100K or more. Check your actual needs before paying extra for unused context.',
  },
  {
    category: 'Technical',
    question: 'What is a token?',
    answer:
      'A token is a chunk of text, roughly a word, but sometimes shorter since punctuation is often its own token. Models process and generate text one token at a time. Pricing is based on tokens: more tokens = more cost. The Calculator tool shows how many tokens your text contains.',
  },
  {
    category: 'Technical',
    question: 'Can I run models locally?',
    answer:
      'Yes, open-source models like Llama can run on your computer. This gives you privacy (nothing leaves your machine) but requires strong hardware and is generally slower. Cloud models (ChatGPT, Claude) are faster but your data goes to their servers. Choose based on your privacy and performance needs.',
  },
  {
    category: 'Technical',
    question: 'What is an API?',
    answer:
      'An API (Application Programming Interface) lets your app send requests to a model and get answers back programmatically. Instead of typing into ChatGPT, your code calls the model directly, getting results your app can use instantly. Most AI companies offer APIs; this site compares their pricing and capabilities.',
  },

  // Benchmarks
  {
    category: 'Benchmarks',
    question: 'What are benchmarks?',
    answer:
      'Benchmarks are standardized tests that measure how well models perform on specific tasks: math, coding, reading comprehension, logic puzzles, etc. Companies publish benchmark scores to show their model\'s strengths. A high score means good performance on that task.',
  },
  {
    category: 'Benchmarks',
    question: 'Can I trust benchmark scores?',
    answer:
      'Mostly, but with healthy skepticism. Benchmarks measure narrow tasks (e.g., "solve this math problem in one shot"). Real-world tasks are messier and require human judgment. A model with a 90% benchmark score might not always work best for your actual use case. Test it with your own data.',
  },
  {
    category: 'Benchmarks',
    question: 'What benchmarks matter most?',
    answer:
      'It depends on your task. For coding, AIME and GPQA matter. For reasoning, look at GSM8K or ARC. For language understanding, MMLU is common. This site lists which benchmarks are relevant for different tasks. Read the Learn section to understand what each benchmark measures.',
  },
  {
    category: 'Benchmarks',
    question: 'Why do models have different scores on the same benchmark?',
    answer:
      'Different companies use slightly different versions of benchmarks, test at different times, and may tweak parameters. Also, benchmark results vary slightly each run due to randomness in the model. Small differences (1-3%) are usually noise; bigger gaps are real.',
  },
  {
    category: 'Benchmarks',
    question: 'How often are benchmarks updated?',
    answer:
      'As models improve and new benchmarks emerge, scores change constantly. Models.fyi updates its benchmark data regularly as providers publish new scores. Check the data refresh date at the bottom of the site to see how current the numbers are.',
  },
]

export function faqsByCategory(category: FAQItem['category']): FAQItem[] {
  return faqs.filter((faq) => faq.category === category)
}

export const faqCategories = Array.from(new Set(faqs.map((faq) => faq.category)))
