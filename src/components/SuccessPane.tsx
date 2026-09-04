type SuccessPaneProps = {
  decisionCount: number
  targetVersion: string
  onBack: () => void
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M16.5 10h-12M8.5 5.75 4.25 10l4.25 4.25" />
    </svg>
  )
}

export function SuccessPane({
  decisionCount,
  targetVersion,
  onBack,
}: SuccessPaneProps) {
  const decisionLabel = decisionCount === 1 ? 'decision' : 'decisions'

  return (
    <section className="decision-pane success-pane" aria-labelledby="success-title">
      <div className="success-pane__inner">
        <p className="success-pane__eyebrow">Configuration complete</p>
        <h1 id="success-title">Your configuration is ready</h1>
        <p className="success-pane__description">
          Generated for golangci-lint {targetVersion} from {decisionCount}{' '}
          policy {decisionLabel}.
        </p>
        <button className="back-button" onClick={onBack} type="button">
          <BackIcon />
          <span>Back to questions</span>
        </button>
      </div>
    </section>
  )
}
