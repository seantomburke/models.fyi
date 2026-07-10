import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout.tsx'
import { Home } from './pages/Home.tsx'
import { Placeholder } from './pages/Placeholder.tsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="compare"
          element={
            <Placeholder
              title="Compare models"
              metaTitle="Compare AI models — Models.fyi"
              description="Every flagship AI model side by side: benchmark scores, prices, and context windows, explained in plain language."
            />
          }
        />
        <Route
          path="graph"
          element={
            <Placeholder
              title="Graph"
              metaTitle="AI models on a graph — Models.fyi"
              description="Plot AI model performance against price on axes you choose, and spot which models punch above their weight."
            />
          }
        />
        <Route
          path="quiz"
          element={
            <Placeholder
              title="Which model should I use?"
              metaTitle="Which AI model should I use? — Models.fyi"
              description="Answer a few plain-language questions and get an AI model recommendation with the reasoning spelled out."
            />
          }
        />
        <Route
          path="learn"
          element={
            <Placeholder
              title="Learn the basics"
              metaTitle="What is an AI model? — Models.fyi"
              description="What is an LLM? What is GPT? What is a context window? The basics of AI models, explained like you're five."
            />
          }
        />
        <Route
          path="*"
          element={
            <Placeholder
              title="Page not found"
              metaTitle="Not found — Models.fyi"
              description="That page doesn't exist. Head back to the Models.fyi home page to compare AI models."
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App
