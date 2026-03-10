/**
 * Screen recorder using MediaRecorder API.
 * Captures the WebGL canvas as a WebM video.
 */
export class CanvasRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private stream: MediaStream | null = null

  isRecording = false

  /**
   * Start recording the canvas.
   * @param canvas - The HTML canvas element to record
   * @param fps - Target framerate (default 30)
   */
  start(canvas: HTMLCanvasElement, fps = 30) {
    if (this.isRecording) return

    // captureStream with fps
    this.stream = canvas.captureStream(fps)
    this.chunks = []

    // Try VP9 first, fall back to VP8, then default
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ]

    let mimeType = ''
    for (const mt of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) {
        mimeType = mt
        break
      }
    }

    const options: MediaRecorderOptions = mimeType ? { mimeType } : {}
    this.mediaRecorder = new MediaRecorder(this.stream, options)

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data)
      }
    }

    this.mediaRecorder.start(100) // collect data every 100ms
    this.isRecording = true
  }

  /**
   * Stop recording and return the video as a Blob URL.
   * Downloads the file automatically.
   */
  stop(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve('')
        return
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)

        // Auto-download
        const a = document.createElement('a')
        a.href = url
        a.download = `can_crush_sim_${Date.now()}.webm`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        this.isRecording = false
        this.chunks = []
        resolve(url)
      }

      this.mediaRecorder.stop()
    })
  }

  /** Cancel recording without saving */
  cancel() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }
    this.isRecording = false
    this.chunks = []
  }
}
