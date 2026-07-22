/**
 * Education content: Karpathy-style plain-language explainers.
 * Each topic is its own route for SEO. The slugs and meta titles target
 * the search phrases from the product requirements.
 *
 * Section *body* copy lives in topicProse.ts, keyed by `<slug>::<heading>`.
 * This module is reachable from src/lib/routeMeta.ts, which every page imports,
 * so anything held here ships in the chunk all 58 routes preload — while the
 * paragraphs are rendered by one route. Keep headings (routeMeta's JSON-LD
 * `teaches` list needs them) here and paragraphs there.
 */
import type { ComponentType } from 'react'
import { WeightsExplainer } from './components/WeightsExplainer'
import { PixelClassifier } from '../../components/learn/PixelClassifier'
import { DigitClassifier } from '../../components/learn/DigitClassifier'
import { DeepDigitClassifier } from '../../components/learn/DeepDigitClassifier'
import { MultiLayerNetwork } from '../../components/learn/MultiLayerNetwork'
import { NextWordPredictor } from '../../components/learn/NextWordPredictor'
import { GradientDescentDemo } from '../../components/learn/GradientDescentDemo'
import { TrainingLab } from '../../components/learn/TrainingLab'

import { TokenVisualization } from '../../components/learn/TokenVisualization'

export interface TopicSection {
  heading: string
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
      },
      {
        heading: 'What a model is, under the hood',
      },
      {
        heading: 'Why there are so many of them',
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
      },
      {
        heading: 'One word at a time',
      },
      {
        heading: 'The models on this site',
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
      },
      {
        heading: 'GPT vs ChatGPT',
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
      },
      {
        heading: 'Tokens: word pieces',
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
      },
      {
        heading: 'Why tokens exist',
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
      },
      {
        heading: 'When it matters, and when it doesn\'t',
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
      },
      {
        heading: 'The real answer',
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
      },
      {
        heading: 'Personality and style',
      },
      {
        heading: 'What they\'re good at',
      },
      {
        heading: 'Price and availability',
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
      },
      {
        heading: 'Capabilities',
      },
      {
        heading: 'Pick Claude if you want:',
      },
      {
        heading: 'Pick Gemini if you want:',
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
      },
      {
        heading: 'What Grok does well',
      },
      {
        heading: 'Where GPT still leads',
      },
      {
        heading: 'Try Grok if:',
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
      },
      {
        heading: 'Claude for coding',
      },
      {
        heading: 'GPT for coding',
      },
      {
        heading: 'The tier question',
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
      },
      {
        heading: 'Claude for writing',
      },
      {
        heading: 'GPT for writing',
      },
      {
        heading: 'For both: use mid-tier first',
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
      },
      {
        heading: 'Claude for research',
      },
      {
        heading: 'GPT for research',
      },
      {
        heading: 'Pro tip',
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
      },
      {
        heading: 'What they can do',
      },
      {
        heading: 'The models that see',
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
      },
      {
        heading: 'Why they matter',
      },
      {
        heading: 'When do you need one?',
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
      },
      {
        heading: 'When to fine-tune',
      },
      {
        heading: 'The trade-off',
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
      },
      {
        heading: 'Input vs output: the split',
      },
      {
        heading: 'How to estimate costs',
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
      },
      {
        heading: 'When big context helps',
      },
      {
        heading: 'Smart strategies',
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
      },
      {
        heading: 'Context and examples',
      },
      {
        heading: 'Common mistakes',
      },
      {
        heading: 'Iterate, don\'t fight',
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
      },
      {
        heading: 'What uses web search',
      },
      {
        heading: 'The cost',
      },
      {
        heading: 'Which models have it',
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
      },
      {
        heading: 'Common hallucinations',
      },
      {
        heading: 'How to reduce them',
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
      },
      {
        heading: 'Open source wins on:',
      },
      {
        heading: 'Closed source wins on:',
      },
      {
        heading: 'The practical question',
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
      },
      {
        heading: 'How they work: the multiplication',
      },
      {
        heading: 'Why they matter',
      },
      {
        heading: 'The training process',
      },
      {
        heading: 'A concrete example',
      },
      {
        heading: 'Advanced: stacking layers',
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
      },
      {
        heading: 'From pixels to predictions',
      },
      {
        heading: 'What the network learns',
      },
      {
        heading: 'Why this matters for real models',
      },
      {
        heading: 'Try it yourself',
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
      },
      {
        heading: 'Why one layer stops being enough',
      },
      {
        heading: 'Layer 1 finds strokes, not digits',
      },
      {
        heading: 'Layer 2 combines strokes into digits',
      },
      {
        heading: 'This is exactly what deep networks do',
      },
      {
        heading: 'Try it yourself',
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
      },
      {
        heading: 'Start with a shrug',
      },
      {
        heading: 'One number for "how wrong are we?"',
      },
      {
        heading: 'The slope tells you which way is downhill',
      },
      {
        heading: 'The learning rate is the size of your stride',
      },
      {
        heading: 'Watch 64 weights find their values',
      },
      {
        heading: 'Valleys that are not the valley',
      },
      {
        heading: 'This is how every model on this site was made',
      },
    ],
  },
  {
    slug: 'train-a-neural-network',
    level: 'lab',
    question: 'How do you train a neural network?',
    metaTitle: 'Train a neural network yourself - Interactive lab - Models.fyi',
    metaDescription: 'Label 50 tiny images, train a real 64-weight neural network in your browser, and test the weights it learned.',
    hook: 'You are the teacher: label the drawings, then watch the model turn your answers into weights.',
    interactive: TrainingLab,
    sections: [
      { heading: 'Training starts with examples' },
      { heading: 'Your labels become the lesson' },
      { heading: 'Gradient descent changes the weights' },
      { heading: 'A backwards lesson still teaches something' },
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
      },
      {
        heading: 'Generation is prediction in a loop',
      },
      {
        heading: 'What LLMs do differently',
      },
      {
        heading: 'Where the hallucinations come from',
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
      },
      {
        heading: 'What the two-layer model can\'t say',
      },
      {
        heading: 'Layer 1: smaller parts than before',
      },
      {
        heading: 'Layer 2: where shapes live',
      },
      {
        heading: 'Layer 3: a very short argument',
      },
      {
        heading: 'What depth actually buys',
      },
      {
        heading: 'Try it yourself',
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
