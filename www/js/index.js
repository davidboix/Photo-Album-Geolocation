let arrayJSON = JSON.parse(localStorage.getItem("albumFotos")) || [];
var app = {
  init: function () {
    let posicio = document.getElementById("espaiBoto");
    let espaiFotos = document.getElementById("mostrarImatge");
    let createAlbum = document.getElementById("espaiBoto2");
    let listAlbums = document.getElementById("espaiBoto3");
    let deleteAlbums = document.getElementById("espaiBoto4");
    let ferFoto = document.getElementById("espaiBoto5");
  },
  onErrorGetDir: function (error) {
    console.error("Error al acceder al directorio:", error);
  },
  // TODO 2 hores
  obtenirPosicio: function () {
    let info = document.getElementById("contenedorMsg");
    let array = app.cargarDadesLs();
    
    navigator.geolocation.getCurrentPosition(
      (position) => {

        let customIcon = L.icon({
          iconUrl: "img/iconoMarkerFoto.png",
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
        });

        if (app.mapa) {
          app.mapa.remove();
        }

        let longitud = position.coords.longitude;
        let latitud = position.coords.latitude;

        app.mapa = L.map("mapa", {
          center: [position.coords.latitude, position.coords.longitude],
          zoom: 18,
        });

        L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {}
        ).addTo(app.mapa);

        L.marker([latitud, longitud]).addTo(app.mapa);

        array.forEach((element) => {
          if (element.latitud != "") {
            console.log(element.latitud);
            console.log(element.longitud);
            let marker = L.marker(
              [element.latitud, element.longitud],
              { icon: customIcon }
            )
              .bindPopup(
                `<img class="fotosAlbum" src="${element.rutaDirectori}${element.nomFoto}" alt="Imatge no disponible">`
              )
              .addTo(app.mapa);
          }
        });
      },

      (error) => {
        console.log(error);
      },
      { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }
    );
  },
  // TODO 10 HORES: Problemes amb els permissos del dispositiu (revisar config.xml ja que ho hem solucionat d'aquesta manera.)
  // i el codi en si, ja que no arribava a funcionar de cap manera.
  crearAlbum: function () {
    navigator.geolocation.getCurrentPosition((position) => {
      let longitud = position.coords.longitude;
      let latitud = position.coords.latitude;
      console.log(`Longitud: ${longitud} \nLatitud: ${latitud}`);
      app
        .cridaApi(latitud, longitud)
        .then((res) => {
          window.resolveLocalFileSystemURL(
            cordova.file.externalRootDirectory + "DCIM/",
            function (directoryEntry) {
              directoryEntry.getDirectory(
                res.address["town"],
                { create: true },
                function (newDirectoryEntry) {
                  console.log("Directori creat", newDirectoryEntry.toURL());
                  app.capturarFoto(
                    "",
                    newDirectoryEntry,
                    res.address["town"],
                    latitud,
                    longitud
                  );
                },
                app.onErrorGetDir()
              );
            },
            function (error) {
              console.log("Error:" + error);
            }
          );
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  // 1 hora - 1:45 minuts
  cridaApi: async function (latitud, longitud) {
    try {
      const resposta = await fetch(
        "https://nominatim.openstreetmap.org/reverse?lat=" +
        latitud +
        "&lon=" +
        longitud +
        "&format=json"
      );
      if (!resposta.ok) {
        throw new Error("Nope");
      }
      let respostaJSON = await resposta.json();
      return respostaJSON;
    } catch (error) {
      console.error("El error es el seguent: " + error);
    }
  },
  // 30-45 minuts
  llistarDirectorisFitxers: function () {
    window.resolveLocalFileSystemURL(
      cordova.file.externalRootDirectory + "DCIM/",
      function (directoryEntry) {
        let llegim = directoryEntry.createReader();
        llegim.readEntries(
          function (entries) {
            if (entries.length > 0) {
              entries.forEach(function (entry) {
                if (entry.isDirectory) {
                  if (entry.isDirectory != "Camera") {
                    console.log("Directori: " + entry.name);
                  }
                  if (entry.name == "Cervera" || entry.name == "Tàrrega") {
                    let array = app.accedirDirectoris(entry.name);
                    console.log(array);
                  }
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
  createFile: function (directoryEntry, fileName) {
    directoryEntry.getFile(
      fileName,
      { create: true, exclusive: false },
      function (fileEntry) {
        console.log("Arxiu creat:" + fileEntry.toURL());
      },
      function (error) {
        console.error("Error:" + error);
      }
    );
  },
  // 1:30 hora - 1:50hora
  capturarFoto: function (status, directori, nomAlbum, latitud, longitud) {
    cameraOptions = {
      quality: 100,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      correctOrientation: true,
    };

    navigator.camera.getPicture(
      (imageURI) => {
        window.resolveLocalFileSystemURL(
          cordova.file.externalRootDirectory + "Pictures/",
          function (directoryEntry) {
            // Mover la foto al directorio de destino
            window.resolveLocalFileSystemURL(
              imageURI,
              function (fileEntry) {
                let nomFoto = imageURI.substring(imageURI.lastIndexOf("/") + 1);
                nomFoto = Date.now() + ".jpg";
                fileEntry.moveTo(
                  directori,
                  nomFoto,
                  function (newFileEntry) {
                    app.createFile(directori, nomFoto);
                    app.crearLocalStorageMapa(
                      directori.nativeURL,
                      nomAlbum,
                      nomFoto,
                      latitud,
                      longitud
                    );
                  },
                  function (error) {
                    console.error("Error: " + error);
                  }
                );
              },
              function (error) {
                console.error("Error:" + error);
              }
            );
          },
          function (error) {
            console.error("Error: " + error);
          }
        );
      },
      (message) => {
        console.log(message);
      },
      cameraOptions
    );
  },
  crearLocalStorageMapa: function (
    rutaDirectoriLS,
    nomAlbumLS,
    nomFotoLS,
    latitudLS,
    longitudLS
  ) {
    let key = "albumFotos";
    const albumPhoto = {
      rutaDirectori: rutaDirectoriLS,
      nomAlbum: nomAlbumLS,
      nomFoto: nomFotoLS,
      latitud: latitudLS,
      longitud: longitudLS,
    };
    arrayJSON.push(albumPhoto);
    let myJSON = JSON.stringify(arrayJSON);
    localStorage.setItem(key, myJSON);
  },
  // afegirDadesLS: function (nomAlbum) {
  afegirDadesLS: function (nomAlbum, nomFoto, latitud, longitud) {
    let key = "albumFotos";
    let dades = JSON.parse(localStorage.getItem(key));
    if (dades != null) {
      const albumPhoto = {
        nomAlbum: nomAlbum,
        nomFoto: nomFoto,
        latitud: latitud,
        longitud: longitud,
      };
      dades.push(albumPhoto);
      let myJSON = JSON.stringify(dades);
      localStorage.setItem(key, myJSON);
    } else {
      app.crearLocalStorageMapa(nomAlbum);
    }
  },
  cargarDadesLs: function () {
    let dadesLS = localStorage.getItem("fotosSeleccionades");
    let arrayObj = JSON.parse(dadesLS);
    return arrayObj;
  },
  // Temps emprat: 5 - 10 minuts
  canviVista: function () {
    window.location.replace("vista_fotos.html");
  },

  accedirDirectoris: function (nomDirectori) {
    let array = [];
    window.resolveLocalFileSystemURL(
      cordova.file.externalRootDirectory + "DCIM/" + nomDirectori,
      function (directoryEntry) {
        let entradaDirectori = directoryEntry.createReader();
        entradaDirectori.readEntries((entries) => {
          if (entries.length > 0) {
            entries.forEach((entrada) => {
              if (entrada.isFile) {
                let nomFoto = entrada.name;

                let dadesJSON = {
                  nomCiutat: nomDirectori,
                  nomFoto: nomFoto,
                };
                array.push(dadesJSON);
              }
            });
          }
        });
      },
      app.onErrorGetDir()
    );
    return array;
  },

  llegirFitxers: function () {
    let array = app.accedirDirectoris();
    console.log(array);
  },
};
function errorCrearDirectori(directoryEntry) {
  console.log("error");
}
document.addEventListener("click", app.init, false);
document.addEventListener("DOMContentLoaded", app.init, false);
document.addEventListener("deviceready", app.init, false);