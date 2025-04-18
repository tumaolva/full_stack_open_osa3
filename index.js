require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const app = express()
const morgan = require('morgan')
app.use(express.static('dist'))
app.use(express.json())


morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = []

app.get('/', (request, response) => {
     response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
        Person.find({}).then(persons => {
        response.json(persons)
     })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
       .then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log('henkilö poistettu')
      response.status(204).end()
    })
    .catch(error => next(error))
})
        

// const generateId = () => {
//     const maxId = Math.random() * 1000
//      return String(maxId)
//     }

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Nimi tai numero puuttuu'
        })
     }

    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'Henkilö on olemassa'
        })
    }
    const person = new Person({
       // id: generateId(),
        name: body.name,
        number: body.number,
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })  .catch(error => next(error))
     persons = persons.concat(person)
})

app.put('/api/persons/:id', (request, response, next) => { // tämä ajetaan vain jos sivulla on koitettu lisätä samannimistä henkilöä uudestaan
    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' }) // custom validation käyttöön, kun muokataan henkilön numeroa
      .then(updatedPerson => {
        if (updatedPerson) {
          response.json(updatedPerson)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
})


app.get('/info', (request, response) => {
    response.send(`<h2>Phonebook has info for ${persons.length} people</h2>
    <h2>${new Date()}</h2>`)
  })

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }
  app.use(errorHandler)
  const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
