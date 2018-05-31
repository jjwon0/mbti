const getServerUrl = (url) => {
  if (window.__ENV__ === 'production') {
    return `https://cryptic-earth-76295.herokuapp.com${url}`;
  }

  return `http://localhost:5000${url}`;
}


export const fetchMBTIClassification = (classifier, mbti) => {
  return fetch(getServerUrl(`/classify/${classifier}`), {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      mbti,
    }),
  })
    .then(response => response.json())
    .then(json => json.mbti)
}


export const fetchMBTIClusters = (numClusters) => {
  return fetch(getServerUrl(`/clusters`), {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      numClusters,
    }),
  })
    .then(response => response.json())
    .then(json => json.clusters)
}
