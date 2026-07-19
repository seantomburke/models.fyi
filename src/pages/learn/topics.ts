/**
 * Education content: Karpathy-style plain-language explainers.
 * Each topic is its own route for SEO. The slugs and meta titles target
 * the search phrases from the product requirements.
 */

import { TokenVisualization } from '../../components/learn/TokenVisualization'

export interface TopicSection {
  heading: string
  paragraphs: string[]
  component?: React.ComponentType
}

export interface Topic {
  slug: string
  /** Question shown in nav/cards and as the H1. */
  question: string
  metaTitle: string
  metaDescription: string
  /** One-line hook shown on the index cards. */
  hook: string
  sections: TopicSection[]
}

export const topics: Topic[] = [
  {
    slug: 'what-is-an-ai-model',
    question: 'What is an AI model?',
    metaTitle: 'What is an AI model? Explained simply - Models.fyi',
    metaDescription:
      'What is an AI model, in plain language: a program with billions of tuned dials that learned patterns from data. No math, no jargon, explained like you\'re five.',
    hook: 'A program that learned from examples instead of being told the rules.',
    sections: [
      {
        heading: 'The five-year-old version',
        paragraphs: [
          'Normal computer programs are recipe books. A person writes exact steps, and the computer follows them. An AI model doesn\'t get written like a recipe. Instead, you show it millions of examples, and it learns the patterns on its own.',
          'Imagine teaching a kid what a dog is. You don\'t hand them a rulebook: four legs, fur, tail. You point at dogs until they just get it. That\'s how models learn.',
        ],
      },
      {
        heading: 'What a model is, under the hood',
        paragraphs: [
          'Under the hood, a model is a giant pile of numbers, billions of little dials. Training a model means nudging those dials, over and over, until the model\'s guesses about its examples stop being wrong. That tuning run takes months on warehouses full of computers, which is why building one costs so much.',
          'Once trained, a model doesn\'t "look things up." Everything it knows is squeezed into those dials, like a student who read the whole library but walks into the exam with no notes.',
        ],
      },
      {
        heading: 'Why there are so many of them',
        paragraphs: [
          'Companies keep training new models because bigger, better-tuned piles of dials keep getting smarter. Each release is a new "brain" with different strengths, speeds, and prices. That is why picking the right one matters, and why this site exists.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-an-llm',
    question: 'What is an LLM?',
    metaTitle: 'What is an LLM? Large Language Models explained - Models.fyi',
    metaDescription:
      'What is an LLM? A Large Language Model is a giant autocomplete trained on much of the internet. How next-word prediction turns into intelligence, explained simply.',
    hook: 'The world\'s most powerful autocomplete, and that\'s not an insult.',
    sections: [
      {
        heading: 'Autocomplete, but enormous',
        paragraphs: [
          'LLM stands for Large Language Model. At its heart, it does one deceptively simple thing: given some text, it predicts the next word. "The cat sat on the ___" probably continues with "mat".',
          'Your phone\'s keyboard does this too. The difference is scale. An LLM has read a huge slice of the internet and has billions of dials tuned for the job. Predicting the next word this well forces the model to understand grammar, facts, logic, even code.',
        ],
      },
      {
        heading: 'One word at a time',
        paragraphs: [
          'When ChatGPT or Claude "writes" you an answer, it\'s predicting one word, adding it to the page, then predicting the next, thousands of times, fast. There\'s no separate "essay plan" hiding inside. The plan emerges from doing next-word prediction with superhuman skill.',
          'This also explains the famous weakness. An LLM says what\'s likely, not what\'s verified. When likely and true disagree, you get confident nonsense. People call this a hallucination.',
        ],
      },
      {
        heading: 'The models on this site',
        paragraphs: [
          'GPT, Claude, Gemini, Grok, Llama, DeepSeek: all LLMs. Same core idea, different training data, sizes, and tuning. That\'s why they have different personalities and different scores on our comparison table.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-gpt',
    question: 'What is GPT?',
    metaTitle: 'What is GPT? What the letters mean - Models.fyi',
    metaDescription:
      'What does GPT stand for? Generative Pre-trained Transformer, decoded word by word in plain language, and how GPT differs from ChatGPT.',
    hook: 'Three ordinary words hiding behind one famous acronym.',
    sections: [
      {
        heading: 'Decode the letters',
        paragraphs: [
          'G is for Generative. It creates new text rather than picking from canned replies.',
          'P is for Pre-trained. Before you ever talk to it, it spent months learning from a mountain of text, so you get the finished student, not the classroom.',
          'T is for Transformer, the 2017 invention that made all this work. It\'s a design that lets the model weigh every word in your message against every other word at once, instead of reading one word at a time and forgetting the start of the sentence.',
        ],
      },
      {
        heading: 'GPT vs ChatGPT',
        paragraphs: [
          'GPT is the engine. ChatGPT is the car built around it: the chat app, the safety layer, the web search. OpenAI names its engines GPT-something, like GPT-5.6, and the app stays ChatGPT.',
          'Other companies build the same kind of engine with different names: Anthropic\'s Claude, Google\'s Gemini, xAI\'s Grok. People sometimes say "a GPT" for any of them, like saying "googling" for any search.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-a-context-window',
    question: 'What is a context window?',
    metaTitle: 'What is a context window? AI memory explained - Models.fyi',
    metaDescription:
      'What is a context window in AI? The model\'s working memory: how much text it can consider at once, why it\'s measured in tokens, and why size matters.',
    hook: 'The size of the model\'s desk, and what falls off the edge.',
    sections: [
      {
        heading: 'The desk analogy',
        paragraphs: [
          'A model\'s context window is its working memory: everything it can "see" at once, including your question, the conversation so far, and any documents you pasted in. Think of it as a desk. A small desk fits one letter. A huge desk fits every binder for a whole project, spread out where the model can read all of it.',
          'When the desk is full, the oldest pages fall off the edge. That\'s why a very long chat can suddenly "forget" what you said at the start. It literally can\'t see it anymore.',
        ],
      },
      {
        heading: 'Tokens: word pieces',
        paragraphs: [
          'Context windows are measured in tokens, chunks of about three-quarters of a word. "Hamburger" might be three tokens, while "the" is one. A 1M-token window is roughly 750,000 words: the whole Lord of the Rings trilogy with room to spare.',
          'On our comparison table, context ranges from 200K tokens, about a long novel, to Llama 4 Scout\'s absurd 10M, about a small library. Bigger isn\'t automatically better, since you pay for what the model reads, but for big documents it\'s the number that decides whether the job is possible at all.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-a-token',
    question: 'What is a token?',
    metaTitle: 'What is a token? AI tokenization explained - Models.fyi',
    metaDescription:
      'What is a token in AI? How text gets broken into chunks, why tokens matter for cost and context, and how to estimate your API bills.',
    hook: 'The billing unit for AI: about 3/4 of a word, but not always.',
    sections: [
      {
        heading: 'Tokens are how models read',
        paragraphs: [
          'A token is a small chunk of text. Models don\'t read whole words or sentences at once. They read tokens: single characters, word pieces, or whole small words, depending on what\'s common.',
          '"The" is one token. "Hamburger" might be three tokens: "ham", "burg", "er". Mathematical symbols, punctuation, and newlines also get tokenized. The pattern depends on the model\'s tokenizer, which is tuned during training.',
        ],
      },
      {
        heading: 'Why tokens exist',
        paragraphs: [
          'Models are trained on numerical patterns, and tokens convert text into chunks manageable for math. Smaller chunks (single characters) give you more precision but make sequences very long. Larger chunks (whole words) are more efficient but miss detail. Tokens strike a balance: usually 1-3 tokens per word, optimized for the language and the model.',
        ],
        component: TokenVisualization,
      },
    ],
  },
  {
    slug: 'reasoning-models',
    question: 'What is a reasoning model?',
    metaTitle: 'Reasoning vs non-reasoning AI models explained - Models.fyi',
    metaDescription:
      'What is a reasoning or thinking AI model? Why some models pause to think step by step before answering, when that helps, and when it\'s a waste of money.',
    hook: 'Some models blurt out answers. Others grab scratch paper first.',
    sections: [
      {
        heading: 'Scratch paper',
        paragraphs: [
          'Ask someone 7x8 and they answer instantly from memory. Ask them 47x83 and they want scratch paper. Reasoning models, also called "thinking" models, are LLMs that learned to use scratch paper. Before answering, they privately write out steps, check their own work, and only then reply.',
          'That thinking phase is text the model generates. You usually just see a "thinking..." pause, and sometimes a summary of it.',
        ],
      },
      {
        heading: 'When it matters, and when it doesn\'t',
        paragraphs: [
          'For math, tricky code, and multi-step planning, reasoning is a huge upgrade. The model catches its own mistakes mid-way instead of committing to a bad first guess.',
          'For "write a birthday message," it\'s a waste. You pay for thinking time in both money and seconds. That\'s why fast models exist, and why the newest models decide for themselves how hard to think based on the question.',
          'Almost every current flagship is a reasoning model, marked with the brain badge on our comparison table. The main exceptions are speed-focused and older open models.',
        ],
      },
    ],
  },
  {
    slug: 'which-model-should-i-use',
    question: 'Which model should I use?',
    metaTitle: 'Which AI model should I use? A plain answer - Models.fyi',
    metaDescription:
      'Which AI model should you use? The short answer for most people, plus an interactive quiz that matches a model to your task, budget, and preferences.',
    hook: 'The honest short answer, and a quiz for the real one.',
    sections: [
      {
        heading: 'The short answer',
        paragraphs: [
          'For most people, most of the time, a mid-tier model from any major company, like Claude Sonnet or GPT-5.6 Terra, is fast, cheap, and smarter than you need. Save the premium flagships for hard coding, research, and long autonomous work, and use a fast tier for bulk simple stuff.',
          'If your question involves anything recent, like news, prices, or sports, make sure the model can search the web. Models only know what existed when their training ended.',
        ],
      },
      {
        heading: 'The real answer',
        paragraphs: [
          'It depends on what you\'re doing, what you\'ll spend, and whether you care about open source. That\'s exactly what our quiz asks: four questions, one recommendation, reasoning included.',
        ],
      },
    ],
  },
  // Comparison topics
  {
    slug: 'claude-vs-gpt',
    question: 'Claude vs GPT: Which should I use?',
    metaTitle: 'Claude vs GPT - head-to-head comparison - Models.fyi',
    metaDescription:
      'Claude vs ChatGPT: how they differ in reasoning, coding, tone, pricing, and when to pick each. Direct comparison of Anthropic\'s and OpenAI\'s flagship models.',
    hook: 'The two heavyweight champions, compared where it actually matters.',
    sections: [
      {
        heading: 'Who built them',
        paragraphs: [
          'Claude comes from Anthropic, a San Francisco AI safety company. GPT comes from OpenAI, also in San Francisco, known for ChatGPT and pushing capabilities forward. Both companies take safety seriously and release multiple tiers.',
        ],
      },
      {
        heading: 'Personality and style',
        paragraphs: [
          'Claude tends to be thoughtful and explanatory. It works through problems carefully and admits uncertainty. GPT tends to be faster and more direct, with less hedging.',
          'Neither is objectively better. If you like a reasoning AI that walks you through its thinking, Claude. If you want fast, confident answers, GPT.',
        ],
      },
      {
        heading: 'What they\'re good at',
        paragraphs: [
          'Claude: analysis, writing, coding with clear explanations. GPT: broad knowledge, speed, multimodal (Claude just added this). For math and tricky logic, both have reasoning models that pause to think.',
        ],
      },
      {
        heading: 'Price and availability',
        paragraphs: [
          'Both offer cheap fast tiers and expensive flagship tiers. GPT is available through ChatGPT (web, app, API). Claude is on Claude.ai, API, and select partners. No strong winner on cost--depends on your workload.',
        ],
      },
    ],
  },
  {
    slug: 'claude-vs-gemini',
    question: 'Claude vs Gemini: Which is better?',
    metaTitle: 'Claude vs Gemini - comparison and when to use each - Models.fyi',
    metaDescription:
      'Claude vs Google Gemini: strengths, weaknesses, pricing, and when Anthropic\'s Claude or Google\'s Gemini is the right pick for your task.',
    hook: 'Anthropic\'s focused bet vs Google\'s everything-plus approach.',
    sections: [
      {
        heading: 'Google\'s breadth vs Anthropic\'s focus',
        paragraphs: [
          'Google Gemini is built into Gmail, Drive, Photos, and Android. If you live in the Google ecosystem, Gemini is already there. Claude is a standalone product, no ecosystem lock-in.',
          'Gemini is a newer brand built on Google\'s existing research, while Claude is Anthropic\'s entire product. Anthropic is smaller and focuses on safety and capabilities; Google is vast and plays longer games.',
        ],
      },
      {
        heading: 'Capabilities',
        paragraphs: [
          'Both handle text, image understanding, and coding. Claude has longer context windows (200K to 1M tokens). Gemini is better integrated with web search through Google.',
          'For pure reasoning, Claude\'s latest is slightly ahead on benchmarks. For search and real-time data, Gemini wins.',
        ],
      },
      {
        heading: 'Pick Claude if you want:',
        paragraphs: [
          'Focused, thoughtful AI that walks you through reasoning. Longer context for whole-document analysis. A company betting on AI safety.',
        ],
      },
      {
        heading: 'Pick Gemini if you want:',
        paragraphs: [
          'Deep integration with Google apps and Android. Search-powered answers with fresh data. Access through your Google account.',
        ],
      },
    ],
  },
  {
    slug: 'grok-vs-gpt',
    question: 'Grok vs GPT: Where Grok stands',
    metaTitle: 'Grok vs GPT - xAI\'s answer to OpenAI - Models.fyi',
    metaDescription:
      'Grok vs ChatGPT: how xAI\'s Grok compares to OpenAI\'s GPT, when to use each, and what makes Grok different.',
    hook: 'The new kid trying to outrun the established name.',
    sections: [
      {
        heading: 'The underdog',
        paragraphs: [
          'Grok is xAI\'s answer to GPT. xAI is Elon Musk\'s AI company, founded in 2023. They built Grok to be faster, cheaper, and more irreverent than competitors. Grok is available through X (formerly Twitter) and an API.',
        ],
      },
      {
        heading: 'What Grok does well',
        paragraphs: [
          'Speed. Grok is optimized for quick answers. Real-time data through X integration. Cheaper per token than many flagships. Smaller deployments so lower latency.',
        ],
      },
      {
        heading: 'Where GPT still leads',
        paragraphs: [
          'GPT has years of refinement and a bigger user base. More third-party integrations. Larger flagship models (GPT-5.6) still beat Grok on complex reasoning.',
        ],
      },
      {
        heading: 'Try Grok if:',
        paragraphs: [
          'You want speed and real-time news. You like Musk or X\'s direction. You need a cheaper fast option. For serious reasoning or long-form work, GPT remains the safer pick.',
        ],
      },
    ],
  },
  // Use case topics
  {
    slug: 'best-model-for-coding',
    question: 'What\'s the best AI model for coding?',
    metaTitle: 'Best AI model for coding - comparison and tips - Models.fyi',
    metaDescription:
      'Best AI model for software engineering and coding: how to pick between Claude, GPT, and others for different coding tasks, from quick fixes to system design.',
    hook: 'The models that can actually write your code without breaking it.',
    sections: [
      {
        heading: 'What coders need',
        paragraphs: [
          'Coding needs accuracy, reasoning, and long context. A model must understand syntax, avoid subtle bugs, and handle whole files. It should spot its own mistakes if asked.',
          'All flagship models can code. Difference is in reliability and speed.',
        ],
      },
      {
        heading: 'Claude for coding',
        paragraphs: [
          'Claude excels at thorough code review and refactoring. It catches edge cases and explains the reasoning. Developers report fewer silent bugs when Claude writes code.',
          'Best for: complex architectures, security-critical code, teaching junior engineers.',
        ],
      },
      {
        heading: 'GPT for coding',
        paragraphs: [
          'GPT is fast. GPT-5.6 reasons well. You get quick solutions with reasonable explanations. Slightly less careful than Claude on edge cases.',
          'Best for: quick scripts, boilerplate, speedy iteration.',
        ],
      },
      {
        heading: 'The tier question',
        paragraphs: [
          'For junior tasks (style fixes, tests, docs), use a mid-tier model and save money. For architecting a new system, use a flagship with reasoning. Speed models are fast but miss subtleties.',
        ],
      },
    ],
  },
  {
    slug: 'best-model-for-writing',
    question: 'What\'s the best AI model for writing?',
    metaTitle: 'Best AI model for writing and content creation - Models.fyi',
    metaDescription:
      'Best AI model for writing blog posts, essays, emails, and content: how to pick between Claude, GPT, and others for different writing tasks.',
    hook: 'The models that sound human and finish your thoughts.',
    sections: [
      {
        heading: 'What writers need',
        paragraphs: [
          'Writing needs tone, flow, and original voice. A model must adapt to your style, catch repetition, and know when to be formal vs casual. It should finish thoughts, not invent them.',
        ],
      },
      {
        heading: 'Claude for writing',
        paragraphs: [
          'Claude is thoughtful and clear. It asks clarifying questions before drafting. Produces well-reasoned essays, explanations, and marketing copy.',
          'Best for: long-form content, essays, everything-from-scratch writing.',
        ],
      },
      {
        heading: 'GPT for writing',
        paragraphs: [
          'GPT is faster and more versatile. Good for editing, rewriting, and tight deadlines. Can juggle multiple voices.',
          'Best for: quick drafts, editing, stylistic variation.',
        ],
      },
      {
        heading: 'For both: use mid-tier first',
        paragraphs: [
          'Sonnet and GPT-5.6 Terra (not the flagships) are fast enough and cheap enough for everyday writing. Upgrade to a flagship if you\'re iterating on something that needs to be perfect.',
        ],
      },
    ],
  },
  {
    slug: 'best-model-for-research',
    question: 'What\'s the best AI model for research?',
    metaTitle: 'Best AI model for research and analysis - Models.fyi',
    metaDescription:
      'Best AI model for research, data analysis, and complex problem-solving: how to pick between Claude, GPT, and others for academic and professional research.',
    hook: 'The models that cite sources and admit what they don\'t know.',
    sections: [
      {
        heading: 'What research needs',
        paragraphs: [
          'Research needs accuracy, citations, and intellectual honesty. A model must synthesize multiple sources, flag gaps, and admit uncertainty. Long context helps for reading whole papers.',
        ],
      },
      {
        heading: 'Claude for research',
        paragraphs: [
          'Claude is the research favorite. It synthesizes clearly, flags assumptions, and admits limits. Can handle 200K-token papers in a single query.',
          'Best for: literature review, synthesis, academic writing.',
        ],
      },
      {
        heading: 'GPT for research',
        paragraphs: [
          'GPT is broader and faster. Less likely to miss context, more likely to confidently state something uncertain.',
          'Best for: quick literature scans, trend analysis.',
        ],
      },
      {
        heading: 'Pro tip',
        paragraphs: [
          'For research, use a flagship with reasoning (Opus, GPT-5.6 Sol). The cost is worth the accuracy. Always verify claims in the original sources--no model is a substitute for that.',
        ],
      },
    ],
  },
  // Concept topics
  {
    slug: 'vision-models',
    question: 'What are vision models?',
    metaTitle: 'What are vision models? AI that sees images - Models.fyi',
    metaDescription:
      'What are vision models? How AI models understand and analyze images, the difference from text models, and which models have vision today.',
    hook: 'Text models that learned to see.',
    sections: [
      {
        heading: 'Beyond text',
        paragraphs: [
          'A text-only model reads words. A vision model reads words and images. Show it a photo, ask a question about it, and it answers. Same magic as text models, but trained on billions of image-text pairs.',
        ],
      },
      {
        heading: 'What they can do',
        paragraphs: [
          'Read text in images (OCR). Describe what\'s happening. Spot objects and faces. Analyze charts and diagrams. Answer questions about visual content. All of this is trained-in, not programmed.',
        ],
      },
      {
        heading: 'The models that see',
        paragraphs: [
          'Claude and GPT-5.6 have vision. So does Gemini and Grok. Vision is now standard in flagships. You usually pay a bit more per query when you include an image.',
          'For heavy image work (scanning thousands of documents), specialized vision models exist, but flagship LLMs cover most use cases.',
        ],
      },
    ],
  },
  {
    slug: 'embedding-models',
    question: 'What are embedding models?',
    metaTitle: 'What are embeddings? How AI finds meaning in text - Models.fyi',
    metaDescription:
      'What are embeddings and embedding models? How semantic search works, why they matter for RAG and similarity, and how to use them.',
    hook: 'The glue between meaning and numbers.',
    sections: [
      {
        heading: 'Converting meaning to numbers',
        paragraphs: [
          'An embedding model reads text and outputs numbers, thousands of them, in a pattern that captures meaning. "dog" and "puppy" are close in number-space. "dog" and "algebra" are far apart.',
          'These numbers let computers compare meaning without understanding words.',
        ],
      },
      {
        heading: 'Why they matter',
        paragraphs: [
          'Embeddings power semantic search: finding documents about "fast cars" when you search "quick vehicles." They power recommendations: "users who liked this also liked that."',
          'They\'re also how RAG systems work. You convert a document library to embeddings, search by meaning, then hand relevant excerpts to a language model to answer.',
        ],
      },
      {
        heading: 'When do you need one?',
        paragraphs: [
          'If you\'re building search or recommendations, yes. If you\'re just chatting with a model, no. Most RAG systems use a cheap standalone embedding model, not the language model itself.',
        ],
      },
    ],
  },
  {
    slug: 'fine-tuning-models',
    question: 'What is fine-tuning?',
    metaTitle: 'Fine-tuning AI models: when and why - Models.fyi',
    metaDescription:
      'What is fine-tuning? Why companies fine-tune language models, how it works, and when fine-tuning makes sense vs using prompts or RAG.',
    hook: 'Teaching an old model new tricks without retraining from scratch.',
    sections: [
      {
        heading: 'The idea',
        paragraphs: [
          'A model is pre-trained on billions of words. Fine-tuning means showing it hundreds or thousands of your own examples (your style, your data, your format) and letting it adjust its dials slightly to match.',
          'It\'s cheaper than training from scratch but more intensive than a one-off prompt.',
        ],
      },
      {
        heading: 'When to fine-tune',
        paragraphs: [
          'Your task is highly specialized (legal language, your brand\'s tone, a niche domain). You\'ll run the model thousands of times, so per-call savings add up. You want consistency across many generations.',
          'Start with prompting and RAG first. Fine-tuning is premature if a careful prompt or two examples get you there.',
        ],
      },
      {
        heading: 'The trade-off',
        paragraphs: [
          'Fine-tuning costs money upfront and takes time. But a fine-tuned model becomes cheaper to run than a flagship for high volume. It\'s a scaling play, not a starting play.',
        ],
      },
    ],
  },
  {
    slug: 'model-pricing-tokens',
    question: 'How does AI pricing work - input vs output tokens',
    metaTitle: 'AI model pricing explained: input vs output tokens - Models.fyi',
    metaDescription:
      'How AI model pricing works: why input and output tokens cost differently, how tokens are counted, and how to estimate your bills.',
    hook: 'Why that question you asked cost 3 cents instead of 1.',
    sections: [
      {
        heading: 'Tokens: the unit of price',
        paragraphs: [
          'A token is about 3/4 of a word. "Hamburger" = 3 tokens. "Hello" = 1 token. Pricing is per 1,000 tokens. So if you\'re charged $2 per 1K tokens, and you send 2,000 tokens, you pay $4.',
        ],
      },
      {
        heading: 'Input vs output: the split',
        paragraphs: [
          'Input is what you send: your prompt, your documents, your question. Output is what comes back: the model\'s answer. Most models charge differently for each.',
          'Input is cheaper because generating new text (output) is harder than reading (input). A 10-token prompt might cost 1 cent. A 100-token answer might cost 2 cents.',
        ],
      },
      {
        heading: 'How to estimate costs',
        paragraphs: [
          'Count tokens with the model\'s tokenizer tool. Multiply input tokens by the input rate, output tokens by the output rate, add them up. For a typical Q&A: ask 500 tokens, get back 200, at standard pricing, costs cents.',
          'Check our comparison table for current rates. Most flagships are $1-2 per 1M input tokens, $3-5 per 1M output tokens.',
        ],
      },
    ],
  },
  {
    slug: 'context-window-strategies',
    question: 'How to make the most of context windows',
    metaTitle: 'Context window strategies: when big isn\'t better - Models.fyi',
    metaDescription:
      'Strategies for using large context windows effectively: when bigger is worth the cost, how to structure documents, and when a smaller context is fine.',
    hook: 'Your desk is huge. Here\'s how to use it without wasting money.',
    sections: [
      {
        heading: 'Bigger isn\'t always better',
        paragraphs: [
          'A 200K-token window is huge: a whole book. But if you\'re asking a simple question, you pay for all that unused space. Models charge per token read, so a big context means a bigger bill.',
        ],
      },
      {
        heading: 'When big context helps',
        paragraphs: [
          'Analyzing a 50-page codebase: big context wins. Summarizing a book: big context wins. Analyzing multiple PDFs at once: big context wins. Asking "what is X?": small context is fine.',
        ],
      },
      {
        heading: 'Smart strategies',
        paragraphs: [
          'Cut irrelevant sections. Summarize before dumping. Use RAG (search documents, feed only relevant snippets). Put most important info first so the model sees it if it forgets the end.',
          'For huge documents, chunk them and process separately, then synthesize. Cheaper than one gigantic query.',
        ],
      },
    ],
  },
  {
    slug: 'prompt-engineering-basics',
    question: 'Prompt engineering basics: how to get better answers',
    metaTitle: 'Prompt engineering 101: tips to get better AI answers - Models.fyi',
    metaDescription:
      'Prompt engineering basics: how to write prompts that get better answers from AI models, with examples and common mistakes to avoid.',
    hook: 'Ask better, get better. No wizardry, just clarity.',
    sections: [
      {
        heading: 'Clear beats clever',
        paragraphs: [
          'Say what you want, not how to think. "Summarize this in three bullet points" beats "You are a concise summarizer, now summarize this." The model doesn\'t have an inner voice you need to talk to.',
        ],
      },
      {
        heading: 'Context and examples',
        paragraphs: [
          'Tell the model your role, the stakes, and the format. "I\'m a startup founder, help me pitch this to investors in 2 minutes" is better than "write a pitch."',
          'Give examples if you can. "Here\'s a good one: [example]. Now do this: [task]" gets more consistent results.',
        ],
      },
      {
        heading: 'Common mistakes',
        paragraphs: [
          'Being too short: "summarize this" without telling it how. Being too fancy: "engage your inner analyst." Changing your request mid-way: stick to one task per prompt.',
          'Expecting perfection: iterate. Ask follow-ups. Refine.',
        ],
      },
      {
        heading: 'Iterate, don\'t fight',
        paragraphs: [
          'If the first answer is close but not quite, ask for a revision instead of a completely new prompt. Models are good at tweaks.',
        ],
      },
    ],
  },
  {
    slug: 'web-search-models',
    question: 'When to use a model with web search',
    metaTitle: 'Web search in AI models: when you need real-time data - Models.fyi',
    metaDescription:
      'When to use models with web search: how real-time data works, why models can\'t be current without it, and which models have search built in.',
    hook: 'Your model knows yesterday\'s news. Yesterday.',
    sections: [
      {
        heading: 'The knowledge cutoff problem',
        paragraphs: [
          'All models are trained on data up to a specific date, the knowledge cutoff. Claude\'s was trained up to early 2024. A question about a 2026 announcement gets a shrug: "I don\'t know."',
          'A model with web search can look it up and give you today\'s answer.',
        ],
      },
      {
        heading: 'What uses web search',
        paragraphs: [
          'Anything current: news, stock prices, recent announcements, today\'s weather. Anything niche: obscure research papers, job listings, recent blog posts.',
          'You don\'t need search for general knowledge: history, math, how things work.',
        ],
      },
      {
        heading: 'The cost',
        paragraphs: [
          'Web search adds latency: the model has to query the internet, which takes time. It also adds cost: you pay for the search plus the extra tokens it uses to read results.',
          'Most models let you toggle search off for simple questions and keep your bill small.',
        ],
      },
      {
        heading: 'Which models have it',
        paragraphs: [
          'Claude via Claude.ai. ChatGPT with the web-search setting. Gemini with Google search built in. Some API tiers have search available; check the provider.',
        ],
      },
    ],
  },
  {
    slug: 'hallucinations',
    question: 'What are AI hallucinations and why they happen',
    metaTitle: 'AI hallucinations explained: why models make things up - Models.fyi',
    metaDescription:
      'What are AI hallucinations? Why language models confidently say false things, examples, and strategies to reduce them.',
    hook: 'Confident nonsense is the core bug of next-word prediction.',
    sections: [
      {
        heading: 'The fundamental problem',
        paragraphs: [
          'A language model predicts the next word based on patterns. "The capital of France is" -> model predicts "Paris." That happens to be true.',
          '"The capital of Somalia is" -> model predicts based on statistical patterns, not a fact database. If Somalia appears often near "Mogadishu" and "capital" in the training data, it goes with that. But if it predicts something false, it still sounds confident. That\'s a hallucination.',
        ],
      },
      {
        heading: 'Common hallucinations',
        paragraphs: [
          'Fake citations: "A study by X shows Y" (no such study). Fake quotes: "Einstein said Z" (he didn\'t). Confident wrong facts: "The Earth\'s capital city" (doesn\'t exist). Inventing code that doesn\'t work.',
        ],
      },
      {
        heading: 'How to reduce them',
        paragraphs: [
          'Ask for sources. Ask it to cite the training data it\'s using. Use web search for current facts. Feed it documents it can reference. Ask it to admit uncertainty.',
          'For critical work (medical, legal, financial), verify outputs independently. Models are not authoritative sources.',
        ],
      },
    ],
  },
  {
    slug: 'open-source-vs-closed-source',
    question: 'Open source vs closed-source AI models',
    metaTitle: 'Open source vs closed source models: the trade-offs - Models.fyi',
    metaDescription:
      'Open source vs closed source AI models: how they differ, when to pick each, and why some companies open-source and others don\'t.',
    hook: 'Free and transparent vs refined and safe: pick your own trade-off.',
    sections: [
      {
        heading: 'The divide',
        paragraphs: [
          'Closed-source models (ChatGPT, Claude, Gemini) are built and run by the company. You pay for API access or a subscription. You don\'t see the weights or training data.',
          'Open-source models (Llama, Mistral, DeepSeek) publish the weights. You can download, run locally, modify, and fine-tune. You own and operate it.',
        ],
      },
      {
        heading: 'Open source wins on:',
        paragraphs: [
          'Freedom: modify how you want. Privacy: run on your hardware, no data leaves your server. Cost: once downloaded, free to run. Transparency: see how it works.',
        ],
      },
      {
        heading: 'Closed source wins on:',
        paragraphs: [
          'Capability: the best models (for now) are closed. Safety: dedicated teams catch edge cases. Latency: you don\'t operate servers. Updates: the company improves the model, you get the latest.',
        ],
      },
      {
        heading: 'The practical question',
        paragraphs: [
          'For consumer use: closed-source is simpler. For enterprises with privacy needs: open-source wins. For maximum capability: closed. For maximum control: open.',
          'The gap is closing. Some open models rival closed flagships now. Check benchmarks, not ideology.',
        ],
      },
    ],
  },
]
