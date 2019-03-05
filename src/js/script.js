const api = {
  request: async (query, amount) => {
    localStorage.clear()
    const api = new API({
      key: '1e19898c87464e239192c8bfe422f280'
    })
    const stream = await api.createStream(
      'search/' + query + '{' + amount + '}' + '&facet=type(book)'
    )
    stream.pipe(dataProcessor.clean).catch(console.error)
  },
  details: async frabl => {
    localStorage.clear()
    const api = new API({
      key: '1e19898c87464e239192c8bfe422f280'
    })
    const stream = await api.createStream('details/' + frabl)
    stream.pipe(console.log()).catch(console.error)
  }
}

document
  .getElementById('searchButton')
  .addEventListener('click', function(input) {
    var input = document.getElementById('input').value
    api.request(input, 15)
  })

const dataProcessor = {
  clean: data => {
    console.log(data)
    // remove books without genres
    // const cleanedData = data.filter(object => object.genres != null)
    // make cleaned objects from data
    const cleanedObjects = data.map(data => dataProcessor.createObject(data))
    // clean dom and render books
    document.getElementsByClassName('books')[0].innerHTML = ''
    cleanedObjects.map(data => render.drawList(data))
  },
  createObject: data => {
    // format each object
    const object = {
      id: data.id._attributes.nativeid,
      frabl: data.frabl._text,
      author: data.authors
        ? data.authors['main-author']._text
        : 'Author not found',
      title: data.titles['short-title']._text
        ? data.titles['short-title']._text
        : data.titles['short-title'][0]._text,
      genre: data.genres ? data.genres.genre._text : 'Onbekend',
      coverImg: data.coverimages.coverimage[0]
        ? data.coverimages.coverimage[0]._text
        : 'notfound'
    }
    return object
  }
}

const router = {
  initRoutes: () => {
    routie('home', () => {
      api.request('test', 15)
    })
    routie(':frabl', frabl => {
      api.details(frabl)
    })
    routie('home')
  }
}

router.initRoutes()

const render = {
  drawList: data => {
    const markup = `
     <div class="book">
        <h2>
            ${data.title}
        </h2>
        <p class="author">${data.author}</p>
        <p class="genre">${data.genre}</p>
        <a href="#${data.frabl}">Details</a>
     </div>
    `
    document.getElementsByClassName('books')[0].innerHTML += markup
  }
}
