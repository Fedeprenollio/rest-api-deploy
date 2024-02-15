const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')

const moviesJson = require('./movie.json')
const { validateMovie, validateParcialMovie } = require('./schemas/movies')
const PORT = process.env.PORT ?? 3001
const app = express()

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS
const WHITELISTE = ['http://localhost:8080', 'http://localhost:5500']

// solo si no uso cors()
// app.options('/movies/:id', (req, res, next) => {
//   const origin = req.header('origin')
//   if (WHITELISTE.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST,PUT;PATCH')
//   }
// res.send(200)
// })

const corsOptions = {
  origin: function (origin, callback) {
    console.log('ORIGINS', origin)
    // if (WHITELISTE.includes(origin)) {
    //   return callback(null, true)
    // }

    // if (!origin) {
    //   return callback(new Error('Not allowed by CORS1'))
    // }
    // return callback(new Error('Not allowed by CORS2'))
    if (WHITELISTE.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }

}
app.use(cors(corsOptions))

app.disable('x-powered-by')
app.use(express.json())
app.get('/movies', (req, res) => {
//   res.header('Access-Control-Allow-Origin', '*')
  const { genres } = req.query
  if (genres) {
    console.log(genres)
    const movieGenres = moviesJson.filter(movie => movie.genre.some(g => g.toLowerCase() === genres.toLowerCase()))
    if (movieGenres.length > 0) return res.json(movieGenres)

    res.status(404).json({
      message: 'Movies not found',
      code: 404
    })
  }

  res.send(moviesJson)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieId = moviesJson.find(movie => movie.id === id)
  if (movieId) return res.json(movieId)

  res.status(404).json({
    message: 'Movie not found',
    code: 404
  })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    res.status(400).json({
      error: JSON.parse(result.error.message)
    })
  }
  //   const { title, year, director, duration, poster, genre, rate } = req.body

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  moviesJson.push(newMovie)
  res.status(201).json(moviesJson)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params

  const movieIndex = moviesJson.findIndex(movie => movie.id === id)

  if (movieIndex < 0) return app.status(404).json({ message: 'Movie not found' })

  const result = validateParcialMovie(req.body)

  if (result.error) {
    return res.status(400).json(JSON.parse(result.error.message))
  }

  const updateMovie = {
    ...moviesJson[movieIndex],
    ...result.data
  }

  moviesJson[movieIndex] = updateMovie

  return res.json(moviesJson)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = moviesJson.findIndex(movie => movie.id === id)
  console.log(id, movieIndex, moviesJson)
  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not foudn' })

  moviesJson.slice(movieIndex, 1)

  res.json({ message: 'Movie deleted succeful' })
})
app.listen(PORT, () => {
  console.log(`Sever listenig on port http://localhost:${PORT}`)
})
