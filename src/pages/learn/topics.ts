/**
 * Education content: Karpathy-style plain-language explainers.
 * Each topic is its own route for SEO. The slugs and meta titles target
 * the search phrases from the product requirements.
 */
import type { ComponentType } from 'react'
import { WeightsExplainer } from './components/WeightsExplainer'
import { PixelClassifier } from '../../components/learn/PixelClassifier'
import { DigitClassifier } from '../../components/learn/DigitClassifier'
import { DeepDigitClassifier } from '../../components/learn/DeepDigitClassifier'
import { MultiLayerNetwork } from '../../components/learn/MultiLayerNetwork'
import { NextWordPredictor } from '../../components/learn/NextWordPredictor'
import { GradientDescentDemo } from '../../components/learn/GradientDescentDemo'

import { TokenVisualization } from '../../components/learn/TokenVisualization'

export interface TopicSection {
  heading: string
  paragraphs: string[]
  component?: React.ComponentType
}

export type TopicLevel = 'basics' | 'intermediate' | 'advanced' | 'lab'

/** The learning path, in reading order. The topics array follows this order. */
export const levels: Array<{ id: TopicLevel; title: string; blurb: string }> = [
  {
    id: 'basics',
    title: 'Basics',
    blurb: 'Start here. What models are, how they read text, and which one to pick. No jargon, no math.',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    blurb: 'Put models to work: reasoning and vision, pricing, hallucinations, prompts, and head-to-head comparisons.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    blurb: 'The deeper machinery: embeddings, fine-tuning, and squeezing value out of giant context windows.',
  },
  {
    id: 'lab',
    title: 'The model lab',
    blurb: 'Real models small enough to see through, running in your browser. Meet Doodle-64, Doodle-525, Doodle-918, and Parrot-43, then scale the same ideas up to billion-parameter LLMs.',
  },
]

/**
 * Spec sheet for the lab's tiny models, presented like a real release's
 * model card so the "parameters / inputs / outputs" vocabulary carries
 * over to the big models on the compare table.
 */
export interface ModelSpec {
  name: string
  type: string
  parameters: string
  layers: string
  inputs: string
  outputs: string
  /** One line placing this model against frontier LLMs. */
  scale: string
}

export interface Topic {
  slug: string
  /** Where the topic sits on the learning path. */
  level: TopicLevel
  /** Question shown in nav/cards and as the H1. */
  question: string
  metaTitle: string
  metaDescription: string
  /** One-line hook shown on the index cards. */
  hook: string
  sections: TopicSection[]
  /** Optional interactive component to render alongside sections. */
  interactive?: ComponentType
  /** Optional spec card for lab topics that ship a named tiny model. */
  modelSpec?: ModelSpec
}

const authored: Topic[] = [
  {
    slug: 'what-is-an-ai-model',
    level: 'basics',
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
    level: 'basics',
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
    level: 'basics',
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
    level: 'basics',
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
    level: 'basics',
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
          '"The" is one token. "Hamburger" is two: "Hamb" + "urger". Even the space before a word is part of its token. Mathematical symbols, punctuation, and newlines also get tokenized. The pattern depends on the model\'s tokenizer, which is tuned during training.',
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
    level: 'intermediate',
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
    level: 'basics',
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
    level: 'intermediate',
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
          'Both offer cheap fast tiers and expensive flagship tiers. GPT is available through ChatGPT (web, app, API). Claude is on Claude.ai, API, and select partners. Neither wins on cost. It depends on your workload.',
        ],
      },
    ],
  },
  {
    slug: 'claude-vs-gemini',
    level: 'intermediate',
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
    level: 'intermediate',
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
    level: 'intermediate',
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
    level: 'intermediate',
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
    level: 'intermediate',
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
          'For research, use a flagship with reasoning (Opus, GPT-5.6 Sol). The cost is worth the accuracy. Always verify claims in the original sources. No model is a substitute for that.',
        ],
      },
    ],
  },
  // Concept topics
  {
    slug: 'vision-models',
    level: 'intermediate',
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
    level: 'advanced',
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
    level: 'advanced',
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
    level: 'intermediate',
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
    level: 'advanced',
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
    level: 'intermediate',
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
    level: 'intermediate',
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
    level: 'intermediate',
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
    level: 'intermediate',
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
  {
    slug: 'how-do-neural-network-weights-work',
    level: 'lab',
    question: 'How do neural network weights work?',
    metaTitle: 'How neural network weights work - Interactive explainer - Models.fyi',
    metaDescription:
      'Understand neural network weights with an interactive explainer. See how inputs multiply by weights and sum to create outputs. No math jargon needed.',
    hook: 'The tiny dials that make neural networks learn anything.',
    interactive: WeightsExplainer,
    sections: [
      {
        heading: 'What are weights?',
        paragraphs: [
          'Weights are numbers inside a neural network, like tiny dials on a massive control panel. During training, the network adjusts millions of these dials until it gets good at its job.',
          'Think of them like the volume knob on a speaker. Turn it up, the sound gets louder. In a network, "turn up" a weight and that input has more effect on the output.',
        ],
      },
      {
        heading: 'How they work: the multiplication',
        paragraphs: [
          'Each input gets multiplied by its weight. A weight of 0 means "this input doesn\'t matter." A weight of 2 means "pay double attention to this input." So if an input is 0.5 and its weight is 2, the product is 1.0.',
          'Then all those products get added together. That sum is the output of the layer. In math: output = (input₁ × weight₁) + (input₂ × weight₂) + ... This operation repeats billions of times across a model.',
        ],
      },
      {
        heading: 'Why they matter',
        paragraphs: [
          'A model\'s knowledge lives in its weights. They encode everything the network learned during training: what a dog looks like in pixels, what makes good code, the patterns in human speech. Change the weights, the model\'s behavior changes.',
          'When you "fine-tune" a model, you\'re tweaking its weights. When someone sells a model, they\'re selling the weights (and the architecture that uses them).',
        ],
      },
      {
        heading: 'The training process',
        paragraphs: [
          'Training a model is a loop: (1) Make a guess with the current weights, (2) See how wrong it is, (3) Adjust the weights to be less wrong, (4) Repeat with the next batch of data.',
          'This happens millions of times. Each tiny adjustment nudges the weights towards better predictions. After weeks or months, the weights are "just right" for the task, and you have a trained model.',
        ],
      },
      {
        heading: 'A concrete example',
        paragraphs: [
          'Imagine training a model to predict house prices. Inputs might be: square footage, number of bedrooms, location. Weights learn how much each factor matters. Maybe the model learns: "100 extra square feet is worth $15,000, but being one neighborhood over costs $50,000."',
          'Those relative values are encoded in the weights. They\'re the model\'s learned understanding of the housing market, baked into numbers.',
        ],
      },
      {
        heading: 'Advanced: stacking layers',
        paragraphs: [
          'One neuron doing multiply-and-add is neat, but the magic starts when you stack them. The outputs of one layer become the inputs of the next, so the second layer works with patterns the first layer found, and the third layer works with patterns of patterns.',
          'Watch the animation below: values enter on the left, and each layer computes its neurons from the layer before it. This exact flow happens every time you send a message to an AI model. The only difference is scale: thousands of layers, millions of neurons.',
        ],
        component: MultiLayerNetwork,
      },
    ],
  },
  {
    slug: 'understand-image-classification',
    level: 'lab',
    question: 'How do neural networks classify images?',
    metaTitle: 'Image classification with neural networks - Interactive demo - Models.fyi',
    metaDescription:
      'See how neural networks classify images with an interactive 8x8 pixel demo. Draw a 3 or E and watch the classifier predict.',
    hook: 'Meet Doodle-64, a 64-parameter classifier that tells 3 from E — and works exactly like the big models.',
    interactive: PixelClassifier,
    modelSpec: {
      name: 'Doodle-64',
      type: 'Single-layer binary image classifier (a perceptron, the original neural network)',
      parameters: '64 — one learned weight per pixel',
      layers: '1 (64 pixels → 1 score)',
      inputs: '64 numbers: the 8×8 grid, 1 where you drew ink and 0 where you didn\'t',
      outputs: '2 probabilities that sum to 100%: "this is a 3" vs "this is an E"',
      scale: 'Frontier LLMs have hundreds of billions of parameters. Doodle-64 has 64 — about ten billion times smaller — but every one of them is the same kind of number doing the same multiply-and-add.',
    },
    sections: [
      {
        heading: 'Meet Doodle-64',
        paragraphs: [
          'The demo on this page is a real model, so we gave it a real model card, just like the ones providers publish for GPT or Claude. Doodle-64 is a single-layer binary image classifier with exactly 64 parameters: one weight per pixel of its 8×8 input grid. Its input is 64 numbers (1 for ink, 0 for blank), and its output is two probabilities that always sum to 100%.',
          'Sixty-four parameters sounds like a toy next to a frontier model\'s hundreds of billions, and it is. But "parameter" means exactly the same thing in both: one learned number that multiplies one input. When a model page on this site says "70B parameters", it means 70 billion of the same little dials you can see, all at once, in the heatmap below.',
        ],
      },
      {
        heading: 'From pixels to predictions',
        paragraphs: [
          'Image classification sounds mystical, but it\'s the same math as everything else in neural networks: inputs, weights, multiplication, and addition.',
          'A pixel grid, like the 8x8 grid below, gets flattened into 64 numbers (0 for black, 1 for white). Each number is an input. Each input gets multiplied by its learned weight. The products all add up to a score for "this is a 3" and another score for "this is an E." Whichever score is higher wins.',
        ],
      },
      {
        heading: 'What the network learns',
        paragraphs: [
          'During training, the network adjusts its weights to recognize meaningful patterns. It doesn\'t learn "a 3 has a line on the right." A programmer didn\'t tell it that. Instead, through thousands of examples, the weights naturally become sensitive to the features that matter: curves, edges, connected regions.',
          'The demo below shows all 64 of its weights as an 8x8 grid of colors: green pixels are evidence for "3", red pixels are evidence for "E", and transparent pixels are ignored. You can also watch your drawing flow through the network, from 64 inputs to 2 outputs, and see the confidence it produces. A real image classifier with millions of weights learns far richer patterns, but the mechanics are the same.',
        ],
      },
      {
        heading: 'Why this matters for real models',
        paragraphs: [
          'Vision models like Claude\'s or GPT-4\'s vision capability work on the same principle, scaled up. They process photos, screenshots, charts. The network has learned to recognize objects, text, and patterns, all through millions of learned weights.',
          'Every model\'s understanding of images lives in those weights. That\'s why changing weights changes what the model sees, and why different models see images differently.',
          'And it isn\'t just vision. An LLM answering "what comes next in this sentence?" is doing the same thing Doodle-64 does: multiply inputs by learned weights, add them up, and turn the scores into probabilities. Doodle-64 chooses between 2 answers with 64 parameters; an LLM chooses between ~200,000 possible next tokens with billions. The gap is size, not kind.',
        ],
      },
      {
        heading: 'Try it yourself',
        paragraphs: [
          'Below, draw on the pixel grid or use the example buttons. You\'re seeing how a tiny network makes a prediction. The confidence score tells you how sure the classifier is. When you draw something ambiguous, halfway between 3 and E, watch the confidence drop, just like a real model.',
        ],
      },
    ],
  },
  {
    slug: 'how-neural-networks-recognize-digits',
    level: 'lab',
    question: 'How do neural networks recognize digits?',
    metaTitle: 'How neural networks recognize digits 0-9 - Interactive two-layer demo - Models.fyi',
    metaDescription:
      'Draw any digit 0-9 and watch a two-layer neural network recognize it. The hidden layer spots strokes, the output layer combines them into digits. Interactive demo.',
    hook: 'Meet Doodle-525: draw any digit and watch its hidden layer find the strokes before it names the number.',
    interactive: DigitClassifier,
    modelSpec: {
      name: 'Doodle-525',
      type: 'Two-layer feed-forward neural network (a tiny multi-layer perceptron)',
      parameters: '525 — 448 pixel-to-stroke weights + 7 stroke biases + 70 stroke-to-digit weights',
      layers: '2 (64 pixels → 7 stroke detectors → 10 digits)',
      inputs: '64 numbers: the 8×8 grid, 1 where you drew ink and 0 where you didn\'t',
      outputs: '10 probabilities, one per digit 0–9, summing to 100%',
      scale: 'Same inputs as Doodle-64, eight times the parameters, and one hidden layer — the single upgrade that "deep" learning repeats hundreds of times in a billion-parameter LLM.',
    },
    sections: [
      {
        heading: 'Meet Doodle-525',
        paragraphs: [
          'Doodle-525 is the second model in our lab, and its model card shows what one extra layer costs and buys. It reads the same 64-pixel grid as Doodle-64, but instead of mapping pixels straight to an answer, it spends 448 weights (plus 7 biases) turning pixels into 7 stroke detections, then 70 more weights turning strokes into 10 digit scores. Total: 525 parameters for a 10-way choice, where Doodle-64 needed 64 for a 2-way choice.',
          'That budget is the whole story of neural network design: more possible answers and subtler distinctions demand more parameters, and layering lets the parameters share work. The 7 stroke detectors are reused by all 10 digits, the way an LLM\'s early layers are reused by every sentence it will ever read.',
        ],
      },
      {
        heading: 'Why one layer stops being enough',
        paragraphs: [
          'The 3-vs-E classifier got away with a single layer because one pixel could settle the argument: ink on the left edge means E, ink on the right curve means 3. With ten digits that trick collapses. An 8 contains every pixel of a 3, a 9 contains every pixel of a 7, so no single pixel is evidence for exactly one digit.',
          'The fix is the most important idea in deep learning: don\'t go straight from pixels to answers. First recognize parts, then reason about combinations of parts. That "first" step is a hidden layer.',
        ],
      },
      {
        heading: 'Layer 1 finds strokes, not digits',
        paragraphs: [
          'The demo below has seven hidden neurons, and each one is a stroke detector: a top bar, a middle bar, a bottom bar, and four vertical lines. Each detector\'s weights cover just the pixels of its stroke. You can see them as seven mini heatmaps, each in its own color. When you draw most of a stroke, its detector fires.',
          'Notice what these neurons don\'t know: anything about digits. The top-bar detector fires for a 5, a 7, and an 8 alike. It has one tiny job, done with a handful of weights.',
        ],
      },
      {
        heading: 'Layer 2 combines strokes into digits',
        paragraphs: [
          'The second layer is where digits exist. Each of the ten outputs holds a recipe: +1 for every stroke the digit uses, -1 for every stroke it doesn\'t. A firing detector pushes up the digits that want its stroke and pushes down the ones that don\'t. A silent detector votes in reverse, because a missing bottom bar really is evidence for a 4 and against an 8.',
          'Softmax then turns the ten scores into probabilities that sum to 100%. Draw an 8 and leave out the middle bar: the network\'s vote swings to 0, exactly the digit whose recipe matches what you actually drew.',
        ],
      },
      {
        heading: 'This is exactly what deep networks do',
        paragraphs: [
          'Real image models are this demo scaled up. Their early layers learn edge and color detectors, middle layers combine edges into textures and shapes, and late layers combine shapes into "cat ear" or "handwritten 7". Nobody programs those features. Training finds them, the way our stroke detectors were chosen by hand here.',
          '"Deep" in deep learning just means many hidden layers stacked, each reasoning about the patterns the previous one found. Two layers read seven strokes; a hundred layers can read a photograph.',
          'If you want to see the next rung of that ladder, Doodle-918 does this same job with a second hidden layer that turns strokes into shapes — loops, curves and spines — before naming a digit. It is the same demo, one layer deeper, and it reads every digit at over 99% confidence.',
        ],
      },
      {
        heading: 'Try it yourself',
        paragraphs: [
          'Use the example buttons to load a clean digit, then vandalize it. Erase one stroke, add another, and watch the stroke detectors switch on and off and the probabilities slide between the digits that share those strokes. Then press play on the network animation to watch the whole forward pass: pixels light detectors, detectors vote on digits.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-gradient-descent',
    level: 'lab',
    question: 'What is gradient descent?',
    metaTitle: 'What is gradient descent? Watch 64 weights train - Models.fyi',
    metaDescription:
      'Train a real 64-weight classifier in your browser, test its predictions, and explore gradient descent on accessible 2D and 3D loss views.',
    hook: 'Choose the starting noise, train Doodle-64 in your browser, then test the weights it learned.',
    interactive: GradientDescentDemo,
    sections: [
      {
        heading: 'Nobody chooses the weights',
        paragraphs: [
          'Every model in this lab so far arrived with its weights already set. Doodle-64 got its 64 numbers from a rule we wrote by hand: positive where a 3 has ink, negative where an E does. That was honest teaching but dishonest engineering, because no real model is built that way. Nobody at OpenAI sat down and picked a value for weight number 4,000,000,001.',
          'Real weights are found, not chosen, and gradient descent is the basic procedure behind the models on this site. Doodle-64 makes that training loop small enough to inspect.',
        ],
      },
      {
        heading: 'Start with a shrug',
        paragraphs: [
          'This training run starts by filling every weight with a small random number. The model has no information yet, so the values stay close to zero and its first predictions stay cautious. It begins with an honest "I have no idea" instead of a confident guess.',
          'Doodle-64 could also learn from zero weights. Its pixels appear in different training examples, so they receive different updates even when they start equal. We use a random start because real training runs often begin that way, and because changing the seed lets you compare several downhill paths. A seed also makes any one path exactly reproducible.',
        ],
      },
      {
        heading: 'One number for "how wrong are we?"',
        paragraphs: [
          'Before you can improve, you need a score. That score is the loss. Show the model a training drawing, let it produce a probability that the drawing is a 3, and compare that against the truth. A confident right answer scores near zero. A confident wrong answer scores enormously. Average that over every training example and you have one number summarizing the model\'s badness.',
          'Now the whole of training has a shape: change the weights so the loss goes down. Nothing else. Every trick in modern machine learning is a variation on that one sentence.',
        ],
      },
      {
        heading: 'The slope tells you which way is downhill',
        paragraphs: [
          'Picture the loss as a landscape. Each of the 64 weights is a direction you can walk, and your altitude is how wrong you are. You want the valley. The catch is that you cannot see the landscape — you only feel the ground under your feet.',
          'That is enough. Calculus hands you the slope in each direction: if I nudge this one weight up, does the loss rise or fall, and how steeply? The collection of all 64 slopes is called the gradient. Take a small step against it — downhill in every direction at once — and your loss is a little lower than before. Do it again. That is gradient descent, all of it.',
          'For our classifier the slope works out to something almost suspiciously simple: for each training image, take the model\'s prediction, subtract the true answer, and multiply by the pixel. Predicted 0.9 when the answer was 1? Barely wrong, tiny nudge. Predicted 0.9 when the answer was 0? Very wrong, big nudge, and every pixel that was lit takes the blame.',
        ],
      },
      {
        heading: 'The learning rate is the size of your stride',
        paragraphs: [
          'The gradient says which way to go. It does not say how far. That is the learning rate, and it is the one dial that most reliably ruins a training run.',
          'Set it too small and training crawls: correct direction, thousands of tiny steps, a bill to match. Set it too large and you leap clean over the valley and land higher up the far slope, then overcorrect back, bouncing wider and wider until the loss goes to infinity. Practitioners call that diverging, and it is spectacular to watch once and miserable to debug twice. The demo uses a middling rate, so the descent is quick but stays smooth.',
        ],
      },
      {
        heading: 'Watch 64 weights find their values',
        paragraphs: [
          'The animation above records a real training run. Sixty-four weights begin as random scatter, while a bias starts at zero. The lines move quickly when the model is wrong, then flatten as its corrections shrink.',
          'Generate a seed, train, and scrub through the result. The 8x8 heatmap resolves into useful evidence for the familiar examples in its training set. Then draw in the test panel and see those learned numbers make a prediction.',
        ],
      },
      {
        heading: 'Valleys that are not the valley',
        paragraphs: [
          'Doodle-64 has 65 adjustable numbers: 64 pixel weights and one bias. Its logistic loss is convex, so it does not contain the local valleys shown in the 2D and 3D teaching views above. Those polynomial views make slopes, basins, and starting points visible.',
          'Deep networks have non-convex loss surfaces in millions or billions of dimensions. No screen can show all of them at once, but a two-dimensional surface can still show what it means to follow a local slope.',
          'A local minimum is a dip that is lower than everything immediately around it but not the lowest place on the map. Gradient descent only feels the ground beneath it, so at the bottom of a local dip the slope is flat and training stops improving — with weights that work, but not as well as they could have. A plateau is worse company: a wide flat stretch where the gradient is nearly zero and training seems to have stalled, sometimes for a very long time, even though better ground lies just ahead. Saddle points are flat in one direction and downhill in another, and in high dimensions they outnumber true local minima by a lot.',
          'The escapes are mostly nudges. Noise helps: real training computes the gradient on a small random batch of examples at a time, so the path jitters and can rattle out of shallow dips. Momentum helps: keep some velocity from the last step so you roll across flat ground instead of stopping on it. And multiple random restarts help, which is the deepest reason those starting weights are random — different starting points explore different parts of the landscape.',
        ],
      },
      {
        heading: 'This is how every model on this site was made',
        paragraphs: [
          'Scale is the only difference between the animation above and the training of a frontier model. Swap 64 weights for hundreds of billions. Swap ten pixel drawings for a large fraction of the public internet. Swap "is this a 3?" for "what token comes next?". Swap 120 epochs on your laptop for months on tens of thousands of GPUs.',
          'The loop does not change: guess, measure how wrong you are, follow the slope downhill, repeat. When a lab says a model cost hundreds of millions of dollars to train, this is the thing that cost the money — an unfathomable number of very small steps down a hill nobody can see.',
        ],
      },
    ],
  },
  {
    slug: 'how-llms-predict-the-next-word',
    level: 'lab',
    question: 'How do LLMs predict the next word?',
    metaTitle: 'How LLMs predict the next word - Interactive demo - Models.fyi',
    metaDescription:
      'Build a sentence one word at a time with a tiny language model trained on nine sentences. See exactly how next-word prediction comes from training data, then scale the idea to ChatGPT and Claude.',
    hook: 'Meet Parrot-43, a language model trained on nine sentences. Watch it predict the next word — and see exactly where every prediction comes from.',
    interactive: NextWordPredictor,
    modelSpec: {
      name: 'Parrot-43',
      type: 'Bigram language model — the smallest honest next-word predictor',
      parameters: '43 — one count for every word pair it saw during training',
      layers: '0 — it\'s a lookup table, not a network (that\'s the punchline, keep reading)',
      inputs: '1 word: the last word of the sentence so far',
      outputs: 'A probability for every word that could come next, summing to 100%',
      scale: 'ChatGPT and Claude do this exact job — predict the next token, append it, repeat — with billions of parameters and thousands of words of context instead of one.',
    },
    sections: [
      {
        heading: 'The smallest language model that could',
        paragraphs: [
          'Doodle-64 and Doodle-525 recognize things. Parrot-43 generates things, which makes it the closest cousin of ChatGPT and Claude in our lab. Its entire education is the nine sentences shown above, and its entire brain is 43 counts: how many times each word followed each other word in those sentences.',
          'That\'s all "training" means here. Read the data, count the pairs. "the cat" appears three times, so after "the", the word "cat" gets 3 votes. Divide the votes by the total and you have probabilities. When you click a word in the demo, the highlighted corpus shows you exactly which sentences cast those votes. Nothing is hidden, because there is nothing else.',
        ],
      },
      {
        heading: 'Generation is prediction in a loop',
        paragraphs: [
          'To write a sentence, Parrot-43 does what every LLM does: predict the next word, append it, and predict again from the new ending. Click through a few choices and you can splice its training sentences into one it was never taught, like "my cat sat on the fence". That is generation: new sentences out of old counts.',
          'Now press "Always pick the favorite" and watch it get stuck chanting "the cat ate my cat ate my…". Always taking the single most likely word is a real failure mode in big models too. It\'s part of why LLMs add a dash of randomness, called temperature, when they pick from their probabilities.',
          'You\'ll also notice what it can never do: say a word it hasn\'t seen. Its 22-word vocabulary is the entire universe as far as it\'s concerned. And when you steer it onto a rare word like "flew", it has exactly one recorded continuation and marches straight down it. Tiny training data makes a tiny parrot.',
        ],
      },
      {
        heading: 'What LLMs do differently',
        paragraphs: [
          'Three upgrades separate Parrot-43 from GPT or Claude. First, context: Parrot-43 looks at one previous word; an LLM weighs thousands of previous tokens at once (that\'s what the transformer\'s attention is for). Second, generalization: an LLM doesn\'t store counts in a table. It compresses the patterns of its training data into billions of weights, the same multiply-and-add weights as Doodle-64, so it can handle sentences it has never seen. Third, scale: instead of nine sentences, most of the internet; instead of a 22-word vocabulary, ~200,000 tokens.',
          'But the job description never changes. Every reply from a frontier model is next-token prediction repeated thousands of times: score every possible continuation, turn scores into probabilities, pick one, append, repeat. If you understand why Parrot-43 says "cat" after "the", you understand what a trillion-dollar industry is scaling up.',
        ],
      },
      {
        heading: 'Where the hallucinations come from',
        paragraphs: [
          'Parrot-43 also demonstrates the famous LLM failure mode in miniature. Ask it to continue "my" and it says "cat" or "homework". Neither is true. They\'re just the likeliest continuations of its training data. Likely and true are different things. An LLM with billions of parameters blurs that line much more convincingly, but the gap never fully closes. That\'s a hallucination, and now you\'ve watched one get built.',
        ],
      },
    ],
  },
  {
    slug: 'why-neural-networks-need-more-layers',
    level: 'lab',
    question: 'Why do neural networks need more than one hidden layer?',
    metaTitle: 'Why neural networks need more layers - Interactive three-layer digit demo - Models.fyi',
    metaDescription:
      'Draw a digit and watch a three-layer neural network turn pixels into strokes, strokes into shapes, and shapes into an answer. See exactly what the extra layer buys you.',
    hook: 'Meet Doodle-918: it doesn\'t just count strokes, it sees loops and curves. Draw a digit and watch parts become shapes become an answer.',
    interactive: DeepDigitClassifier,
    modelSpec: {
      name: 'Doodle-918',
      type: 'Three-layer feed-forward neural network with a skip connection',
      parameters: '918 — 640 pixel-to-primitive weights + 10 primitive biases + 80 primitive-to-shape weights + 8 shape biases + 80 shape-to-digit weights + 100 skip weights',
      layers: '3 (64 pixels → 10 stroke primitives → 8 shape detectors → 10 digits)',
      inputs: '64 numbers: the 8×8 grid, 1 where you drew ink and 0 where you didn\'t',
      outputs: '10 probabilities, one per digit 0–9, summing to 100%',
      scale: 'Doodle-525\'s job with one more layer in the middle. It reads every canonical digit at over 99% confidence where the two-layer model manages 94%, and it stays right when a stroke is smudged — the payoff for features that compose.',
    },
    sections: [
      {
        heading: 'Meet Doodle-918',
        paragraphs: [
          'Doodle-918 reads the same 8×8 grid as Doodle-525 and answers the same question. The difference is entirely in the middle. Where Doodle-525 goes pixels → strokes → digits, this one goes pixels → stroke primitives → shapes → digits, and that one extra stop is worth 393 parameters and a jump from 94% confidence on its worst digit to over 99%.',
          'This is the third and last model in our vision lab, and the three of them together are the whole story of depth in about a thousand parameters. Doodle-64 maps pixels straight to an answer. Doodle-525 puts one layer of parts in between. Doodle-918 puts two, and the second one is where the model stops counting and starts seeing.',
        ],
      },
      {
        heading: 'What the two-layer model can\'t say',
        paragraphs: [
          'Doodle-525 works, and its stroke detectors are genuinely useful features. But look at what its output layer actually does: it tallies which of seven strokes are lit. To that model, a 0 is "six particular strokes present, one absent". It has no way to represent the fact that those six strokes form a closed loop, because "closed loop" is not a stroke.',
          'That matters the moment a drawing gets messy. A checklist degrades one item at a time — smudge a stroke and the tally drifts toward whatever digit has the next-most-similar checklist. A model that knows the loop is still closed does not care that the line making it is thin.',
        ],
      },
      {
        heading: 'Layer 1: smaller parts than before',
        paragraphs: [
          'The first change is counterintuitive: Doodle-918\'s first layer finds smaller features than Doodle-525\'s, not bigger ones. Each horizontal bar is cut into a left half and a right half, giving 10 primitives instead of 7.',
          'The reason is composition. You cannot build a loop out of pieces that are already loop-sized. If a "top bar" is atomic, the network can never notice that the left end of it joins the upper-left line while the right end joins the upper-right one. Finer parts give the next layer something to combine. Real convolutional networks make the same trade: their first layer finds tiny oriented edges, the least interesting features in the whole model, precisely because everything else is assembled from them.',
        ],
      },
      {
        heading: 'Layer 2: where shapes live',
        paragraphs: [
          'The second layer is the new one, and it holds eight shape detectors: a top loop, a bottom loop, a waist, two open curves, a straight right spine, a flat base and a flat cap. Each is an AND over primitives — it wants all of a specific set, and some of them also refuse to fire if a particular primitive is present.',
          'That veto is what separates a circle from a corner. "Top loop" and "open curve, left gap" want the same cap and the same right-hand side; the only difference is that the loop requires the upper-left line and the curve requires its absence. One weight, negative instead of positive, and the model can tell a closed shape from an open one. This is exactly the pattern the issue behind this page asked for: circular tops in 8, 9 and 0, circular bottoms in 8, 6 and 0, open curves in 2, 5 and 3, straight lines in 1, 4 and 7.',
          'And these shapes are shared. A top loop is reused by three digits, a flat base by seven. Reuse is the whole economic argument for a hidden layer: eight shapes are cheaper than ten separate digit templates, and they generalize better, because a smudged loop is still a loop.',
        ],
      },
      {
        heading: 'Layer 3: a very short argument',
        paragraphs: [
          'By the time the signal reaches the output layer, the hard work is done. Every digit has its own distinct fingerprint across those eight shapes, so the last layer is just a vote: +1 for each shape the digit shows, −1 for each it doesn\'t. Eighty weights to name ten digits.',
          'Those weights aren\'t typed in by hand, either. The model runs its own first two layers over the reference drawing of each digit and reads off which shapes light up. That is the closest a hand-built model gets to training: show it the examples, and let the answer fall out.',
          'One honest wrinkle: a 0 is an 8 without the waist, and a 2 is a 3 leaning the other way, so a few pairs sit a single shape apart. Layer 3 therefore keeps a quiet direct line back to layer 1, consulting the raw primitives at about a third of the volume it gives the shapes. Real vision models do the same thing, and call it a skip connection. When an abstraction throws away something a later layer still needs, you let that layer look back.',
        ],
      },
      {
        heading: 'What depth actually buys',
        paragraphs: [
          'Load an 8 and rub out its lower-left line. Watch the bottom loop switch off, and the model read a 9 — because that is what a 9 is, an 8 with the bottom loop opened up. Rub out the middle bar instead and the waist goes quiet, so it reads a 0. Doodle-525 reaches the same answers, but by tallying strokes. Doodle-918 gets there by noticing a loop is gone, which is why it stays confident when the drawing is imperfect and the two-layer model wavers.',
          'That difference is the entire reason deep learning is deep. Every layer you add lets the model describe its input in a vocabulary the previous layer couldn\'t reach: pixels, then edges, then shapes, then objects. A modern image model stacks dozens of these, and nobody writes the middle vocabularies down — training discovers them, the same way ours were chosen by hand here so you could read them.',
          'If you haven\'t yet, run the two-layer model on the same digits and compare. The interesting comparison isn\'t which one is right; both are. It\'s how sure each of them is, and what it takes to confuse them.',
        ],
      },
      {
        heading: 'Try it yourself',
        paragraphs: [
          'Draw a digit, or load one with the example buttons, then start vandalizing it. Erase half a stroke and watch a primitive dim without any shape switching off. Erase the whole stroke and watch a shape collapse, taking a digit\'s score down with it. Add a stroke that a shape forbids and watch that shape veto itself even though everything it needs is drawn.',
          'Then press play on the network animation and watch all three hops in order: pixels wake the primitives they belong to, primitives assemble into shapes, shapes vote on digits. Four columns, three layers, 918 numbers, and no magic anywhere in it.',
        ],
      },
    ],
  },
]

const levelRank: Record<TopicLevel, number> = { basics: 0, intermediate: 1, advanced: 2, lab: 3 }

/**
 * Topics in learning-path order: basics → intermediate → advanced → lab.
 * The sort is stable, so authoring order decides the sequence within a level,
 * and the "Next up" links walk the whole path in this order.
 */
export const topics: Topic[] = [...authored].sort((a, b) => levelRank[a.level] - levelRank[b.level])
