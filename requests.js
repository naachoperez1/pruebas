let offset = 0;
let arregloCasas = []


// Funcion que devuelve un arreglo de 20 propiedades de la API.
async function obtenerArrayCasas(offset) {
  let apiUrl = "http://www.tokkobroker.com/api/v1/property/?format=json&key=2050ca99758e888787396e78be54b6216b1bb34d&lang=es_ar&offset={offset}&limit=106"
  .replace("{offset}", offset);
  // offset += 20;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Ocurrió un error al obtener los datos de la API: " + response.status);
    }
    const jsonData = await response.json();
    const arreglo = jsonData['objects'];
    // console.log(arreglo)
    return arreglo;
  } catch (error) {
    console.error(error);
    return [];
  }
}


function crearElementosHTML(arreglo) {
  const contenedor = document.getElementById('ul-propiedades'); 
  arreglo.forEach(casa => { 
    // creo un li, una imagen y un p.

    let elemento = document.createElement('li');
    let enlace = document.createElement('a');
    let img = document.createElement('img');
    let divTexto = document.createElement('div');
    let divPrecioYArea = document.createElement('div');
    let textoDireccionPropiedad = document.createElement('p');
    let textoUbicacionPropiedad = document.createElement('h4');
    let precioPropiedad = document.createElement('p');
    let areaPropiedad = document.createElement('p')
    let urlPropiedad = "detalle-propiedad.html?id=" + casa.id;

    // les asigno valores a sus atributos.
    enlace.href = urlPropiedad;
    enlace.className = "a-casa";

    elemento.className= "li-casa";
    elemento.id="casa-"+ casa.id;

    img.className = "img-casa";
    img.src = casa['photos'][0]['image'];

    divTexto.className = "div-texto-propiedad";

    divPrecioYArea.className = 'div-precio-area';

    textoDireccionPropiedad.textContent = casa.address;
    textoDireccionPropiedad.className = "p-casa"

    precioPropiedad.textContent = "Precio: " + casa.operations[0].prices[0].currency + " " + parseFloat(casa.operations[0].prices[0].price).toLocaleString();
    precioPropiedad.className = "precio-casa"

    areaPropiedad.textContent = "Area: " + casa.surface + " " + casa.surface_measurement;
    areaPropiedad.className = "area-casa"

    textoUbicacionPropiedad.textContent = casa.location.name;
    textoUbicacionPropiedad.className = "h4-casa"

    // agrego la imagen y el p al li, y este lo agrego al contenedor padre.
    divPrecioYArea.appendChild(precioPropiedad);
    divPrecioYArea.appendChild(areaPropiedad);

    divTexto.appendChild(textoDireccionPropiedad);
    divTexto.appendChild(textoUbicacionPropiedad);
    divTexto.appendChild(divPrecioYArea);

    enlace.appendChild(img);
    enlace.appendChild(divTexto)
    elemento.appendChild(enlace);
    contenedor.appendChild(elemento);
  })
}

// Función para mostrar los detalles de la casa en la página de detalle
function mostrarDetalleCasa(array) {
  const params = new URLSearchParams(window.location.search);
  const casaId = params.get('id');

  const casa = array.find(casa => casa.id === parseInt(casaId));
  buscarImagenesParaSlider(casa);
  getDetallesPropiedad(casa);
  getDescripcion(casa);
  console.log(casa)
  const direccion = casa['address']

  if (casa) {
    const contenedor = document.getElementById('div-titulo-detalle');
    const titulo = document.createElement('h1');

    titulo.className = "titulo-propiedad"
    titulo.textContent = direccion ;
        
    contenedor.appendChild(titulo);
    
  } else {
      // Manejar el caso en el que no se encuentre la casa
      console.log('La casa no se encontró');
  }

  var map = L.map('map').setView([casa.geo_lat, casa.geo_long], 15);
  var marker = L.marker([casa.geo_lat, casa.geo_long]).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
}

function buscarImagenesParaSlider (casa) {
  let contenedorSlider = document.getElementById("container1");
  let contador = 1;
  casa.photos.forEach(foto =>{
    let li = document.createElement("li");
    li.id = "slide" + contador;
    if (contador === 1){
      li.className = "slide-visible";
    }

    let imagen = document.createElement("img");
    imagen.className = "img-slider";
    imagen.src = foto.image;

    li.appendChild(imagen)
    contenedorSlider.appendChild(li);

    contador += 1;
  })

}


function getDetallesPropiedad (casa){
  let contenedor = document.getElementById("detalle-contenido");
  let contenedorServicio = document.getElementById("detalle-servicios");

  let liTipoDePropiedad = document.createElement("li");
  let liUbicacion = document.createElement("li");

  let h4Operacion = document.getElementById("titulo-operacion-detalle");
  h4Operacion.innerHTML = "<strong>" + casa.operations[0].operation_type + "</strong>";
  if (casa.operations[0].operation_type === "Venta"){
    h4Operacion.style.backgroundColor = "red";
  }else{
    h4Operacion.style.backgroundColor = "green";
  }
  let precioOperacion = document.getElementById("precio-operacion-detalle")
  precioOperacion.innerHTML = "<span>" + casa.operations[0].prices[0].currency + "</span> " + parseFloat(casa.operations[0].prices[0].price).toLocaleString();
  // let span1 = document.createElement("p");
  // let span2 = document.createElement("p");

  // span1.textContent = "Tipo de propiedad: ";
  // span2.textContent = "Ubicacion: ";

  // liTipoDePropiedad.appendChild(span1);
  // liUbicacion.appendChild(span2);

  let tipoPropiedad = casa.type.name;
  let ubicacion = casa.location.full_location;

  liTipoDePropiedad.innerHTML = "<strong>Tipo de propiedad: </strong>" + tipoPropiedad;
  liUbicacion.innerHTML = "<strong>Ubicacion: </strong>" + ubicacion;


  let ul = document.createElement("ul");
  ul.className = "ul-detalle";
  let ulServicios = document.createElement("ul");
  ulServicios.className = "ul-servicios";

  ul.appendChild(liTipoDePropiedad);
  ul.appendChild(liUbicacion);

  crearHTMLDetalle(casa,ul, ulServicios);

  contenedor.appendChild(ul);
  contenedorServicio.appendChild(ulServicios);

}

function crearHTMLDetalle(casa, ul , ulServicios) {
  let opciones = ["age", "bathroom_amount","floors_amount","room_amount","suite_amount","surface","roofed_surface"];
  let opcionesEsp = ["Antiguedad", "Baños", "Pisos", "Ambientes", "Dormitorios","Superficie", "Superficie Cubierta"]
  Object.keys(casa).forEach( key => {
    if (opciones.includes(key) && casa[key] >0){
      let liOpcion = document.createElement('li');
      if (key === "surface" || key === "roofed_surface"){
        liOpcion.innerHTML = "<strong>" + opcionesEsp[opciones.indexOf(key)] + ": </strong>" + casa[key] + casa.surface_measurement;
      }else{
        liOpcion.innerHTML = "<strong>" + opcionesEsp[opciones.indexOf(key)] + ": </strong>" + casa[key] ;
      }
      ul.appendChild(liOpcion);
    }
  })


  casa.tags.forEach(servicio => {
    let liServicio = document.createElement('li');
    liServicio.textContent = servicio.name;
    ulServicios.appendChild(liServicio);
  })

}

function getDescripcion (casa){
  let str = casa.rich_description.replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '');
  // let footer = casa.footer.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
  let parrafoHTML = document.getElementById("descripcion");
  parrafoHTML.style.color = "#3e3e3e"
  // console.log(str1)
  parrafoHTML.innerHTML = str ;
}



function isDigit(char) {
  return char >= '0' && char <= '9';
}



obtenerArrayCasas(0).then(arreglo => {
  if (window.location.pathname === '/propiedades.html') {
    crearElementosHTML(arreglo);
    console.log(arreglo);
  } 
  if (window.location.pathname === '/detalle-propiedad.html') {
    mostrarDetalleCasa(arreglo);
  } 
})







