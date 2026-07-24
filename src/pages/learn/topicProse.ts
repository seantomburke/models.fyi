/**
 * Lesson body copy for the Learn topics, split out of topics.ts.
 *
 * topics.ts is reachable from src/lib/routeMeta.ts, which every page imports for
 * metaFor/canonicalUrl, so anything it holds ships in the chunk all 58 routes
 * preload. The paragraph text is ~15kB gzip and is rendered by exactly one route,
 * so it lives here and is imported only by LearnTopic.
 *
 * Keyed by `<slug>::<section heading>`; topics.ts owns the headings and their
 * order, and a Learn.test.tsx guard asserts every section here resolves.
 */
export const topicProse: Record<string, string[]> = {
  "train-a-neural-network::Training starts with examples": [
    'A neural network cannot learn what an E or a 3 is until somebody supplies examples. Here, each 8×8 drawing is deliberately a little different, like handwriting from different people.',
  ],
  "train-a-neural-network::Your labels become the lesson": [
    'The pictures do not come with answers attached. The buckets are the answers. When you put a picture in the E bucket, you are telling the model to make that output more likely next time it sees a similar pattern.',
  ],
  "train-a-neural-network::Gradient descent changes the weights": [
    'Training compares each guess with your label, measures how wrong it was, then nudges all 64 weights a little. The loss number falls when those small nudges make the model agree with more of your examples.',
  ],
  "train-a-neural-network::A backwards lesson still teaches something": [
    'Try inverting every label before training. The model is not secretly aware that a shape looks like a 3. It learns the rule in its examples, so reversed teaching produces a reversed classifier.',
  ],
  "what-is-an-ai-model::The five-year-old version": [
      'Normal computer programs are recipe books. A person writes exact steps, and the computer follows them. An AI model doesn\'t get written like a recipe. Instead, you show it millions of examples, and it learns the patterns on its own.',
      'Imagine teaching a kid what a dog is. You don\'t hand them a rulebook: four legs, fur, tail. You point at dogs until they just get it. That\'s how models learn.',
  ],
  "what-is-an-ai-model::What a model is, under the hood": [
      'Under the hood, a model is a giant pile of numbers, billions of little dials. Training a model means nudging those dials, over and over, until the model\'s guesses about its examples stop being wrong. That tuning run takes months on warehouses full of computers, which is why building one costs so much.',
      'Once trained, a model doesn\'t "look things up." Everything it knows is squeezed into those dials, like a student who read the whole library but walks into the exam with no notes.',
  ],
  "what-is-an-ai-model::Why there are so many of them": [
      'Companies keep training new models because bigger, better-tuned piles of dials keep getting smarter. Each release is a new "brain" with different strengths, speeds, and prices. That is why picking the right one matters, and why this site exists.',
  ],
  "what-is-an-llm::Autocomplete, but enormous": [
      'LLM stands for Large Language Model. At its heart, it does one deceptively simple thing: given some text, it predicts the next word. "The cat sat on the ___" probably continues with "mat".',
      'Your phone\'s keyboard does this too. The difference is scale. An LLM has read a huge slice of the internet and has billions of dials tuned for the job. Predicting the next word this well forces the model to understand grammar, facts, logic, even code.',
  ],
  "what-is-an-llm::One word at a time": [
      'When ChatGPT or Claude "writes" you an answer, it\'s predicting one word, adding it to the page, then predicting the next, thousands of times, fast. There\'s no separate "essay plan" hiding inside. The plan emerges from doing next-word prediction with superhuman skill.',
      'This also explains the famous weakness. An LLM says whatever is most likely. Nothing checks whether it is true. When likely and true disagree, you get confident nonsense. People call this a hallucination.',
  ],
  "what-is-an-llm::The models on this site": [
      'GPT, Claude, Gemini, Grok, Llama, DeepSeek: all LLMs. Same core idea, different training data, sizes, and tuning. That\'s why they have different personalities and different scores on our comparison table.',
  ],
  "what-is-gpt::Decode the letters": [
      'G is for Generative. It creates new text rather than picking from canned replies.',
      'P is for Pre-trained. Before you ever talk to it, it spent months learning from a mountain of text. By the time you arrive, the studying is done and you get the finished student.',
      'T is for Transformer, the 2017 invention that made all this work. It\'s a design that lets the model weigh every word in your message against every other word at once, instead of reading one word at a time and forgetting the start of the sentence.',
  ],
  "what-is-gpt::GPT vs ChatGPT": [
      'GPT is the engine. ChatGPT is the car built around it: the chat app, the safety layer, the web search. OpenAI names its engines GPT-something, like GPT-5.6, and the app stays ChatGPT.',
      'Other companies build the same kind of engine with different names: Anthropic\'s Claude, Google\'s Gemini, xAI\'s Grok. People sometimes say "a GPT" for any of them, like saying "googling" for any search.',
  ],
  "what-is-a-context-window::The desk analogy": [
      'A model\'s context window is its working memory: everything it can "see" at once, including your question, the conversation so far, and any documents you pasted in. Think of it as a desk. A small desk fits one letter. A huge desk fits every binder for a whole project, spread out where the model can read all of it.',
      'When the desk is full, the oldest pages fall off the edge. That\'s why a very long chat can suddenly "forget" what you said at the start. It literally can\'t see it anymore.',
  ],
  "what-is-a-context-window::Tokens: word pieces": [
      'Context windows are measured in tokens, chunks of about three-quarters of a word. "Hamburger" might be three tokens, while "the" is one. A 1M-token window is roughly 750,000 words: the whole Lord of the Rings trilogy with room to spare.',
      'On our comparison table, context ranges from 200K tokens, about a long novel, to Llama 4 Scout\'s absurd 10M, about a small library. Bigger isn\'t automatically better, since you pay for what the model reads, but for big documents it\'s the number that decides whether the job is possible at all.',
  ],
  "what-is-a-token::Tokens are how models read": [
      'A token is a small chunk of text. Models don\'t read whole words or sentences at once. They read tokens: single characters, word pieces, or whole small words, depending on what\'s common.',
      '"The" is one token. "Hamburger" is two: "Hamb" + "urger". Even the space before a word is part of its token. Mathematical symbols, punctuation, and newlines also get tokenized. The pattern depends on the model\'s tokenizer, which is tuned during training.',
  ],
  "what-is-a-token::Why tokens exist": [
      'Models are trained on numerical patterns, and tokens convert text into chunks manageable for math. Smaller chunks (single characters) give you more precision but make sequences very long. Larger chunks (whole words) are more efficient but miss detail. Tokens strike a balance: usually 1-3 tokens per word, optimized for the language and the model.',
  ],
  "reasoning-models::Scratch paper": [
      'Ask someone 7x8 and they answer instantly from memory. Ask them 47x83 and they want scratch paper. Reasoning models, also called "thinking" models, are LLMs that learned to use scratch paper. Before answering, they privately write out steps, check their own work, and only then reply.',
      'That thinking phase is text the model generates. You usually just see a "thinking..." pause, and sometimes a summary of it.',
  ],
  "reasoning-models::When it matters, and when it doesn't": [
      'For math, tricky code, and multi-step planning, reasoning is a huge upgrade. The model catches its own mistakes mid-way instead of committing to a bad first guess.',
      'For "write a birthday message," it\'s a waste. You pay for thinking time in both money and seconds. That\'s why fast models exist, and why the newest models decide for themselves how hard to think based on the question.',
      'Almost every current flagship is a reasoning model, marked with the brain badge on our comparison table. The main exceptions are speed-focused and older open models.',
  ],
  "which-model-should-i-use::The short answer": [
      'For most people, most of the time, a mid-tier model from any major company, like Claude Sonnet or GPT-5.6 Terra, is fast, cheap, and smarter than you need. Save the premium flagships for hard coding, research, and long autonomous work, and use a fast tier for bulk simple stuff.',
      'If your question involves anything recent, like news, prices, or sports, make sure the model can search the web. Models only know what existed when their training ended.',
  ],
  "which-model-should-i-use::The real answer": [
      'It depends on what you\'re doing, what you\'ll spend, and whether you care about open source. That\'s exactly what our quiz asks: four questions, one recommendation, reasoning included.',
  ],
  "claude-vs-gpt::Who built them": [
      'Claude comes from Anthropic, a San Francisco AI safety company. GPT comes from OpenAI, also in San Francisco, known for ChatGPT and pushing capabilities forward. Both companies take safety seriously and release multiple tiers.',
  ],
  "claude-vs-gpt::Personality and style": [
      'Claude tends to be thoughtful and explanatory. It works through problems carefully and admits uncertainty. GPT tends to be faster and more direct, with less hedging.',
      'Neither is objectively better. If you like a reasoning AI that walks you through its thinking, Claude. If you want fast, confident answers, GPT.',
  ],
  "claude-vs-gpt::What they're good at": [
      'Claude: analysis, writing, coding with clear explanations. GPT: broad knowledge, speed, multimodal (Claude just added this). For math and tricky logic, both have reasoning models that pause to think.',
  ],
  "claude-vs-gpt::Price and availability": [
      'Both offer cheap fast tiers and expensive flagship tiers. GPT is available through ChatGPT (web, app, API). Claude is on Claude.ai, API, and select partners. Neither wins on cost. It depends on your workload.',
  ],
  "claude-vs-gemini::Google's breadth vs Anthropic's focus": [
      'Google Gemini is built into Gmail, Drive, Photos, and Android. If you live in the Google ecosystem, Gemini is already there. Claude is a standalone product, no ecosystem lock-in.',
      'Gemini is a newer brand built on Google\'s existing research, while Claude is Anthropic\'s entire product. Anthropic is smaller and focuses on safety and capabilities; Google is vast and plays longer games.',
  ],
  "claude-vs-gemini::Capabilities": [
      'Both handle text, image understanding, and coding. Claude has longer context windows (200K to 1M tokens). Gemini is better integrated with web search through Google.',
      'For pure reasoning, Claude\'s latest is slightly ahead on benchmarks. For search and real-time data, Gemini wins.',
  ],
  "claude-vs-gemini::Pick Claude if you want:": [
      'Focused, thoughtful AI that walks you through reasoning. Longer context for whole-document analysis. A company betting on AI safety.',
  ],
  "claude-vs-gemini::Pick Gemini if you want:": [
      'Deep integration with Google apps and Android. Search-powered answers with fresh data. Access through your Google account.',
  ],
  "grok-vs-gpt::The underdog": [
      'Grok is xAI\'s answer to GPT. xAI is Elon Musk\'s AI company, founded in 2023. They built Grok to be faster, cheaper, and more irreverent than competitors. Grok is available through X (formerly Twitter) and an API.',
  ],
  "grok-vs-gpt::What Grok does well": [
      'Speed. Grok is optimized for quick answers. Real-time data through X integration. Cheaper per token than many flagships. Smaller deployments so lower latency.',
  ],
  "grok-vs-gpt::Where GPT still leads": [
      'GPT has years of refinement and a bigger user base. More third-party integrations. Larger flagship models (GPT-5.6) still beat Grok on complex reasoning.',
  ],
  "grok-vs-gpt::Try Grok if:": [
      'You want speed and real-time news. You like Musk or X\'s direction. You need a cheaper fast option. For serious reasoning or long-form work, GPT remains the safer pick.',
  ],
  "best-model-for-coding::What coders need": [
      'Coding needs accuracy, reasoning, and long context. A model must understand syntax, avoid subtle bugs, and handle whole files. It should spot its own mistakes if asked.',
      'All flagship models can code. Difference is in reliability and speed.',
  ],
  "best-model-for-coding::Claude for coding": [
      'Claude excels at thorough code review and refactoring. It catches edge cases and explains the reasoning. Developers report fewer silent bugs when Claude writes code.',
      'Best for: complex architectures, security-critical code, teaching junior engineers.',
  ],
  "best-model-for-coding::GPT for coding": [
      'GPT is fast. GPT-5.6 reasons well. You get quick solutions with reasonable explanations. Slightly less careful than Claude on edge cases.',
      'Best for: quick scripts, boilerplate, speedy iteration.',
  ],
  "best-model-for-coding::The tier question": [
      'For junior tasks (style fixes, tests, docs), use a mid-tier model and save money. For architecting a new system, use a flagship with reasoning. Speed models are fast but miss subtleties.',
  ],
  "best-model-for-writing::What writers need": [
      'Writing needs tone, flow, and original voice. A model must adapt to your style, catch repetition, and know when to be formal vs casual. Its job is to finish your thoughts in your voice.',
  ],
  "best-model-for-writing::Claude for writing": [
      'Claude is thoughtful and clear. It asks clarifying questions before drafting. Produces well-reasoned essays, explanations, and marketing copy.',
      'Best for: long-form content, essays, everything-from-scratch writing.',
  ],
  "best-model-for-writing::GPT for writing": [
      'GPT is faster and more versatile. Good for editing, rewriting, and tight deadlines. Can juggle multiple voices.',
      'Best for: quick drafts, editing, stylistic variation.',
  ],
  "best-model-for-writing::For both: use mid-tier first": [
      'Sonnet and GPT-5.6 Terra (not the flagships) are fast enough and cheap enough for everyday writing. Upgrade to a flagship if you\'re iterating on something that needs to be perfect.',
  ],
  "best-model-for-research::What research needs": [
      'Research needs accuracy, citations, and intellectual honesty. A model must synthesize multiple sources, flag gaps, and admit uncertainty. Long context helps for reading whole papers.',
  ],
  "best-model-for-research::Claude for research": [
      'Claude is the research favorite. It synthesizes clearly, flags assumptions, and admits limits. Can handle 200K-token papers in a single query.',
      'Best for: literature review, synthesis, academic writing.',
  ],
  "best-model-for-research::GPT for research": [
      'GPT is broader and faster. Less likely to miss context, more likely to confidently state something uncertain.',
      'Best for: quick literature scans, trend analysis.',
  ],
  "best-model-for-research::Pro tip": [
      'For research, use a flagship with reasoning (Opus, GPT-5.6 Sol). The cost is worth the accuracy. Always verify claims in the original sources. No model is a substitute for that.',
  ],
  "vision-models::Beyond text": [
      'A text-only model reads words. A vision model reads words and images. Show it a photo, ask a question about it, and it answers. Same magic as text models, but trained on billions of image-text pairs.',
  ],
  "vision-models::What they can do": [
      'Read text in images (OCR). Describe what\'s happening. Spot objects and faces. Analyze charts and diagrams. Answer questions about visual content. All of this was learned from examples during training.',
  ],
  "vision-models::The models that see": [
      'Claude and GPT-5.6 have vision. So does Gemini and Grok. Vision is now standard in flagships. You usually pay a bit more per query when you include an image.',
      'For heavy image work (scanning thousands of documents), specialized vision models exist, but flagship LLMs cover most use cases.',
  ],
  "embedding-models::Converting meaning to numbers": [
      'An embedding model reads text and outputs numbers, thousands of them, in a pattern that captures meaning. "dog" and "puppy" are close in number-space. "dog" and "algebra" are far apart.',
      'These numbers let computers compare meaning without understanding words.',
  ],
  "embedding-models::Why they matter": [
      'Embeddings power semantic search: finding documents about "fast cars" when you search "quick vehicles." They power recommendations: "users who liked this also liked that."',
      'They\'re also how RAG systems work. You convert a document library to embeddings, search by meaning, then hand relevant excerpts to a language model to answer.',
  ],
  "embedding-models::When do you need one?": [
      'If you\'re building search or recommendations, yes. If you\'re just chatting with a model, no. Most RAG systems use a cheap standalone embedding model and save the big language model for answering.',
  ],
  "fine-tuning-models::The idea": [
      'A model is pre-trained on billions of words. Fine-tuning means showing it hundreds or thousands of your own examples (your style, your data, your format) and letting it adjust its dials slightly to match.',
      'It\'s cheaper than training from scratch but more intensive than a one-off prompt.',
  ],
  "fine-tuning-models::When to fine-tune": [
      'Your task is highly specialized (legal language, your brand\'s tone, a niche domain). You\'ll run the model thousands of times, so per-call savings add up. You want consistency across many generations.',
      'Start with prompting and RAG first. Fine-tuning is premature if a careful prompt or two examples get you there.',
  ],
  "fine-tuning-models::The trade-off": [
      'Fine-tuning costs money upfront and takes time. But a fine-tuned model becomes cheaper to run than a flagship for high volume. It pays off once you have real volume, so treat it as a scaling play.',
  ],
  "model-pricing-tokens::Tokens: the unit of price": [
      'A token is about 3/4 of a word. "Hamburger" = 3 tokens. "Hello" = 1 token. Pricing is per 1,000 tokens. So if you\'re charged $2 per 1K tokens, and you send 2,000 tokens, you pay $4.',
  ],
  "model-pricing-tokens::Input vs output: the split": [
      'Input is what you send: your prompt, your documents, your question. Output is what comes back: the model\'s answer. Most models charge differently for each.',
      'Input is cheaper because generating new text (output) is harder than reading (input). A 10-token prompt might cost 1 cent. A 100-token answer might cost 2 cents.',
  ],
  "model-pricing-tokens::How to estimate costs": [
      'Count tokens with the model\'s tokenizer tool. Multiply input tokens by the input rate, output tokens by the output rate, add them up. For a typical Q&A: ask 500 tokens, get back 200, at standard pricing, costs cents.',
      'Check our comparison table for current rates. Most flagships are $1-2 per 1M input tokens, $3-5 per 1M output tokens.',
  ],
  "context-window-strategies::Bigger isn't always better": [
      'A 200K-token window is huge: a whole book. But if you\'re asking a simple question, you pay for all that unused space. Models charge per token read, so a big context means a bigger bill.',
  ],
  "context-window-strategies::When big context helps": [
      'Analyzing a 50-page codebase: big context wins. Summarizing a book: big context wins. Analyzing multiple PDFs at once: big context wins. Asking "what is X?": small context is fine.',
  ],
  "context-window-strategies::Smart strategies": [
      'Cut irrelevant sections. Summarize before dumping. Use RAG (search documents, feed only relevant snippets). Put most important info first so the model sees it if it forgets the end.',
      'For huge documents, chunk them and process separately, then synthesize. Cheaper than one gigantic query.',
  ],
  "prompt-engineering-basics::Clear beats clever": [
      'Describe the output you want. "Summarize this in three bullet points" beats "You are a concise summarizer, now summarize this." The model doesn\'t have an inner voice you need to talk to.',
  ],
  "prompt-engineering-basics::Context and examples": [
      'Tell the model your role, the stakes, and the format. "I\'m a startup founder, help me pitch this to investors in 2 minutes" is better than "write a pitch."',
      'Give examples if you can. "Here\'s a good one: [example]. Now do this: [task]" gets more consistent results.',
  ],
  "prompt-engineering-basics::Common mistakes": [
      'Being too short: "summarize this" without telling it how. Being too fancy: "engage your inner analyst." Changing your request mid-way: stick to one task per prompt.',
      'Expecting perfection: iterate. Ask follow-ups. Refine.',
  ],
  "prompt-engineering-basics::Iterate, don't fight": [
      'If the first answer is close but not quite, ask for a revision instead of a completely new prompt. Models are good at tweaks.',
  ],
  "web-search-models::The knowledge cutoff problem": [
      'All models are trained on data up to a specific date, the knowledge cutoff. Claude\'s was trained up to early 2024. A question about a 2026 announcement gets a shrug: "I don\'t know."',
      'A model with web search can look it up and give you today\'s answer.',
  ],
  "web-search-models::What uses web search": [
      'Anything current: news, stock prices, recent announcements, today\'s weather. Anything niche: obscure research papers, job listings, recent blog posts.',
      'You don\'t need search for general knowledge: history, math, how things work.',
  ],
  "web-search-models::The cost": [
      'Web search adds latency: the model has to query the internet, which takes time. It also adds cost: you pay for the search plus the extra tokens it uses to read results.',
      'Most models let you toggle search off for simple questions and keep your bill small.',
  ],
  "web-search-models::Which models have it": [
      'Claude via Claude.ai. ChatGPT with the web-search setting. Gemini with Google search built in. Some API tiers have search available; check the provider.',
  ],
  "hallucinations::The fundamental problem": [
      'A language model predicts the next word based on patterns. "The capital of France is" -> model predicts "Paris." That happens to be true.',
      '"The capital of Somalia is" -> the model predicts from statistical patterns. There is no fact database inside. If Somalia appears often near "Mogadishu" and "capital" in the training data, it goes with that. But if it predicts something false, it still sounds confident. That\'s a hallucination.',
  ],
  "hallucinations::Common hallucinations": [
      'Fake citations: "A study by X shows Y" (no such study). Fake quotes: "Einstein said Z" (he didn\'t). Confident wrong facts: "The Earth\'s capital city" (doesn\'t exist). Inventing code that doesn\'t work.',
  ],
  "hallucinations::How to reduce them": [
      'Ask for sources. Ask it to cite the training data it\'s using. Use web search for current facts. Feed it documents it can reference. Ask it to admit uncertainty.',
      'For critical work (medical, legal, financial), verify outputs independently. Models are not authoritative sources.',
  ],
  "open-source-vs-closed-source::The divide": [
      'Closed-source models (ChatGPT, Claude, Gemini) are built and run by the company. You pay for API access or a subscription. You don\'t see the weights or training data.',
      'Open-source models (Llama, Mistral, DeepSeek) publish the weights. You can download, run locally, modify, and fine-tune. You own and operate it.',
  ],
  "open-source-vs-closed-source::Open source wins on:": [
      'Freedom: modify how you want. Privacy: run on your hardware, no data leaves your server. Cost: once downloaded, free to run. Transparency: see how it works.',
  ],
  "open-source-vs-closed-source::Closed source wins on:": [
      'Capability: the best models (for now) are closed. Safety: dedicated teams catch edge cases. Latency: you don\'t operate servers. Updates: the company improves the model, you get the latest.',
  ],
  "open-source-vs-closed-source::The practical question": [
      'For consumer use: closed-source is simpler. For enterprises with privacy needs: open-source wins. For maximum capability: closed. For maximum control: open.',
      'The gap is closing. Some open models rival closed flagships now. Let the benchmarks decide for you.',
  ],
  "how-do-neural-network-weights-work::What are weights?": [
      'Weights are numbers inside a neural network, like tiny dials on a massive control panel. During training, the network adjusts millions of these dials until it gets good at its job.',
      'Think of them like the volume knob on a speaker. Turn it up, the sound gets louder. In a network, "turn up" a weight and that input has more effect on the output.',
  ],
  "how-do-neural-network-weights-work::How they work: the multiplication": [
      'Each input gets multiplied by its weight. A weight of 0 means "this input doesn\'t matter." A weight of 2 means "pay double attention to this input." So if an input is 0.5 and its weight is 2, the product is 1.0.',
      'Then all those products get added together. That sum is the output of the layer. The equation below is the whole operation, and it repeats billions of times across a model.',
  ],
  "how-do-neural-network-weights-work::Why they matter": [
      'A model\'s knowledge lives in its weights. They encode everything the network learned during training: what a dog looks like in pixels, what makes good code, the patterns in human speech. Change the weights, the model\'s behavior changes.',
      'When you "fine-tune" a model, you\'re tweaking its weights. When someone sells a model, they\'re selling the weights (and the architecture that uses them).',
  ],
  "how-do-neural-network-weights-work::The training process": [
      'Training a model is a loop: (1) Make a guess with the current weights, (2) See how wrong it is, (3) Adjust the weights to be less wrong, (4) Repeat with the next batch of data.',
      'This happens millions of times. Each tiny adjustment nudges the weights towards better predictions. After weeks or months, the weights are "just right" for the task, and you have a trained model.',
  ],
  "how-do-neural-network-weights-work::A concrete example": [
      'Imagine training a model to predict house prices. Inputs might be: square footage, number of bedrooms, location. Weights learn how much each factor matters. Maybe the model learns: "100 extra square feet is worth $15,000, but being one neighborhood over costs $50,000."',
      'Those relative values are encoded in the weights. They\'re the model\'s learned understanding of the housing market, baked into numbers.',
  ],
  "how-do-neural-network-weights-work::Advanced: stacking layers": [
      'One neuron doing multiply-and-add is neat, but the magic starts when you stack them. The outputs of one layer become the inputs of the next, so the second layer works with patterns the first layer found, and the third layer works with patterns of patterns.',
      'Watch the animation below: values enter on the left, and each layer computes its neurons from the layer before it. This exact flow happens every time you send a message to an AI model. The only difference is scale: thousands of layers, millions of neurons.',
  ],
  "understand-image-classification::Meet Doodle-64": [
      'The demo on this page is a real model, so we gave it a real model card, just like the ones providers publish for GPT or Claude. Doodle-64 is a single-layer binary image classifier with exactly 64 parameters: one weight per pixel of its 8×8 input grid. Its input is 64 numbers (1 for ink, 0 for blank), and its output is two probabilities that always sum to 100%.',
      'Sixty-four parameters sounds like a toy next to a frontier model\'s hundreds of billions, and it is. But "parameter" means exactly the same thing in both: one learned number that multiplies one input. When a model page on this site says "70B parameters", it means 70 billion of the same little dials you can see, all at once, in the heatmap below.',
  ],
  "understand-image-classification::From pixels to predictions": [
      'Image classification sounds mystical, but it\'s the same math as everything else in neural networks: inputs, weights, multiplication, and addition.',
      'A pixel grid, like the 8x8 grid below, gets flattened into 64 numbers (0 for black, 1 for white). Each number is an input. Each input gets multiplied by its learned weight. The products all add up to a score for "this is a 3" and another score for "this is an E." Whichever score is higher wins.',
  ],
  "understand-image-classification::What the network learns": [
      'During training, the network adjusts its weights to recognize meaningful patterns. It doesn\'t learn "a 3 has a line on the right." A programmer didn\'t tell it that. Instead, through thousands of examples, the weights naturally become sensitive to the features that matter: curves, edges, connected regions.',
      'The demo below shows all 64 of its weights as an 8x8 grid of colors: green pixels are evidence for "3", red pixels are evidence for "E", and transparent pixels are ignored. You can also watch your drawing flow through the network, from 64 inputs to 2 outputs, and see the confidence it produces. A real image classifier with millions of weights learns far richer patterns, but the mechanics are the same.',
  ],
  "understand-image-classification::Why this matters for real models": [
      'Vision models like Claude\'s or GPT-4\'s vision capability work on the same principle, scaled up. They process photos, screenshots, charts. The network has learned to recognize objects, text, and patterns, all through millions of learned weights.',
      'Every model\'s understanding of images lives in those weights. That\'s why changing weights changes what the model sees, and why different models see images differently.',
      'And it isn\'t just vision. An LLM answering "what comes next in this sentence?" is doing the same thing Doodle-64 does: multiply inputs by learned weights, add them up, and turn the scores into probabilities. Doodle-64 chooses between 2 answers with 64 parameters; an LLM chooses between ~200,000 possible next tokens with billions. The only gap is size.',
  ],
  "understand-image-classification::Try it yourself": [
      'Below, draw on the pixel grid or use the example buttons. You\'re seeing how a tiny network makes a prediction. The confidence score tells you how sure the classifier is. When you draw something ambiguous, halfway between 3 and E, watch the confidence drop, just like a real model.',
  ],
  "how-neural-networks-recognize-digits::Meet Doodle-525": [
      'Doodle-525 is the second model in our lab, and its model card shows what one extra layer costs and buys. It reads the same 64-pixel grid as Doodle-64, but instead of mapping pixels straight to an answer, it spends 448 weights (plus 7 biases) turning pixels into 7 stroke detections, then 70 more weights turning strokes into 10 digit scores. Total: 525 parameters for a 10-way choice, where Doodle-64 needed 64 for a 2-way choice.',
      'That budget is the whole story of neural network design: more possible answers and subtler distinctions demand more parameters, and layering lets the parameters share work. The 7 stroke detectors are reused by all 10 digits, the way an LLM\'s early layers are reused by every sentence it will ever read.',
  ],
  "how-neural-networks-recognize-digits::Why one layer stops being enough": [
      'The 3-vs-E classifier got away with a single layer because one pixel could settle the argument: ink on the left edge means E, ink on the right curve means 3. With ten digits that trick collapses. An 8 contains every pixel of a 3, a 9 contains every pixel of a 7, so no single pixel is evidence for exactly one digit.',
      'The fix is the most important idea in deep learning: don\'t go straight from pixels to answers. First recognize parts, then reason about combinations of parts. That "first" step is a hidden layer.',
  ],
  "how-neural-networks-recognize-digits::Layer 1 finds strokes first": [
      'The demo below has seven hidden neurons, and each one is a stroke detector: a top bar, a middle bar, a bottom bar, and four vertical lines. Each detector\'s weights cover just the pixels of its stroke. You can see them as seven mini heatmaps, each in its own color. When you draw most of a stroke, its detector fires.',
      'Notice what these neurons don\'t know: anything about digits. The top-bar detector fires for a 5, a 7, and an 8 alike. It has one tiny job, done with a handful of weights.',
  ],
  "how-neural-networks-recognize-digits::Layer 2 combines strokes into digits": [
      'The second layer is where digits exist. Each of the ten outputs holds a recipe: +1 for every stroke the digit uses, -1 for every stroke it doesn\'t. A firing detector pushes up the digits that want its stroke and pushes down the ones that don\'t. A silent detector votes in reverse, because a missing bottom bar really is evidence for a 4 and against an 8.',
      'Softmax then turns the ten scores into probabilities that sum to 100%. Draw an 8 and leave out the middle bar: the network\'s vote swings to 0, exactly the digit whose recipe matches what you actually drew.',
  ],
  "how-neural-networks-recognize-digits::This is exactly what deep networks do": [
      'Real image models are this demo scaled up. Their early layers learn edge and color detectors, middle layers combine edges into textures and shapes, and late layers combine shapes into "cat ear" or "handwritten 7". Nobody programs those features. Training finds them, the way our stroke detectors were chosen by hand here.',
      '"Deep" in deep learning just means many hidden layers stacked, each reasoning about the patterns the previous one found. Two layers read seven strokes; a hundred layers can read a photograph.',
      'If you want to see the next rung of that ladder, Doodle-918 does this same job with a second hidden layer that turns strokes into shapes (loops, curves and spines) before naming a digit. It is the same demo, one layer deeper, and it reads every digit at over 99% confidence.',
  ],
  "how-neural-networks-recognize-digits::Try it yourself": [
      'Use the example buttons to load a clean digit, then vandalize it. Erase one stroke, add another, and watch the stroke detectors switch on and off and the probabilities slide between the digits that share those strokes. Then press play on the network animation to watch the whole forward pass: pixels light detectors, detectors vote on digits.',
  ],
  "what-is-gradient-descent::Nobody chooses the weights": [
      'Every model in this lab so far arrived with its weights already set. Doodle-64 got its 64 numbers from a rule we wrote by hand: positive where a 3 has ink, negative where an E does. That was honest teaching but dishonest engineering, because no real model is built that way. Nobody at OpenAI sat down and picked a value for weight number 4,000,000,001.',
      'Real weights are found by training, and gradient descent is the basic procedure behind the models on this site. Doodle-64 makes that training loop small enough to inspect.',
  ],
  "what-is-gradient-descent::Start with a shrug": [
      'This training run starts by filling every weight with a small random number. The model has no information yet, so the values stay close to zero and its first predictions stay cautious. It begins with an honest "I have no idea" instead of a confident guess.',
      'Doodle-64 could also learn from zero weights. Its pixels appear in different training examples, so they receive different updates even when they start equal. We use a random start because real training runs often begin that way, and because changing the seed lets you compare several downhill paths. A seed also makes any one path exactly reproducible.',
  ],
  "what-is-gradient-descent::One number for \"how wrong are we?\"": [
      'Before you can improve, you need a score. That score is the loss. Show the model a training drawing, let it produce a probability that the drawing is a 3, and compare that against the truth. A confident right answer scores near zero. A confident wrong answer scores enormously. Average that over every training example and you have one number summarizing the model\'s badness.',
      'Now the whole of training has a shape: change the weights so the loss goes down. Nothing else. Every trick in modern machine learning is a variation on that one sentence.',
  ],
  "what-is-gradient-descent::The slope tells you which way is downhill": [
      'Picture the loss as a landscape. Each of the 64 weights is a direction you can walk, and your altitude is how wrong you are. You want the valley. The catch: you cannot see the landscape. You can only feel the ground under your feet.',
      'That is enough. Calculus hands you the slope in each direction: if I nudge this one weight up, does the loss rise or fall, and how steeply? The collection of all 64 slopes is called the gradient. Take a small step against it, downhill in every direction at once, and your loss is a little lower than before. Do it again. That is gradient descent, all of it.',
      'For our classifier the slope works out to something almost suspiciously simple: for each training image, take the model\'s prediction, subtract the true answer, and multiply by the pixel. Predicted 0.9 when the answer was 1? Barely wrong, tiny nudge. Predicted 0.9 when the answer was 0? Very wrong, big nudge, and every pixel that was lit takes the blame.',
  ],
  "what-is-gradient-descent::The learning rate is the size of your stride": [
      'The gradient says which way to go. It does not say how far. That is the learning rate, and it is the one dial that most reliably ruins a training run.',
      'Set it too small and training crawls: correct direction, thousands of tiny steps, a bill to match. Set it too large and you leap clean over the valley and land higher up the far slope, then overcorrect back, bouncing wider and wider until the loss goes to infinity. Practitioners call that diverging, and it is spectacular to watch once and miserable to debug twice. The demo uses a middling rate, so the descent is quick but stays smooth.',
  ],
  "what-is-gradient-descent::Watch 64 weights find their values": [
      'The animation above records a real training run. Sixty-four weights begin as random scatter, while a bias starts at zero. The lines move quickly when the model is wrong, then flatten as its corrections shrink.',
      'Generate a seed, train, and scrub through the result. The 8x8 heatmap resolves into useful evidence for the familiar examples in its training set. Then draw in the test panel and see those learned numbers make a prediction.',
  ],
  "what-is-gradient-descent::Valleys that are not the valley": [
      'Doodle-64 has 65 adjustable numbers: 64 pixel weights and one bias. Its logistic loss is convex, so it does not contain the local valleys shown in the 2D and 3D teaching views above. Those polynomial views make slopes, basins, and starting points visible.',
      'Deep networks have non-convex loss surfaces in millions or billions of dimensions. No screen can show all of them at once, but a two-dimensional surface can still show what it means to follow a local slope.',
      'A local minimum is a dip that is lower than everything immediately around it but not the lowest place on the map. Gradient descent only feels the ground beneath it, so at the bottom of a local dip the slope is flat and training stops improving. The weights work, just less well than they could have. A plateau is worse company: a wide flat stretch where the gradient is nearly zero and training seems to have stalled, sometimes for a very long time, even though better ground lies just ahead. Saddle points are flat in one direction and downhill in another, and in high dimensions they far outnumber true local minima.',
      'The escapes are mostly nudges. Noise helps: real training computes the gradient on a small random batch of examples at a time, so the path jitters and can rattle out of shallow dips. Momentum helps: keep some velocity from the last step so you roll across flat ground instead of stopping on it. And multiple random restarts help, which is the deepest reason those starting weights are random. Different starting points explore different parts of the landscape.',
  ],
  "what-is-gradient-descent::This is how every model on this site was made": [
      'Scale is the only difference between the animation above and the training of a frontier model. Swap 64 weights for hundreds of billions. Swap ten pixel drawings for a large fraction of the public internet. Swap "is this a 3?" for "what token comes next?". Swap 120 epochs on your laptop for months on tens of thousands of GPUs.',
      'The loop does not change: guess, measure how wrong you are, follow the slope downhill, repeat. When a lab says a model cost hundreds of millions of dollars to train, this is the thing that cost the money: an unfathomable number of very small steps down a hill nobody can see.',
  ],
  "how-llms-predict-the-next-word::The smallest language model that could": [
      'Doodle-64 and Doodle-525 recognize things. Parrot-43 generates things, which makes it the closest cousin of ChatGPT and Claude in our lab. Its entire education is the nine sentences shown above, and its entire brain is 43 counts: how many times each word followed each other word in those sentences.',
      'That\'s all "training" means here. Read the data, count the pairs. "the cat" appears three times, so after "the", the word "cat" gets 3 votes. Divide the votes by the total and you have probabilities. When you click a word in the demo, the highlighted corpus shows you exactly which sentences cast those votes. Nothing is hidden, because there is nothing else.',
  ],
  "how-llms-predict-the-next-word::Generation is prediction in a loop": [
      'To write a sentence, Parrot-43 does what every LLM does: predict the next word, append it, and predict again from the new ending. Click through a few choices and you can splice its training sentences into one it was never taught, like "my cat sat on the fence". That is generation: new sentences out of old counts.',
      'Now press "Always pick the favorite" and watch it get stuck chanting "the cat ate my cat ate my…". Always taking the single most likely word is a real failure mode in big models too. It\'s part of why LLMs add a dash of randomness, called temperature, when they pick from their probabilities.',
      'You\'ll also notice what it can never do: say a word it hasn\'t seen. Its 22-word vocabulary is the entire universe as far as it\'s concerned. And when you steer it onto a rare word like "flew", it has exactly one recorded continuation and marches straight down it. Tiny training data makes a tiny parrot.',
  ],
  "how-llms-predict-the-next-word::What LLMs do differently": [
      'Three upgrades separate Parrot-43 from GPT or Claude. First, context: Parrot-43 looks at one previous word; an LLM weighs thousands of previous tokens at once (that\'s what the transformer\'s attention is for). Second, generalization: an LLM doesn\'t store counts in a table. It compresses the patterns of its training data into billions of weights, the same multiply-and-add weights as Doodle-64, so it can handle sentences it has never seen. Third, scale: instead of nine sentences, most of the internet; instead of a 22-word vocabulary, ~200,000 tokens.',
      'But the job description never changes. Every reply from a frontier model is next-token prediction repeated thousands of times: score every possible continuation, turn scores into probabilities, pick one, append, repeat. If you understand why Parrot-43 says "cat" after "the", you understand what a trillion-dollar industry is scaling up.',
  ],
  "how-llms-predict-the-next-word::Where the hallucinations come from": [
      'Parrot-43 also demonstrates the famous LLM failure mode in miniature. Ask it to continue "my" and it says "cat" or "homework". Neither is true. They\'re just the likeliest continuations of its training data. Likely and true are different things. An LLM with billions of parameters blurs that line much more convincingly, but the gap never fully closes. That\'s a hallucination, and now you\'ve watched one get built.',
  ],
  "how-word-embeddings-predict-the-next-word::From a lookup table to a meaning map": [
      'Parrot-43 is a lookup table. It only remembers which word followed which. Show it a word from outside its training and it has nothing to say. Frontier language models work differently, and Parrot-2D shows you the first upgrade. Every word gets its own small list of numbers, called an embedding, and the model predicts from those numbers.',
      'Parrot-2D gives every word just two numbers, and both numbers mean something you can read. The map above the demo places each word by those two numbers. Once a word is a point on a map, "what comes next" becomes a question about meaning, and you can watch the answer light up.',
  ],
  "how-word-embeddings-predict-the-next-word::Two numbers that mean something": [
      'The first number is friendliness. Alice is friendly, so she sits on the right. Bob is unfriendly, so he sits on the left. The second number is role. Alice and Bob are people, so they sit low. "greets" and "ignores" are verbs, so they sit high. Two numbers put every word in its own corner of the map.',
      'A frontier embedding gives a word thousands of numbers, and nobody labels what each one means. Parrot-2D shrinks that down to two numbers you can name. That is the trade the whole lesson rests on. You give up the scale of a frontier model and you get a picture you can look at.',
  ],
  "how-word-embeddings-predict-the-next-word::Meaning drives the prediction": [
      'Now build a sentence and watch the map. When you land on Bob, the model rings him with gold and lights up the words it expects next. The bright one is "ignores". That is the unfriendly verb, and the training sentences taught the model that an unfriendly person is usually followed by an unfriendly verb. The friendly verb "greets" still glows a little, because a couple of training sentences broke the pattern on purpose.',
      'This is why the model needs meaning. The words that light up after Bob are the words that sit near where an unfriendly verb should sit. You can read the prediction straight off the map, which is something a plain lookup table can never let you do.',
  ],
  "how-word-embeddings-predict-the-next-word::The network behind the map": [
      'The map is a picture. Underneath it runs a small neural network, and now you can watch it work. It has three layers. On the left is one node for every word, and the current word switches on. In the middle sit two hidden nodes, and those two nodes are the two meanings you already know. The top node holds the friendliness of the current word, and the bottom node holds its role. On the right is one node for every word that could come next, plus a period for ending the sentence.',
      'Pick a word on the left and follow the signal. The left wires copy the current word\'s two numbers into the two hidden nodes, so choosing Bob lights both hidden nodes at minus one, unfriendly and a person. From there the signal spreads to the outputs, and the brightest bar is the word most likely to come next. Choose Bob and the top bar is "ignores", the same answer the map gives.',
      'This is the shape of every model on this site, shrunk until you can see it. A word comes in, a hidden layer turns it into a handful of numbers about its meaning, and an output layer turns those numbers into a next-word guess. A frontier model has thousands of hidden numbers and billions of wires. Parrot-2D has two hidden numbers you can name, so the whole path fits on one screen.',
  ],
  "how-word-embeddings-predict-the-next-word::Filling in the middle of the map": [
      'The four starter words sit in the four corners, which makes friendly and unfriendly look like the only two choices. Press "Add Charlie and sees" and two new words appear in the middle. Charlie is a person who is neither friendly nor unfriendly, so he sits between Alice and Bob. "sees" is a verb that is neither, so it sits between "greets" and "ignores".',
      'The middle of the map is where meaning stops being a light switch and becomes a dial. Charlie can be followed by a friendly verb or an unfriendly one, because his sentences went both ways. Frontier embeddings are dials all the way down, which is how a model can tell "warm" from "hot" from "scalding" using nothing but numbers.',
  ],
  "how-word-embeddings-predict-the-next-word::This is what frontier embeddings do": [
      'Every large language model starts by turning each word into an embedding, a long list of numbers that places the word in a space of meaning. Words that behave alike end up near each other, the same way Alice and Charlie sit near each other here. The model never sees the word "king". It sees the point where "king" lives, and it predicts from the neighborhood.',
      'Parrot-2D has two dimensions you can read. A frontier model has thousands you cannot. The job is the same in both. Look up the current word as a point, find the points that tend to come next, and turn how close they are into probabilities. If you can read the prediction off this little map, you have seen the first thing every frontier model does with your words.',
      'There is one thing two numbers cannot do. Parrot-2D sees only the single word in front of it, so it cannot tell "Bob" the speaker from "Bob" the one being spoken to. Fixing that needs a sense of where a word sits in the sentence, and a way to look back at the words before it. That idea is called attention, and it is the subject of the next lab model.',
  ],
  "bayesian-statistics::Beliefs as numbers": [
      'Bayesian statistics starts from one idea: a probability is a degree of belief, and evidence should move it. You begin with a prior (what you believed before the new evidence) and end with a posterior (what you believe after). The rule for getting from one to the other is Bayes\' theorem, published in Thomas Bayes\' posthumous 1763 essay and in use ever since, from spam filters to medical screening to language models.',
      'The classic setup is a medical test. Suppose 1% of people have an illness, the test catches 90% of the people who have it, and it also flags 10% of the people who don\'t. You test positive. How worried should you be? Most people guess "about 90%". The real answer is 1 in 12, and the tree below shows exactly why.',
  ],
  "bayesian-statistics::The theorem, in one line": [
      'Bayes\' theorem says: P(A | B) = P(B | A) · P(A) / P(B). Read it as "the probability of A given that you observed B". For the test: P(sick | positive) = P(positive | sick) · P(sick) / P(positive). Three numbers you know (how accurate the test is, how common the illness is, how often the test comes back positive overall) combine into the one number you want.',
      'The denominator, P(positive), is the piece people forget. It counts every way a positive can happen: true positives from the sick and false positives from the healthy. When the illness is rare, the healthy group is enormous, and even a small false-positive rate produces a crowd of false alarms that swamps the genuine cases.',
  ],
  "bayesian-statistics::Walk the tree": [
      'The tree makes the formula physical. The first fork splits 1000 people into sick and healthy. The second fork splits each group by test result. Multiply the probabilities along a path and you get the joint probability at the leaf: with the default numbers, 10 people are sick and 9 of them test positive, while 990 are healthy and 99 of them test positive anyway.',
      'Now Bayes\' theorem is just reading the tree: of the 108 people holding a positive result, 9 are actually sick. 9 / 108 = 1/12 ≈ 8.3%. Drag the prior up and watch the posterior climb; a positive test means much more when the illness is common. Drag the false-positive rate to zero and the posterior snaps to 100%, because a test that never cries wolf is believed absolutely.',
  ],
  "bayesian-statistics::Why the answer feels wrong": [
      'The mistake the 90% guess makes has a name: base-rate neglect. It reads P(sick | positive) and P(positive | sick) as the same number, when the whole point of Bayes\' theorem is that they aren\'t. The test is 90% accurate about sick people; that says nothing by itself about how many positive results are sick people.',
      'Psychologists Daniel Kahneman and Amos Tversky documented this bias in the 1970s, and Gerd Gigerenzer later showed the fix the tree uses: translate probabilities into natural frequencies, meaning counts of people, and the confusion mostly disappears. "9 real cases out of 108 positives" is very hard to misread. "90% sensitive" invites it.',
  ],
  "bayesian-statistics::The same math predicts the next word": [
      'Language models live on conditional probability too: P(next word | words so far) is the quantity every LLM computes, over and over. The demo below adds the Bayesian twist. Its training data has a hidden variable (is this a weather sentence or a cooking sentence?) and every word you pick is evidence about it.',
      'Watch the belief bar. "the" opens sentences in both corpora, so it moves nothing. "rain" appears only in weather sentences, so Bayes\' theorem drops the cooking belief to zero, and the next-word prediction sharpens from a 50/50 blend of two topics into one confident voice.',
  ],
  "bayesian-statistics::From two topics to a trillion parameters": [
      'This is the standard probabilistic view of language modeling: the chain rule of probability factors a sentence into next-word conditionals, the framing textbooks like Jurafsky and Martin\'s Speech and Language Processing build on. Our demo\'s two-topic mixture is the same trick at doll-house scale: infer what kind of text you\'re in, then predict accordingly.',
      'A modern LLM doesn\'t keep an explicit topic variable or apply Bayes\' theorem symbol by symbol. It learns one giant conditional distribution directly from data. But the behavior you just produced by hand, early words acting as evidence that reshapes the probability of later words, is exactly what makes an LLM finish "the rain" differently from "the pan". Condition on evidence, update, predict. That\'s Bayes\' idea, running at a trillion parameters.',
  ],
  "why-neural-networks-need-more-layers::Meet Doodle-918": [
      'Doodle-918 reads the same 8×8 grid as Doodle-525 and answers the same question. The difference is entirely in the middle. Doodle-525 goes from pixels to strokes to digits. This model goes from pixels to stroke primitives to shapes to digits, and that one extra stop costs 393 parameters and lifts its worst digit from 94% confidence to over 99%.',
      'This is the third and last model in our vision lab, and the three of them together tell the whole story of depth in about a thousand parameters. Doodle-64 maps pixels straight to an answer. Doodle-525 puts one layer of parts in between. Doodle-918 puts two layers in between, and the second one is where the model stops counting and starts seeing.',
  ],
  "why-neural-networks-need-more-layers::What the two-layer model can't say": [
      'Doodle-525 works, and its stroke detectors are useful features. But its output layer only tallies which of the seven strokes are lit. To that model, a 0 is a checklist that says six particular strokes are present and one is absent. It has no way to represent the fact that those six strokes form a closed loop, because "closed loop" is not a stroke.',
      'That matters the moment a drawing gets messy. A checklist degrades one item at a time. When you smudge a stroke, the tally drifts toward whatever digit has the next-most-similar checklist. A model that knows the loop is still closed does not care that the line making it is thin.',
  ],
  "why-neural-networks-need-more-layers::Layer 1: smaller parts than before": [
      'The first change is counterintuitive. Doodle-918\'s first layer finds smaller features than Doodle-525\'s. Each horizontal bar is cut into a left half and a right half, and that gives the model 10 primitives instead of 7.',
      'The reason is composition. You cannot build a loop out of pieces that are already loop-sized. If a "top bar" is atomic, the network can never notice that the left end of it joins the upper-left line while the right end joins the upper-right one. Finer parts give the next layer something to combine. Real convolutional networks make the same trade. Their first layer finds tiny oriented edges, which are the least interesting features in the whole model, because everything else is assembled from them.',
  ],
  "why-neural-networks-need-more-layers::Layer 2: where shapes live": [
      'The second layer is the new one, and it holds eight shape detectors: a top loop, a bottom loop, a waist, two open curves, a straight right spine, a flat base and a flat cap. Each detector is an AND over primitives. It wants all of a specific set, and some detectors also refuse to fire if a particular primitive is present.',
      'That veto is what separates a circle from a corner. The "top loop" detector and the "open curve, left gap" detector want the same cap and the same right-hand side. The only difference is that the loop requires the upper-left line and the curve requires its absence. One weight flips from positive to negative, and the model can tell a closed shape from an open one. This is exactly the pattern the issue behind this page asked for: circular tops in 8, 9 and 0, circular bottoms in 8, 6 and 0, open curves in 2, 5 and 3, straight lines in 1, 4 and 7.',
      'These shapes are also shared. A top loop is reused by three digits, and a flat base is reused by seven. Reuse is the whole economic argument for a hidden layer. Eight shapes are cheaper than ten separate digit templates, and they generalize better, because a smudged loop is still a loop.',
  ],
  "why-neural-networks-need-more-layers::Layer 3: a very short argument": [
      'By the time the signal reaches the output layer, the hard work is done. Every digit has its own distinct fingerprint across those eight shapes, so the last layer is a simple vote. Each shape a digit shows adds a point, and each shape it lacks subtracts one. Eighty weights are enough to name all ten digits.',
      'Those weights come from the model itself. It runs its own first two layers over the reference drawing of each digit and reads off which shapes light up. That is the closest a hand-built model gets to training. You show it the examples, and the answer falls out.',
      'There is one honest wrinkle. A 0 is an 8 without the waist, and a 2 is a 3 leaning the other way, so a few pairs sit a single shape apart. Layer 3 therefore keeps a quiet direct line back to layer 1, and it consults the raw primitives at about a third of the volume it gives the shapes. Real vision models do the same thing, and they call it a skip connection. When an abstraction throws away something a later layer still needs, you let that layer look back.',
  ],
  "why-neural-networks-need-more-layers::What depth actually buys": [
      'You can load an 8, rub out its lower-left line, and watch the bottom loop switch off while the model reads a 9. That makes sense, because a 9 is an 8 with the bottom loop opened up. If you rub out the middle bar instead, the waist goes quiet and the model reads a 0. Doodle-525 reaches the same answers by tallying strokes. Doodle-918 gets there by noticing that a loop is gone, and that is why it stays confident when the drawing is imperfect and the two-layer model wavers.',
      'That difference is the entire reason deep learning is deep. Every layer you add lets the model describe its input in a vocabulary the previous layer could not reach: first pixels, then edges, then shapes, then objects. A modern image model stacks dozens of these layers, and training discovers all the middle vocabularies on its own. Ours were chosen by hand here so that you could read them.',
      'If you have not yet, you can run the two-layer model on the same digits and compare. Both models get the right answer. The interesting comparison is how sure each of them is, and what it takes to confuse them.',
  ],
  "why-neural-networks-need-more-layers::Try it yourself": [
      'You can draw a digit, or load one with the example buttons, and then start vandalizing it. Erase half a stroke and watch a primitive dim without any shape switching off. Erase the whole stroke and watch a shape collapse, taking a digit\'s score down with it. Add a stroke that a shape forbids and watch that shape veto itself even though everything it needs is drawn.',
      'Then press play on the network animation and watch all three hops in order. The pixels wake the primitives they belong to, the primitives assemble into shapes, and the shapes vote on the digits. The whole model is four columns, three layers, and 918 numbers, with no magic anywhere in it.',
  ],
}
