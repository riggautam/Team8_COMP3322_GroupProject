// Loads the Maps script once. Later calls reuse the same promise.
let loading = null

export function loadGoogleMaps(apiKey) {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps)
  }

  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      // geometry is only here so we can turn Google's route line into map points
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry`
      script.async = true
      script.onload = () => resolve(window.google.maps)
      script.onerror = () => reject(new Error('Google Maps failed to load'))
      document.head.appendChild(script)
    })
  }

  return loading
}
