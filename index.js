const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())

morgan.token('body', (req) => {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: "4",
        name: "Mary poppendieck",
        number: "39-23-6423122"
    }
]
    app.get('/', (request, response) => {
     response.send('<h1>Hello World!</h1>')
     })

    app.get('/api/persons', (request, response) => {
        response.json(persons)
     })

    app.get('/api/persons/:id', (request, response) => {
     const id = request.params.id
        const person = persons.find(person => person.id === id)

      if (person) {
        response.json(person)
        } 
      else {
         response.status(404).end()
         console.log('Henkilöä ei ole olemassa')
        }
    })

app.delete('/api/persons/:id', (request, response) => {
        const id = request.params.id
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
        console.log('henkilö poistettu')
    })

const generateId = () => {
    const maxId = Math.random() * 1000
     return String(maxId)
    }

app.post('/api/persons', (request, response) => {
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
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)

    response.json(person)
    
    console.log('henkilö lisätty')
})
     
app.get('/info', (request, response) => {
    response.send(`<h2>Phonebook has info for ${persons.length} people</h2>
    <h2>${new Date()}</h2>`)
  })

const PORT = 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
