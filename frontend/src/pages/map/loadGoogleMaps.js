// Loads the Maps script once. Later calls reuse the same promise.
let loading = null

export function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.Map) {
    return Promise.resolve(window.google.maps)
  }

  if (!loading) {
    loading = new Promise((resolve, reject) => {
      // With loading=async (Google's recommended way), the libraries are only ready when
      // Google calls the callback named in the URL, not when the script file has loaded.
      window.westMapsReady = () => resolve(window.google.maps)
      const script = document.createElement('script')
      // geometry turns Google's route line into map points; marker is for the pins and the
      // "you are here" dot (AdvancedMarkerElement, which replaces the deprecated Marker).
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry,marker&loading=async&callback=westMapsReady`
      script.async = true
      script.onerror = () => {
        loading = null // let a later visit to the page try again
        reject(new Error('Google Maps failed to load'))
      }
      document.head.appendChild(script)
    })
  }

  return loading
}
