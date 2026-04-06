import { useState, useRef } from 'react'
import { InferenceClient } from '@huggingface/inference'

const FRIENDLY_ERROR =
  'Model is loading or unavailable. Try again in a few seconds.'

function App() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState('')
  const [error, setError] = useState('')
  const lastImageUrlRef = useRef('')

  const handleGenerate = async () => {
    const token = import.meta.env.VITE_HF_TOKEN

    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.')
      return
    }

    if (!token) {
      setError('Missing VITE_HF_TOKEN. Add it to your .env file and restart.')
      return
    }

    setLoading(true)
    setError('')
    setImage('')

    try {
      const client = new InferenceClient(token)
      const imageBlob = await client.textToImage({
        model: 'black-forest-labs/FLUX.1-schnell',
        inputs: prompt,
      })

      const imageUrl = URL.createObjectURL(imageBlob)

      if (lastImageUrlRef.current) {
        URL.revokeObjectURL(lastImageUrlRef.current)
      }

      lastImageUrlRef.current = imageUrl
      setImage(imageUrl)
    } catch (err) {
      setError(err?.message || FRIENDLY_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <header className="hero">
          <span className="eyebrow">Text-to-Image Studio</span>
          <h1>Turn any idea into a vivid image in seconds.</h1>
          <p>
            Describe the scene, mood, and style you want. Our AI will bring it
            to life instantly.
          </p>
        </header>

        <div className="panel">
          <label className="label" htmlFor="prompt">
            Your prompt
          </label>
          <div className="input-row">
            <input
              id="prompt"
              type="text"
              placeholder="A floating city at sunset, cinematic lighting, ultra-detailed"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>

          {loading && <div className="status">Generating...</div>}
          {error && <div className="error">{error}</div>}
        </div>

        <div className="image-card">
          {image ? (
            <img src={image} alt="Generated result" />
          ) : (
            <div className="placeholder">
              Your image will appear here once it is generated.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
