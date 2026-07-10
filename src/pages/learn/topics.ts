/**
 * Education content: Karpathy-style plain-language explainers.
 * Each topic is its own route for SEO. The slugs and meta titles target
 * the search phrases from the product requirements.
 */

export interface TopicSection {
  heading: string
  paragraphs: string[]
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
    metaTitle: 'What is an AI model? Explained simply — Models.fyi',
    metaDescription:
      'What is an AI model, in plain language: a program with billions of tuned dials that learned patterns from data. No math, no jargon, explained like you’re five.',
    hook: 'A program that learned from examples instead of being told the rules.',
    sections: [
      {
        heading: 'The five-year-old version',
        paragraphs: [
          'Normal computer programs are recipe books. A person writes exact steps, and the computer follows them. An AI model doesn’t get written like a recipe. Instead, you show it millions of examples, and it learns the patterns on its own.',
          'Imagine teaching a kid what a dog is. You don’t hand them a rulebook: four legs, fur, tail. You point at dogs until they just get it. That’s how models learn.',
        ],
      },
      {
        heading: 'What a model actually is',
        paragraphs: [
          'Under the hood, a model is a giant pile of numbers, billions of little dials. Training a model means nudging those dials, over and over, until the model’s guesses about its examples stop being wrong. That tuning run takes months on warehouses full of computers, which is why building one costs so much.',
          'Once trained, a model doesn’t "look things up." Everything it knows is squeezed into those dials, like a student who read the whole library but walks into the exam with no notes.',
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
    metaTitle: 'What is an LLM? Large Language Models explained — Models.fyi',
    metaDescription:
      'What is an LLM? A Large Language Model is a giant autocomplete trained on much of the internet. How next-word prediction turns into intelligence, explained simply.',
    hook: 'The world’s most powerful autocomplete, and that’s not an insult.',
    sections: [
      {
        heading: 'Autocomplete, but enormous',
        paragraphs: [
          'LLM stands for Large Language Model. At its heart, it does one deceptively simple thing: given some text, it predicts the next word. "The cat sat on the ___" probably continues with "mat".',
          'Your phone’s keyboard does this too. The difference is scale. An LLM has read a huge slice of the internet and has billions of dials tuned for the job. Predicting the next word this well forces the model to understand grammar, facts, logic, even code.',
        ],
      },
      {
        heading: 'One word at a time',
        paragraphs: [
          'When ChatGPT or Claude "writes" you an answer, it’s predicting one word, adding it to the page, then predicting the next, thousands of times, fast. There’s no separate "essay plan" hiding inside. The plan emerges from doing next-word prediction with superhuman skill.',
          'This also explains the famous weakness. An LLM says what’s likely, not what’s verified. When likely and true disagree, you get confident nonsense. People call this a hallucination.',
        ],
      },
      {
        heading: 'The models on this site',
        paragraphs: [
          'GPT, Claude, Gemini, Grok, Llama, DeepSeek: all LLMs. Same core idea, different training data, sizes, and tuning. That’s why they have different personalities and different scores on our comparison table.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-gpt',
    question: 'What is GPT?',
    metaTitle: 'What is GPT? What the letters mean — Models.fyi',
    metaDescription:
      'What does GPT stand for? Generative Pre-trained Transformer, decoded word by word in plain language, and how GPT differs from ChatGPT.',
    hook: 'Three ordinary words hiding behind one famous acronym.',
    sections: [
      {
        heading: 'Decode the letters',
        paragraphs: [
          'G is for Generative. It creates new text rather than picking from canned replies.',
          'P is for Pre-trained. Before you ever talk to it, it spent months learning from a mountain of text, so you get the finished student, not the classroom.',
          "T is for Transformer, the 2017 invention that made all this work. It’s a design that lets the model weigh every word in your message against every other word at once, instead of reading one word at a time and forgetting the start of the sentence.",
        ],
      },
      {
        heading: 'GPT vs ChatGPT',
        paragraphs: [
          'GPT is the engine. ChatGPT is the car built around it: the chat app, the safety layer, the web search. OpenAI names its engines GPT-something, like GPT-5.6, and the app stays ChatGPT.',
          'Other companies build the same kind of engine with different names: Anthropic’s Claude, Google’s Gemini, xAI’s Grok. People sometimes say "a GPT" for any of them, like saying "googling" for any search.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-a-context-window',
    question: 'What is a context window?',
    metaTitle: 'What is a context window? AI memory explained — Models.fyi',
    metaDescription:
      'What is a context window in AI? The model’s working memory: how much text it can consider at once, why it’s measured in tokens, and why size matters.',
    hook: 'The size of the model’s desk, and what falls off the edge.',
    sections: [
      {
        heading: 'The desk analogy',
        paragraphs: [
          'A model’s context window is its working memory: everything it can "see" at once, including your question, the conversation so far, and any documents you pasted in. Think of it as a desk. A small desk fits one letter. A huge desk fits every binder for a whole project, spread out where the model can read all of it.',
          'When the desk is full, the oldest pages fall off the edge. That’s why a very long chat can suddenly "forget" what you said at the start. It literally can’t see it anymore.',
        ],
      },
      {
        heading: 'Tokens: word pieces',
        paragraphs: [
          'Context windows are measured in tokens, chunks of about three-quarters of a word. "Hamburger" might be three tokens, while "the" is one. A 1M-token window is roughly 750,000 words: the whole Lord of the Rings trilogy with room to spare.',
          'On our comparison table, context ranges from 200K tokens, about a long novel, to Llama 4 Scout’s absurd 10M, about a small library. Bigger isn’t automatically better, since you pay for what the model reads, but for big documents it’s the number that decides whether the job is possible at all.',
        ],
      },
    ],
  },
  {
    slug: 'reasoning-models',
    question: 'What is a reasoning model?',
    metaTitle: 'Reasoning vs non-reasoning AI models explained — Models.fyi',
    metaDescription:
      'What is a reasoning or thinking AI model? Why some models pause to think step by step before answering, when that helps, and when it’s a waste of money.',
    hook: 'Some models blurt out answers. Others grab scratch paper first.',
    sections: [
      {
        heading: 'Scratch paper',
        paragraphs: [
          'Ask someone 7×8 and they answer instantly from memory. Ask them 47×83 and they want scratch paper. Reasoning models, also called "thinking" models, are LLMs that learned to use scratch paper. Before answering, they privately write out steps, check their own work, and only then reply.',
          'That thinking phase is text the model generates. You usually just see a "thinking…" pause, and sometimes a summary of it.',
        ],
      },
      {
        heading: 'When it matters, and when it doesn’t',
        paragraphs: [
          'For math, tricky code, and multi-step planning, reasoning is a huge upgrade. The model catches its own mistakes mid-way instead of committing to a bad first guess.',
          'For "write a birthday message," it’s a waste. You pay for thinking time in both money and seconds. That’s why fast models exist, and why the newest models decide for themselves how hard to think based on the question.',
          'Almost every current flagship is a reasoning model, marked with the 🧠 badge on our comparison table. The main exceptions are speed-focused and older open models.',
        ],
      },
    ],
  },
  {
    slug: 'which-model-should-i-use',
    question: 'Which model should I use?',
    metaTitle: 'Which AI model should I use? A plain answer — Models.fyi',
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
          'It depends on what you’re doing, what you’ll spend, and whether you care about open source. That’s exactly what our quiz asks: four questions, one recommendation, reasoning included.',
        ],
      },
    ],
  },
]
