const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be string',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().min(1900).max(2030, 'Maxim number is 2030').positive(),
  director: z.string(),
  duration: z.number().positive(),
  rate: z.number().positive().min(0).max(10).default(1),
  poster: z.string().url({
    message: 'The poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Drama', 'Crime', 'Adventure', 'Comedy', 'Action', 'Terror', 'Horror', 'Fantasy'], {
      required_error: 'Genre is required',
      invalid_type_error: 'Genre must be a array of enum'
    })
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validateParcialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validateParcialMovie
}
