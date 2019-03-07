const request = {
  search: async (query, amount) => {
    const api = new API({
      key: '1e19898c87464e239192c8bfe422f280'
    })
    const stream = await api.createStream(
      'search/' + query + '{' + amount + '}' + '&facet=type(book)'
    )
    stream.pipe(dataProcessor.clean).catch(console.error)
  },
  detail: async frabl => {
    const api = new API({
      key: '1e19898c87464e239192c8bfe422f280'
    })
    const data = await api.details(frabl)
    dataProcessor.cleanBookData(data)
  },
  related: async book => {
    const api = new API({
      key: '1e19898c87464e239192c8bfe422f280'
    })
    console.log(book)
    const author = book.author
    const genre = book.genre
    let query = ''
    if (!genre || genre === 'Unknown') {
      query = author
    } else {
      query = genre
    }
    const amount = 5
    const stream = await api.createStream(
      'search/' + query + '{' + amount + '}' + '&facet=type(book)'
    )
    stream.pipe(dataProcessor.related).catch(console.error)
  }
}

document
  .getElementById('searchButton')
  .addEventListener('click', function(input) {
    document.getElementsByClassName('books')[0].innerHTML = ''
    render.loading()
    var input = document.getElementById('input').value
    request.search(input, 15)
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
  related: data => {
    console.log(data)
    const cleanedObjects = data.map(data => dataProcessor.createObject(data))
    // clean dom and render books
    cleanedObjects.map(data => render.drawList(data))
  },
  createObject: data => {
    // format each object
    const object = {
      id: data.id._attributes.nativeid,
      frabl: data.frabl._text,
      author: data.authors
        ? data.authors['main-author']._text
        : 'Auteur onbekend',
      title:
        !data.titles || !data.titles['short-title']
          ? 'Titel onbekend'
          : data.titles['short-title']._text ||
            data.titles['short-title'][0]._text,
      genre:
        data.genres && data.genres.genre && data.genres.genre._text
          ? data.genres.genre._text
          : 'Genre onbekend',
      coverImg: data.coverimages.coverimage[0]
        ? data.coverimages.coverimage[0]._text
        : 'Geen afbeelding'
    }
    return object
  },
  cleanBookData: data => {
    const cleanBook = dataProcessor.createObject(data.aquabrowser)
    request.related(cleanBook)
    render.drawDetail(cleanBook)
  }
}
const favorites = []
const obaFacts = [
  'inspireert alle Amsterdammers om te blijven leren',

  'faciliteert een leven lang leren via passend aanbod voor elke leeftijdsgroep',
  'maakt het mogelijk om nieuwe vaardigheden van de 21ste eeuw te leren',
  'heeft bijzondere aandacht voor mensen die moeite hebben met taal en digitale vaardigheden',
  'maakt kennis, cultuur en informatie voor iedereen bereikbaar en toegankelijk',

  'wil vrije toegang bieden tot alle denkbare informatiebronnen en -technologie',
  'is zeven dagen per week beschikbaar met ruime openingstijden van onze vestigingen',
  'biedt een optimale service aan bezoekers op de fysieke en digitale platforms',
  'stimuleert reflectie, ontmoeting en betrokkenheid bij stad en buurt',

  'als ontmoetingsplaats voor diversiteit aan talen en culturen uit de stad',
  'heeft aandacht voor maatschappelijke thema’s zoals gezondheid, zelfredzaamheid, duurzaamheid',
  'werkt intensief samen met groepen en organisaties in stad en buurt'
]

const render = {
  loading: () => {
    let fact = obaFacts[Math.floor(Math.random() * obaFacts.length)]
    const markup = `
    <div class="loading">
    <h3> Een momentje terwijl we je boeken ophalen... </h3>
    <div class="wrapper">
  <div class="cover"></div>
  <div class="page"></div>
  <div class="inner-border"></div>
</div>
    <h2> De OBA ${fact} </h2>
    </div>
    `
    document.getElementsByClassName('books')[0].innerHTML = markup
  },
  drawDetail: data => {
    const markup = `
     <div id="detail">
        <h1>
            ${data.title}
        </h1>
        <img src="${data.coverImg}"></img>
        <h2 class="author">${data.author}</h2>
        <p class="genre">${data.genre}</p>
        <p> Je hebt dit boek geselecteerd</p>
     </div>
    `
    document.getElementsByClassName('books')[0].innerHTML = markup
    favorites.push(data.frabl)
    console.log(favorites)
  },
  addToList: frabl => {
    favorites.push(frabl)
    console.log(favorites)
  },
  drawList: data => {
    const markup = `
     <div class="book">
        <h2>
            ${data.title}
        </h2>
        <p class="author">${data.author}</p>
        <p class="genre">${data.genre}</p>
        <a href="#${data.frabl}">Gerelateerd</a>
     </div>
    `
    document.getElementsByClassName('books')[0].innerHTML += markup
  }
}
const router = {
  initRoutes: () => {
    routie('home', () => {
      document.getElementsByClassName('books')[0].innerHTML = ''
      render.loading()
      request.search('stad', 15)
    })
    routie(':frabl', frabl => {
      document.getElementsByClassName('books')[0].innerHTML = ''
      render.loading()
      request.detail(frabl)
    })
    routie('home')
  }
}

router.initRoutes()
