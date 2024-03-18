const arrayJSON = JSON.parse(localStorage.getItem("fotosSeleccionades")) || [];
let array = [];
var app = {
  init: function () {
    document.getElementById("nomAlbums").addEventListener("DOMContentLoaded", app.mostrarDirectoris(), false);
  },
  canviVista: function () {
    window.location.replace("index.html");
  },
  // Temps emprat: 1 hora
  mostrarDirectoris: function () {
    window.resolveLocalFileSystemURL(
      cordova.file.externalRootDirectory + "DCIM/",
      function (directoryEntry) {
        let llegim = directoryEntry.createReader();
        llegim.readEntries(
          function (entries) {
            // Comprobar si hay archivos o directorios en el directorio DCIM
            if (entries.length > 0) {
              entries.forEach(function (entry) {
                if (entry.isDirectory) {
                  if (entry.name != "Camera") {
                    console.log("Directori: ", entry.name);
                    let nomDirectori = entry.name;
                    app.afegirOption(nomDirectori);
                  }

                } else if (entry.isFile) {
                  console.log("Arxiu:", entry.name);
                  app.afegirFotos();
                }
              });
            } else {
              console.log("El directori esta buit.");
            }
          },
          function (error) {
            console.log(error);
          }
        );
      }
    );
  },
  // Temps: 1:30 
  mostrarArxius: function (nomDirectori) {
    window.resolveLocalFileSystemURL(
      cordova.file.externalRootDirectory + "DCIM/" + nomDirectori,
      function (directoryEntry) {
        let llegim = directoryEntry.createReader();
        llegim.readEntries(
          function (entries) {
            let arrayReves = entries.toReversed();
            if (arrayReves.length > 0) {
              arrayReves.forEach((entry, index) => {
                if (entry.isFile) {
                  console.log(index);
                  console.log("Arxiu:", entry.name);
                  let nomFotoReves = entry.name;
                  app.afegirFotos(directoryEntry.nativeURL + nomFotoReves, index);
                }
              });
            } else {
              console.log("El directori esta buit.");
            }
          },
          function (error) {
            console.log(error);
          }
        );
      }
    );
  },
  // Temps: 30 - 45 minuts
  afegirOption: function (nomDirectori) {
    let nomAlbum = document.createElement("option");
    nomAlbum.setAttribute("id", nomDirectori);
    nomAlbum.setAttribute("value", nomDirectori);
    nomAlbum.setAttribute("class", "album");
    nomAlbum.innerHTML = nomDirectori;
    let coleccioAlbum = document.getElementById("nomAlbums");
    coleccioAlbum.appendChild(nomAlbum);
  },
  // Temps: 30 - 45 minuts
  agafarValor: function () {
    app.netejarDiv();
    let infoAlbum = document.getElementById("nomAlbums");
    let nomAlbum = infoAlbum.value;
    app.mostrarArxius(nomAlbum);
  },
  // Temps: 30 - 45 minuts
  afegirFotos: function (nomFoto, i) {
    let contenedor = document.getElementById("contenedorImatge");
    let imatgeAlbum = document.createElement("img");
    imatgeAlbum.setAttribute("src", nomFoto);
    imatgeAlbum.setAttribute("class", "fotosAlbum");
    imatgeAlbum.setAttribute("id", "fotoAlbum" + i);
    imatgeAlbum.setAttribute("alt", "la imatge no carga");
    imatgeAlbum.setAttribute("title", "imatge");
    imatgeAlbum.setAttribute("onclick", "app.canviClasse(" + i + ")");
    contenedor.appendChild(imatgeAlbum);
  },
  // Temps total: 45 min - 1 hora
  comprovarFotosSeleccioandes: function () {
    
    let arrayFotos = [];

    let foto = document.querySelectorAll(".fotoSeleccionada");

    foto.forEach(element => {
      arrayFotos.push(element);
    });

    return arrayFotos;
  },
  // Temps total: 30 minuts
  mostrarFooter: function () {
    let fotos = document.querySelectorAll(".fotoSeleccionada");

    console.log(fotos);
    fotos.forEach((element, index) => {
      if (index != 0) {
        app.mostrarControl();
      } else {
        app.amagarControl();
      }
    });
  },
  // Temps total: 10 minuts
  mostrarControl: function () {
    let control = document.getElementById("controlDirectoris");
    if (control.classList.contains("controlDirectoriAmagat")) {
      control.classList.remove("controlDirectoriAmagat");
      control.classList.add("controlDirectori");
    }
  },
  // Temps total: 10 minuts
  amagarControl: function () {
    let control = document.getElementById("controlDirectoris");
    if (control.classList.contains("controlDirectori")) {
      control.classList.remove("controlDirectori");
      control.classList.add("controlDirectoriAmagat");
    }
  },
  
  // Temps total: 45 minuts - 1 hora
  canviClasse: function (index) {
    
    let fotoSeleccionada = document.getElementById("fotoAlbum" + index);
    let controls = document.getElementById("controlDirectoris");
    console.log(fotoSeleccionada);
    if (fotoSeleccionada.classList.contains("fotosAlbum")) {
      fotoSeleccionada.classList.remove("fotosAlbum");
      fotoSeleccionada.classList.add("fotoSeleccionada");
      array.push(fotoSeleccionada);
      console.log(array);
    } else {
      fotoSeleccionada.classList.remove("fotoSeleccionada");
      fotoSeleccionada.classList.add("fotosAlbum");
    }
  },
  // Temps emprat: 30 minuts
  crearLocalStorageFoto: function (nomFoto) {
    if (nomFoto) {
      let afegirLS = window.confirm(`Esteu segurs que voleu mostrar la imatge al mapa amb referencia: ${nomFoto}?`);
      if (afegirLS) {
        let array = app.cargarDadesLs();
        array.forEach(index => {
          if (index.nomFoto == nomFoto) {
            app.crearLocalStorage(index.rutaDirectori, index.nomAlbum, index.nomFoto, index.latitud, index.longitud);
          }
        });
      }
    } else {
      console.log("aquesta foto no existeix dins de LS");
    }
  },
  // Temps total: 1 hora
  enviarFotos: function () {
    let fotosSeleccionades = document.querySelectorAll(".fotoSeleccionada");
    let confirm = window.confirm(`Esteu segurs que voleu pujar les fotos seleccionades?`);
    if (confirm) {
      window.alert("Per visualitzar la ubicacio de la foto en el mapa, heu de visualitzar el mapa");
      app.netejarDiv();
      fotosSeleccionades.forEach(element => {
        app.comprovarFoto(element.src);
      });
    } else {
      window.alert("No s'ha realitzat l'operació pertinent!");
    }
  },
  // Temps total: 1 hora
  comprovarFoto: function (fotoSeleccionada) {
    let arrayFoto = fotoSeleccionada.split("/");
    let nomFoto = arrayFoto.pop();
    console.log(nomFoto);
    let arrayComprovar = app.cargarDadesLs();
    arrayComprovar.forEach(element => {
      if (element.nomFoto === nomFoto) {
        app.netejarDiv();
        app.crearLocalStorage(element.rutaDirectori, element.nomAlbum, nomFoto, element.latitud, element.longitud);
      } else {
        console.log("no existeix");
      }

    });
  },
  // Temps total: 20 minuts
  crearLocalStorage: function (rutaDirectoriLS, nomAlbumLS, nomFotoLS, latitudLS, longitudLS) {
    let key = "fotosSeleccionades";
    const albumPhoto = { rutaDirectori: rutaDirectoriLS, nomAlbum: nomAlbumLS, nomFoto: nomFotoLS, latitud: latitudLS, longitud: longitudLS };
    arrayJSON.push(albumPhoto);
    let myJSON = JSON.stringify(arrayJSON);
    localStorage.setItem(key, myJSON);
  },
  // Temps total: 20 minuts
  cargarDadesLs: function () {
    let dadesLS = localStorage.getItem("albumFotos");
    let arrayObj = JSON.parse(dadesLS);
    return arrayObj;
  },
  // Temps Total: 1:30 - 1:45 hores
  eliminarOption: function () {
    let nomDirectori = document.getElementById("nomAlbums");
    if (nomDirectori.selectedIndex != 0) {
      let confirm = window.confirm(`Esteu segurs que voleu eliminar el directori anomenat: ${nomDirectori.value}`);
      if (confirm) {
        app.eliminarDirectoriLS("albumFotos");
        app.eliminarDirectoriLS("fotosSeleccionades");
        app.eliminarDirectori(nomDirectori.value);
        app.netejarDiv();
        app.treureOption(nomDirectori);
        console.log("ho has eliminat...");
      } else {
        window.alert("Heu cancelat la operació...");
      }
    }
  },
  // Temps total: 1hora - 1:15 hora
  eliminarDirectoriLS: function (nomLS) {

    let arr = localStorage.getItem(nomLS);

    let nomDirectori = document.getElementById("nomAlbums").value;

    let array = JSON.parse(arr);

    let arrayDefinitu = [];
    if (array) {
      array.forEach(element => {
        if (element.nomAlbum === nomDirectori) {
          console.log(element.nomAlbum);
        } else {
          arrayDefinitu.push(element);
        }
      });
    }

    localStorage.setItem(nomLS, JSON.stringify(arrayDefinitu));
    
  },
  // Temps emprat : 15 minuts
  netejarDiv: function () {
    let contenedorImatge = document.getElementById("contenedorImatge");
    if (contenedorImatge.hasChildNodes()) {
      while (contenedorImatge.firstChild) {
        contenedorImatge.removeChild(contenedorImatge.firstChild);
      }
    }
  },
  // Temps emprat: 15 minuts
  treureOption: function (nomDirectori) {
    let optionSeleccionat = nomDirectori.selectedIndex;
    if (optionSeleccionat != 0) {
      nomDirectori.remove(optionSeleccionat);
      return true;
    }
    return false;
  },
  // Temps emprat: 40 minuts
  eliminarDirectori: function (nomAlbum) {
    let rutaDirectori = `${cordova.file.externalRootDirectory}DCIM/`;
    window.resolveLocalFileSystemURL(rutaDirectori, function (dirEntry) {
      dirEntry.getDirectory(nomAlbum, { create: false }, function (subDirEntry) {
        subDirEntry.removeRecursively(function () {
          console.log('El directori sha eliminat correctament!');
        }, function (error) {
          console.error(error);
        });
      }, function (error) {
        console.error(error);
      });
    }, function (error) {
      console.error(error);
    });
  },
  // Temps emprat: 1 - 1:15 hora
  borrarFotos: function () {
    let infoAlbum = document.getElementById("nomAlbums");
    let nomAlbum = infoAlbum.value;
    let div = document.getElementById("contenedorImatge");
    let control = document.getElementById("controlDirectoris");
    let arrayFotos = app.comprovarFotosSeleccioandes();

    let confirm = window.confirm("Esteu segurs que voleu eliminar les fotos seleccionades?");
    if (confirm) {
      if (div.hasChildNodes()) {
        for (let i = arrayFotos.length - 1; i >= 0; i--) {
          let element = arrayFotos[i];
          let nom = element.src.split("/");
          let nomFoto = nom.pop();
          app.eliminarElementsLS("albumFotos", i);
          app.eliminarElementsLS("fotosSeleccionades", i);
          app.eliminarFotosDirectori(nomAlbum, nomFoto);
          div.removeChild(element);
        }
      }
    } else {
      window.alert("No s'ha realitzat l'operacio pertinent");
    }
  },
  // Temps total: 10 minuts
  isExistsClass: function (nomElement, nomClasseExistent, nomClassSubstituir) {
    if (nomElement.classList.contains(nomClasseExistent)) {
      nomElement.classList.remove(nomClasseExistent);
      nomElement.classList.add(nomClassSubstituir);
    }
  },
  // Temps total: 45 - 1 hora
  eliminarFotosDirectori: function (nomAlbum, nomFoto) {
    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory + "DCIM/" + nomAlbum, function (dir) {
      dir.getFile(nomFoto, { create: false }, function (fileEntry) {
        fileEntry.remove(function () {
          console.log('Archivo eliminado correctamente.');
        }, function (error) {
          console.log(error.code);
        });
      }, function (error) {
        console.log(error.code);
      });
    }, function (error) {
      console.log(error.code);
    });
  },
  // Temps total: 30 - 45  minuts
  eliminarElementsLS: function (nomLS, index) {
    let array = JSON.parse(localStorage.getItem(nomLS));
    array.splice(index, 1);
    localStorage.setItem(nomLS, JSON.stringify(array));
  }
};
document.addEventListener("deviceready", app.init, false);