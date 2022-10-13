        
    let carrito = [];
    const divisa = '$';
    const DOMitems = document.querySelector('#items');
    const DOMcarrito = document.querySelector('#carrito');
    const DOMtotal = document.querySelector('#total');
    const DOMbotonVaciar = document.querySelector('#boton-vaciar');
    const miLocalStorage = localStorage;

    //DOM HTML

    function renderizarProductos() {
        fetch("/stock.json")
        .then((response) => response.json())
        .then((productos) => {
            productos.forEach((info) => {
                // Estructura
                const miNodo = document.createElement('div');
                miNodo.classList.add('card', 'col-sm-4');
                // Body
                const miNodoCardBody = document.createElement('div');
                miNodoCardBody.classList.add('card-body');
                // Titulo
                const miNodoTitle = document.createElement('h5');
                miNodoTitle.classList.add('card-title');
                miNodoTitle.textContent = info?.nombre;
                // Imagen
                const miNodoImagen = document.createElement('img');
                miNodoImagen.classList.add('img-fluid', 'h-50');
                miNodoImagen.setAttribute('src', info?.imagen);
                // Precio
                const miNodoPrecio = document.createElement('p');
                miNodoPrecio.classList.add('card-text');
                miNodoPrecio.textContent = `${divisa}${info?.precio}`;
                // Boton 
                const miNodoBoton = document.createElement('button');
                miNodoBoton.classList.add('btn', 'bg-dark', 'text-light');
                miNodoBoton.textContent = 'COMPRAR';
                miNodoBoton.setAttribute('marcador', info?.id);
                miNodoBoton.addEventListener('click', anyadirProductoAlCarrito);
                
                miNodoCardBody.appendChild(miNodoImagen);
                miNodoCardBody.appendChild(miNodoTitle);
                miNodoCardBody.appendChild(miNodoPrecio);
                miNodoCardBody.appendChild(miNodoBoton);
                miNodo.appendChild(miNodoCardBody);
                DOMitems.appendChild(miNodo);
            })
        });
    };
    

    


    //FORMULARIO

    const form = document.getElementById("form");
    const correoForm = document.getElementById("correoForm");

    form.addEventListener("submit", validarFormulario);

    function validarFormulario(e){
        e.preventDefault();
        
        const correo = correoForm.value;
        let expReg= /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
        let esValido = expReg.test(correo)
        
        esValido == true ? (swalCorreoVerificado (), document.getElementById("form").reset()) : swalCorreoInvalido ();

        
    };

    //SWEET ALERT

    function swalCorreoVerificado (){
        Swal.fire({
            icon: "success",
            title: "¡Estás registrado!",
            text: "Recibirás noticias y ofertas a tu correo."
            
            
        })    
    }

    function swalCorreoInvalido (){
        Swal.fire({
            icon: "error",
            title: "¡Correo Invalido!",
            text: "Ingrese un correo valido."
            
            
        })    

    }
    


   //CARRITO

    function anyadirProductoAlCarrito(evento) {
        carrito.push(evento.target.getAttribute('marcador'))
        renderizarCarrito();
        guardarCarritoEnLocalStorage();
    };

    function renderizarCarrito() {

        DOMcarrito.textContent = '';

        const carritoSinDuplicados = [...new Set(carrito)];

        carritoSinDuplicados.forEach((item) => {

            fetch("/stock.json")
            .then((response) => response.json())
            .then((productos) => {
                const miItem = productos.filter((itemBaseDatos) => {

                    return itemBaseDatos.id === parseInt(item);
                });

                const numeroUnidadesItem = carrito.reduce((total, itemId) => {

                    return itemId === item ? total += 1 : total;
                    
                }, 0);

                const miNodo = document.createElement('li');
                miNodo.classList.add('list-group-item', 'text-right', 'mx-2');
                miNodo.textContent = `${numeroUnidadesItem} x ${miItem[0]?.nombre} - ${divisa}${miItem[0]?.precio}`;
                const miBoton = document.createElement('button');
                miBoton.classList.add('btn', 'btn-danger', 'mx-5');
                miBoton.textContent = 'X';
                miBoton.style.marginLeft = '1rem';
                miBoton.dataset.item = item;
                miBoton.addEventListener('click', borrarItemCarrito);
                miNodo.appendChild(miBoton);
                DOMcarrito.appendChild(miNodo);
            })    
        });

        DOMtotal.textContent = calcularTotal();
    };

    function borrarItemCarrito(evento) {
        const id = evento.target.dataset.item;
        carrito = carrito.filter((carritoId) => {
            return carritoId !== id;
        });
        renderizarCarrito();
        guardarCarritoEnLocalStorage();

    };

   
    function calcularTotal() {
        fetch("/stock.json")
        .then((response) => response.json())
        .then((productos) => {

            return carrito.reduce((total, item) => {
        
                const miItem = productos.filter((itemBaseDatos) => {
                    return itemBaseDatos.id === parseInt(item);
                });
                return total + miItem[0].precio;
            }, 0).toFixed(2);
            })
            
    };

    function vaciarCarrito() {
        carrito = [];
        renderizarCarrito();
        localStorage.clear();

    };

    function guardarCarritoEnLocalStorage () {
        miLocalStorage.setItem('carrito', JSON.stringify(carrito));
    };

    function cargarCarritoDeLocalStorage () {
        miLocalStorage.getItem('carrito') !== null &&  (carrito = JSON.parse(miLocalStorage.getItem('carrito')))
    };


    DOMbotonVaciar.addEventListener('click', () => {
        Swal.fire({
            title: "¿Está seguro?",
            text: "Su carrito quedará vacío",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Vaciar",
            cancelButtonText: "Cancelar"
        }).then((result) =>{
            if(result.isConfirmed){
                vaciarCarrito(),
                Swal.fire({
                    title:"Carrito Vacío",
                    text:"Su carrito se ha vaciado",
                    icon:"success",
                    timer: 1500
            })
            }
        })
    });



    cargarCarritoDeLocalStorage();
    renderizarProductos();
    renderizarCarrito();


