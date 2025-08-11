// Timer Web Worker for precise counting
let timerId = null
let startTime = null
let duration = 0
let isRunning = false

self.onmessage = function(e) {
  const { type, payload } = e.data
  
  switch (type) {
    case 'START':
      startTimer(payload.duration)
      break
    case 'PAUSE':
      pauseTimer()
      break
    case 'RESET':
      resetTimer()
      break
    case 'GET_TIME':
      getCurrentTime()
      break
  }
}

function startTimer(seconds) {
  if (isRunning) return
  
  duration = seconds
  startTime = Date.now()
  isRunning = true
  
  timerId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const remaining = Math.max(0, duration - elapsed)
    
    if (remaining <= 0) {
      clearInterval(timerId)
      isRunning = false
      self.postMessage({ type: 'COMPLETE' })
    } else {
      self.postMessage({ 
        type: 'TICK', 
        payload: { remaining, elapsed } 
      })
    }
  }, 100) // Update every 100ms for smooth animation
}

function pauseTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  isRunning = false
}

function resetTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  isRunning = false
  startTime = null
  duration = 0
}

function getCurrentTime() {
  if (!startTime || !isRunning) {
    self.postMessage({ type: 'TIME_UPDATE', payload: { remaining: duration, elapsed: 0 } })
    return
  }
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const remaining = Math.max(0, duration - elapsed)
  
  self.postMessage({ 
    type: 'TIME_UPDATE', 
    payload: { remaining, elapsed } 
  })
}
