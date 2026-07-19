/**
 * AI model and benchmark glossary terms.
 * Plain-language definitions for users learning about AI models.
 */

export interface GlossaryTerm {
  id: string
  term: string
  short: string
  long: string
  /** Slug for cross-linking to Learn topics, if applicable. */
  relatedLearnTopic?: string
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'ai-model',
    term: 'AI Model',
    short: 'A trained system that takes text input and generates text output.',
    long: 'An AI model is a computer program that has been trained on lots of text from the internet. It learns patterns in language, then uses those patterns to predict what words should come next. Think of it like autocomplete on your phone, but way more powerful. Models like GPT, Claude, and Gemini are all AI models.',
    relatedLearnTopic: 'what-is-ai-model',
  },
  {
    id: 'llm',
    term: 'LLM (Large Language Model)',
    short: 'A type of AI model trained on massive amounts of text.',
    long: 'LLM stands for "Large Language Model." It\'s an AI model trained on billions of words from the internet. The "large" part means it has billions of internal knobs (called parameters) that let it understand nuance and context. GPT, Claude, and Gemini are all LLMs.',
    relatedLearnTopic: 'what-is-llm',
  },
  {
    id: 'gpt',
    term: 'GPT',
    short: 'A type of language model created by OpenAI.',
    long: 'GPT stands for "Generative Pre-trained Transformer." It\'s OpenAI\'s line of AI models (like GPT-4o, GPT-4 Turbo). The name breaks down: "Generative" means it creates text, "Pre-trained" means it was trained on lots of data before release, and "Transformer" is the underlying architecture. Most people use GPT to mean "any advanced AI chatbot."',
  },
  {
    id: 'context-window',
    term: 'Context Window',
    short: 'How much text an AI model can consider at one time.',
    long: 'Your context window is how much text you can fit in a model\'s "working memory" at once. A 4K context window means the model can read about 4,000 words before it forgets what you said earlier. Longer context windows are better for summarizing books, analyzing documents, or having long conversations without losing track of the beginning.',
    relatedLearnTopic: 'how-to-make-the-most-of-context-windows',
  },
  {
    id: 'token',
    term: 'Token',
    short: 'A small piece of text, roughly one word.',
    long: 'A token is how AI models count words. One token is roughly one word, sometimes a bit less for short words or more for long words and punctuation. When you see pricing like "$0.50 per million tokens," they\'re charging you by the token. If you input 100 words and the model outputs 100 words, you\'re paying for ~200 tokens total.',
    relatedLearnTopic: 'how-does-ai-pricing-work',
  },
  {
    id: 'hallucination',
    term: 'Hallucination',
    short: 'When an AI model makes up false information confidently.',
    long: 'A hallucination is when an AI model confidently says something that isn\'t true, and it sounds completely convincing. It might cite a fake research paper, invent historical events, or claim a company has a product it doesn\'t. The model isn\'t "lying" on purpose. It\'s just filling in gaps based on patterns it learned, even when it has no real information.',
    relatedLearnTopic: 'what-are-ai-hallucinations',
  },
  {
    id: 'reasoning-model',
    term: 'Reasoning Model',
    short: 'An AI model that "thinks step by step" before answering.',
    long: 'A reasoning model is trained to break down hard problems before answering. Instead of jumping straight to an answer, it writes out its thinking: "Step 1... Step 2... Step 3... Therefore..." This takes more time and tokens, but gets better answers on hard problems like math, coding, and logic puzzles.',
    relatedLearnTopic: 'what-is-reasoning-model',
  },
  {
    id: 'fine-tuning',
    term: 'Fine-tuning',
    short: 'Specializing an AI model for a specific task or style.',
    long: 'Fine-tuning is when you take a pre-trained AI model and train it a bit more on data specific to your needs. Like if you want an AI that writes like Shakespeare or always formats medical advice a certain way, you\'d fine-tune it on examples of that style. It\'s cheaper and faster than training from scratch but still effective.',
    relatedLearnTopic: 'what-is-fine-tuning',
  },
  {
    id: 'benchmark',
    term: 'Benchmark',
    short: 'A standardized test that measures AI model performance.',
    long: 'A benchmark is a set of questions or tasks designed to measure how good an AI model is. Like how SAT scores compare students, benchmarks compare models. There are benchmarks for coding (SWE-bench), reasoning (GPQA Diamond), and specialized skills (virology tests). Higher scores are better.',
  },
  {
    id: 'swe-bench',
    term: 'SWE-bench',
    short: 'A benchmark that tests how well an AI can fix real software bugs.',
    long: 'SWE-bench (Software Engineering Benchmark) takes real bugs from open-source projects and asks AI models to fix them. It\'s like giving the model a homework assignment: "Here\'s a bug, write the code to fix it." The model gets points if its fix works. This shows how useful an AI is for coding.',
  },
  {
    id: 'gpqa-diamond',
    term: 'GPQA Diamond',
    short: 'A benchmark of PhD-level science questions that can\'t be Googled.',
    long: 'GPQA Diamond is a set of hard science questions written by PhDs (in chemistry, biology, physics, etc). The key: you can\'t just Google the answer. You have to reason through the science. It tests whether an AI model can think like a scientist, not just look things up.',
  },
  {
    id: 'prompt-engineering',
    term: 'Prompt Engineering',
    short: 'Writing questions for AI models in clever ways to get better answers.',
    long: 'Prompt engineering is the art of asking AI models the right question in the right way. Instead of just "What is photosynthesis?", a better prompt might be "Explain photosynthesis like I\'m five years old, using only simple words" or "Here\'s an example of what I want... now do the same for this." Small changes to your prompt can make huge differences in quality.',
    relatedLearnTopic: 'prompt-engineering-basics',
  },
  {
    id: 'api',
    term: 'API',
    short: 'A way for your app to talk to an AI model.',
    long: 'API stands for "Application Programming Interface." In this context, it\'s how your code (or app) connects to an AI model. Instead of visiting a website, your code sends a request to the API, the model processes it, and you get a response back. OpenAI, Anthropic, and Google all offer APIs so developers can build on top of their models.',
  },
  {
    id: 'embedding',
    term: 'Embedding',
    short: 'A way to turn words into numbers that AI can understand.',
    long: 'An embedding is a list of numbers that represents the meaning of a word or phrase. It\'s how AI models "think" internally: everything is converted to numbers. Embeddings are also useful for finding similar ideas. Convert "cat" and "kitten" to embeddings, and they land close together numerically, because they\'re similar concepts.',
    relatedLearnTopic: 'what-are-embedding-models',
  },
  {
    id: 'web-search',
    term: 'Web Search',
    short: 'When an AI model can search the internet for up-to-date information.',
    long: 'Some AI models have "web search" built in, meaning they can look up current information instead of relying only on training data from 2023 (or older). Models with web search are better for current events, today\'s stock prices, or recently released products. Without web search, an AI might give you outdated information without realizing it.',
  },
  {
    id: 'rag',
    term: 'RAG (Retrieval-Augmented Generation)',
    short: 'A technique where an AI model looks up relevant documents before answering.',
    long: 'RAG stands for "Retrieval-Augmented Generation." Instead of asking an AI model to answer from memory, RAG first searches a database for relevant documents, then passes those documents to the model along with your question. The model can then reference the documents in its answer, making it more accurate and up-to-date. It\'s like letting the model "read the manual" before answering.',
  },
  {
    id: 'open-source',
    term: 'Open Source',
    short: 'AI models that anyone can download and run themselves.',
    long: 'Open source AI models are free and publicly available. You can download them, run them on your own computer (if it\'s powerful enough), and even modify them. Llama, Mistral, and many others are open source. The tradeoff: they\'re usually less powerful than ChatGPT or Claude, but you have full control and privacy.',
    relatedLearnTopic: 'open-source-vs-closed-source-ai',
  },
  {
    id: 'closed-source',
    term: 'Closed Source',
    short: 'AI models you access through an API, not by downloading.',
    long: 'Closed source models like GPT-4, Claude, and Gemini aren\'t available to download. You access them through an API: you send your text to OpenAI\'s servers, they run the model, and they send the result back. The advantage: these models are typically more powerful. The tradeoff: your data goes to their servers, and you depend on their service.',
  },
  {
    id: 'temperature',
    term: 'Temperature',
    short: 'A setting that controls how creative vs predictable an AI model is.',
    long: 'Temperature is a number from 0 to 1 that controls how "risky" the model\'s choices are. Temperature 0 = always pick the most likely next word (predictable, boring, but consistent). Temperature 1 = more randomness (creative, surprising, but less reliable). For math or facts, use low temperature. For creative writing, use higher temperature.',
  },
  {
    id: 'multimodal',
    term: 'Multimodal',
    short: 'An AI model that can understand multiple types of input (text, images, etc).',
    long: 'A multimodal model can process more than just text. It can read images, understand video, listen to audio, etc. GPT-4 Vision, Claude 3, and Gemini are all multimodal. You can show them a photo and ask what\'s in it, or give them a chart and ask them to summarize it.',
  },
  {
    id: 'vision-model',
    term: 'Vision Model',
    short: 'An AI model that can analyze images.',
    long: 'A vision model is an AI trained to understand images. You can show it a photo, diagram, or screenshot and ask questions about it. "What\'s in this image?" "Read the text in this screenshot." "Is there a dog in this photo?" Models with vision are multimodal (they also understand text).',
    relatedLearnTopic: 'what-are-vision-models',
  },
  {
    id: 'provider',
    term: 'Provider',
    short: 'A company that makes and operates AI models.',
    long: 'A provider is a company like OpenAI (makes GPT), Anthropic (makes Claude), Google (makes Gemini), or xAI (makes Grok). They train the models, maintain the servers, and usually charge you to use them through an API.',
  },
  {
    id: 'flagship-model',
    term: 'Flagship Model',
    short: 'A company\'s most powerful, most expensive AI model.',
    long: 'Every provider has a "flagship": their best model. For OpenAI, it\'s GPT-4o. For Anthropic, it\'s Claude Opus. These are the most capable and usually the most expensive. It\'s like the luxury car in a car company\'s lineup.',
  },
  {
    id: 'fast-model',
    term: 'Fast Model',
    short: 'A smaller AI model that\'s cheaper and quicker, but less powerful.',
    long: 'Fast models are lightweight versions that trade capability for speed and cost. OpenAI\'s GPT-4o mini, Anthropic\'s Claude Haiku, and Google\'s Gemini Flash are all "fast" models. Use these for simple tasks like classifying text or generating boilerplate. Save the flagship for hard reasoning problems.',
  },
  {
    id: 'input-tokens',
    term: 'Input Tokens',
    short: 'The tokens you send to an AI model (your question or text).',
    long: 'Input tokens are the words you send to the model: your prompt, question, or request. If you write a 1000-word essay and ask the model to edit it, that\'s about 1000 input tokens. Pricing is usually cheaper per token for input than output because output takes more processing.',
  },
  {
    id: 'output-tokens',
    term: 'Output Tokens',
    short: 'The tokens the AI model generates in response (its answer).',
    long: 'Output tokens are the words the model generates in its response. If you ask for a 500-word essay and it writes one, that\'s about 500 output tokens. Output tokens usually cost more per token than input tokens because generating them takes more computation.',
  },
  {
    id: 'inference',
    term: 'Inference',
    short: 'When an AI model takes input and generates output (running the model).',
    long: 'Inference is the act of using a model to generate an answer. You provide input (a prompt), the model runs inference, and you get output. It\'s different from training: training is when you teach the model initially; inference is when you use a trained model to answer questions.',
  },
  {
    id: 'training',
    term: 'Training',
    short: 'The process of teaching an AI model by showing it examples.',
    long: 'Training is when the model\'s creators feed it billions of words from the internet and adjust its internal knobs to predict the next word better and better. After months of training on powerful computers, the model is "frozen" and then used for inference. Training is expensive; inference is cheaper.',
  },
  {
    id: 'anthropic',
    term: 'Anthropic',
    short: 'A company founded in 2021 that makes the Claude AI model.',
    long: 'Anthropic is an AI company founded by Dario Amodei and others from OpenAI. They focus on making AI models that are powerful, safe, and interpretable. Their flagship model is Claude Opus. They\'re based in San Francisco and backed by Google, Salesforce, and others.',
  },
  {
    id: 'openai',
    term: 'OpenAI',
    short: 'The company that created ChatGPT and GPT-4.',
    long: 'OpenAI is an AI research lab founded in 2015 by Elon Musk and others. They created GPT-3, GPT-4, and the popular ChatGPT chatbot. They offer API access to their models and have a free ChatGPT interface. OpenAI is based in San Francisco and is backed by Microsoft.',
  },
  {
    id: 'google',
    term: 'Google',
    short: 'Tech giant that created the Gemini AI model.',
    long: 'Google is the search and advertising company that also does AI research. They created Gemini (formerly Bard), which competes with GPT and Claude. Google has an advantage in web search and access to huge amounts of text from the internet.',
  },
  {
    id: 'xai',
    term: 'xAI',
    short: 'A new AI company founded by Elon Musk in 2023.',
    long: 'xAI (pronounced "X dot A.I.") is an AI company founded by Elon Musk in March 2023. They created Grok, an AI model known for its humor and sarcasm. xAI is trying to be interpretable and truthful. You can ask Grok "why did you say that?" and get explanations.',
  },
  {
    id: 'meta',
    term: 'Meta',
    short: 'Facebook\'s parent company, which makes the Llama open source models.',
    long: 'Meta (formerly Facebook) is the parent company of Facebook, Instagram, and WhatsApp. They also do AI research and released Llama, a family of open source models. Llama models are powerful, free, and available to download.',
  },
  {
    id: 'deepseek',
    term: 'DeepSeek',
    short: 'A Chinese AI company that makes open source models.',
    long: 'DeepSeek is an AI research company based in China. They released DeepSeek-R1, an open source reasoning model. DeepSeek is known for efficient model design and making powerful models that are cheaper to run.',
  },
  {
    id: 'parameter',
    term: 'Parameter',
    short: 'Internal knobs in an AI model that control its behavior.',
    long: 'A parameter is a weight or setting inside an AI model. GPT-4 has hundreds of billions of parameters: that\'s "hundreds of billions of knobs." During training, all these knobs get tuned so the model can predict text well. More parameters usually means more capability, but slower inference.',
  },
  {
    id: 'transformer',
    term: 'Transformer',
    short: 'The neural network architecture used by most modern AI models.',
    long: 'A Transformer is the underlying architecture of modern AI models. It\'s a way of organizing the neurons so the model can understand which words are related to which other words. Transformers are good at this, which is why GPT, Claude, and most modern models use them.',
  },
  {
    id: 'attention',
    term: 'Attention',
    short: 'A technique that helps AI models focus on relevant parts of text.',
    long: 'Attention is a mechanism inside Transformers that lets the model decide which words matter most when answering a question. It\'s like when you read a sentence, you pay attention to the important words and ignore the filler. Attention lets models do this automatically.',
  },
  {
    id: 'loss-function',
    term: 'Loss Function',
    short: 'A measure of how wrong the model\'s prediction is during training.',
    long: 'During training, the model predicts text and measures how wrong it is using a "loss function." If it predicts "the" when the real next word is "cat," the loss is high. The training process then adjusts the model\'s parameters to lower the loss. Lower loss = better predictions.',
  },
  {
    id: 'overfitting',
    term: 'Overfitting',
    short: 'When a model memorizes training data instead of learning general patterns.',
    long: 'Overfitting is when an AI model gets very good at examples it saw during training but fails on new examples it\'s never seen. It\'s like if you memorized every practice SAT question but then bombed the real test. Good models generalize: they learn patterns, not individual examples.',
  },
  {
    id: 'dataset',
    term: 'Dataset',
    short: 'A collection of examples used to train or test an AI model.',
    long: 'A dataset is a set of training examples. For AI models, a dataset is usually billions of words from the internet, books, Wikipedia, etc. The model learns from this dataset. There are also benchmark datasets used to test models, like GPQA Diamond or SWE-bench.',
  },
  {
    id: 'frontier-models',
    term: 'Frontier Models',
    short: 'The most advanced AI models available right now.',
    long: 'Frontier models are the cutting-edge AI models of the moment. As of 2026, GPT-4o, Claude Opus, and Gemini 2.0 are frontier models. In a year, better ones will exist and be the new frontier. Frontier models are expensive but most powerful.',
  },
  {
    id: 'state-of-the-art',
    term: 'State of the Art',
    short: 'The best known performance for a task, usually set by recent models.',
    long: 'State of the art (often abbreviated SOTA) is the best performance anyone has achieved on a benchmark yet. When a new model comes out and gets a higher score than previous records, it sets a new state of the art. Benchmarks track all the historical records.',
  },
  {
    id: 'cost-per-million-tokens',
    term: 'Cost per Million Tokens',
    short: 'The price to process 1 million tokens through a model API.',
    long: 'Most AI API pricing is quoted as cost per million tokens. If an API costs $5 per million input tokens, and your prompt is 1000 tokens, that costs $0.005. It sounds cheap because "per million" is huge, but it adds up if you make thousands of API calls.',
  },
  {
    id: 'epoch',
    term: 'Epoch',
    short: 'One complete pass through all training data during model training.',
    long: 'During training, an epoch is one complete cycle where the model sees every example in the training dataset once. Most models are trained for multiple epochs (maybe 3-5). Each epoch, the model gets slightly better at its task.',
  },
  {
    id: 'batch-size',
    term: 'Batch Size',
    short: 'How many examples the model processes at once during training.',
    long: 'During training, models don\'t learn from one example at a time. They learn from batches (groups). A batch size of 32 means the model processes 32 examples, calculates error for all of them, then updates its parameters. Larger batches are faster; smaller batches can be more accurate.',
  },
  {
    id: 'model-weights',
    term: 'Model Weights',
    short: 'The numerical parameters that define what a trained model knows.',
    long: 'When people say "the model weights," they mean all the numbers inside the model. When you download an open source model, you\'re downloading a file full of billions of these numbers. The weights encode everything the model learned during training. Different weights = different model.',
  },
]

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.id === id)
}

export function getTermsByLetter(letter: string): GlossaryTerm[] {
  const normalized = letter.toUpperCase()
  return glossaryTerms.filter((t) => t.term[0].toUpperCase() === normalized)
}

export function getAllLetters(): string[] {
  const letters = new Set<string>()
  glossaryTerms.forEach((t) => {
    letters.add(t.term[0].toUpperCase())
  })
  return Array.from(letters).sort()
}
