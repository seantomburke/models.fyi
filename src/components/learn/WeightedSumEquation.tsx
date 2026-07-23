import { MathBlock } from '../MathBlock'

/**
 * The weighted-sum equation for the weights topic, rendered as real math.
 * The reference use of MathBlock: LaTeX in, KaTeX out, plain-text fallback
 * in prerendered HTML.
 */
export function WeightedSumEquation() {
  return (
    <MathBlock
      tex={String.raw`\text{output} = (\text{input}_1 \times \text{weight}_1) + (\text{input}_2 \times \text{weight}_2) + \dots`}
      fallback="output = (input1 × weight1) + (input2 × weight2) + ..."
    />
  )
}
